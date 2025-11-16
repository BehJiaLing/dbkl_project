import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosConfig";

const API_KEY = "BToNdHB1ok4umLD2P0UpgXjB4RLI0yWD";
const API_SECRET = "_C8seFzywSZgJMNMJMY1w7XAkqMbs3IP";

const VerifyForm = () => {
    const [ic, setIc] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const storedIc = localStorage.getItem("icValue");
        if (storedIc) {
            setIc(storedIc);
        }

        const tempImageData = localStorage.getItem("tempImageData");
        setIsImageUploaded(!!tempImageData);
    }, []);

    const handleCameraNavigation = () => {
        localStorage.setItem("icValue", ic);
        navigate("/camera");
    };

    // ---- API HELPERS --------------------------------------------------------

    const updateUserStatus = async (ic, status) => {
        try {
            const res = await axiosInstance.put("/api/user/update-status", {
                ic,
                status,
            });

            if (res.status !== 200) {
                const msg =
                    res.data?.message ||
                    "Failed to update status. Please try again.";
                throw new Error(msg);
            }
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                "Failed to update status. Please try again.";
            throw new Error(msg);
        }
    };

    const incrementSubmitAttend = async (ic) => {
        try {
            const res = await axiosInstance.put(
                "/api/user/increment-submit-attend",
                { ic }
            );

            if (res.status !== 200) {
                const msg =
                    res.data?.message ||
                    "Failed to increment submission. Please try again.";
                throw new Error(msg);
            }

            if (res.data?.message === "Maximum submit attempts reached") {
                throw new Error("Maximum submit attempts reached");
            }
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                "Failed to increment submission. Please try again.";
            throw new Error(msg);
        }
    };

    // ------------------------------------------------------------------------

    const isWithinDistance = (lat1, lon1, lat2, lon2, toleranceKm) => {
        const earthRadius = 6371; // km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;
        return distance <= toleranceKm;
    };

    const verifyFaceWithFacePlusPlus = async (imageUrl1, imageUrl2) => {
        const formData = new FormData();
        formData.append("api_key", API_KEY);
        formData.append("api_secret", API_SECRET);
        formData.append("image_url1", imageUrl1);
        formData.append("image_url2", imageUrl2);

        const response = await fetch(
            "https://api-us.faceplusplus.com/facepp/v3/compare",
            {
                method: "POST",
                body: formData,
            }
        );
        return await response.json();
    };

    const uploadImageToImgbb = async (imageData) => {
        if (typeof imageData !== "string") {
            console.error("Invalid image data provided:", imageData);
            return null;
        }

        const apiKey = "c76cdeefbf39db597e37f74329a4138b"; // your Imgbb key
        const cleanedImageData = imageData.replace(
            /^data:image\/\w+;base64,/,
            ""
        );

        const formData = new FormData();
        formData.append("key", apiKey);
        formData.append("image", cleanedImageData);

        const response = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: formData,
        });
        const result = await response.json();
        if (result.success) {
            return result.data.url;
        } else {
            console.error("Failed to upload image to Imgbb:", result.message);
            return null;
        }
    };

    const normalizeIc = (v) => (v || "").toString().replace(/\D/g, "");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isImageUploaded) {
            alert("Please upload your image.");
            return;
        }

        setLoading(true);

        try {
            // 1) Get all users (already decrypted by backend)
            const res = await axiosInstance.get("/api/user/user-data");
            const data = res.data || [];

            const user = data.find(
                (u) => normalizeIc(u.ic) === normalizeIc(ic)
            );

            if (!user) {
                alert("Invalid IC Number: Please enter a valid IC number.");
                setLoading(false);
                return;
            }

            if (user.deleted) {
                alert(
                    "Your account has been disabled. Please contact the administrator."
                );
                setLoading(false);
                return;
            }

            if (user.submitAttend >= 3) {
                alert("You have reached the maximum submission attempts.");
                setLoading(false);
                return;
            }

            // 2) Get current location
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const userLatitude = position.coords.latitude;
                        const userLongitude = position.coords.longitude;

                        const latStored = Number(user.latitude);
                        const lonStored = Number(user.longitude);

                        const locationStatus = isWithinDistance(
                            latStored,
                            lonStored,
                            userLatitude,
                            userLongitude,
                            0.1 // ~100m
                        )
                            ? "matched"
                            : "does not match";

                        const uploadedImageData =
                            localStorage.getItem("tempImageData");
                        const originalImageUrl = user.image; // data:image/jpeg;base64,...

                        if (!originalImageUrl) {
                            throw new Error("Original image data is missing.");
                        }

                        const originalImageUploadUrl =
                            await uploadImageToImgbb(originalImageUrl);
                        const uploadedImageUrl =
                            await uploadImageToImgbb(uploadedImageData);

                        if (!uploadedImageUrl || !originalImageUploadUrl) {
                            throw new Error(
                                "Failed to upload the images. Please try again."
                            );
                        }

                        const isImageMatched =
                            await verifyFaceWithFacePlusPlus(
                                uploadedImageUrl,
                                originalImageUploadUrl
                            );

                        const confidence = isImageMatched.confidence || 0;
                        console.log(
                            "Face Verification Result:",
                            isImageMatched
                        );

                        // 3) Decide status
                        let newStatus = "red";
                        let message = "";

                        if (locationStatus === "matched" && confidence > 50) {
                            newStatus = "green";
                            message =
                                "Submitted Successfully: Location and image matched.";
                        } else if (
                            locationStatus === "does not match" &&
                            confidence > 50
                        ) {
                            newStatus = "yellow";
                            message =
                                "Submitted Successfully: Location does not match; Image matched.";
                        } else if (
                            locationStatus === "matched" &&
                            confidence <= 50
                        ) {
                            newStatus = "red";
                            message =
                                "Submitted Successfully: Location matched; Image does not match.";
                        } else {
                            newStatus = "red";
                            message =
                                "Submitted Successfully: Location and image does not match.";
                        }

                        // 4) Update backend (status + submitAttend)
                        await updateUserStatus(user.ic, newStatus);
                        await incrementSubmitAttend(user.ic);

                        alert(message);

                        // 5) Reset form state
                        setIc("");
                        localStorage.removeItem("tempImageData");
                        setIsImageUploaded(false);
                        localStorage.removeItem("icValue");
                        setLoading(false);
                    } catch (err) {
                        console.error("Verification flow error:", err);
                        alert(err.message || "Verification failed.");
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Failed to retrieve location. Please try again.");
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch user data. Please try again."
            );
            setLoading(false);
        }
    };

    return (
        <div style={isMobile ? styles.pageWrapperMobile : styles.pageWrapper}>
            <div style={isMobile ? styles.containerMobile : styles.container}>
                <h2 style={styles.title}>Verify</h2>
                <p style={styles.subtitle}>Please fill in your credentials</p>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label>IC:</label>
                        <input
                            type="text"
                            value={ic}
                            onChange={(e) => setIc(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <button
                            type="button"
                            onClick={handleCameraNavigation}
                            style={styles.button}
                        >
                            Upload Image
                        </button>
                    </div>
                    <button
                        type="submit"
                        style={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        height: "100vh",
        display: "flex",
        justifyContent: "flex-end",
        paddingRight: "250px",
        alignItems: "center",
        backgroundImage: "url('/assets/login/background.png')",
        backgroundColor: "#2d2d3a",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    },
    pageWrapperMobile: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundImage: "url('/assets/login/background.png')",
        backgroundColor: "#2d2d3a",
        backgroundSize: "cover",
        backgroundPosition: "left center",
        backgroundRepeat: "no-repeat",
    },
    container: {
        maxWidth: "300px",
        width: "100%",
        padding: "20px",
        backgroundColor: "#3e3e4f",
        borderRadius: "10px",
        textAlign: "left",
    },
    containerMobile: {
        maxWidth: "100%",
        width: "90%",
        padding: "15px",
        backgroundColor: "#3e3e4f",
        borderRadius: "10px",
        textAlign: "left",
    },
    title: {
        color: "white",
        marginBottom: "10px",
    },
    subtitle: {
        color: "white",
        marginBottom: "20px",
    },
    inputGroup: {
        marginBottom: "30px",
        textAlign: "left",
        color: "white",
    },
    input: {
        width: "100%",
        padding: "10px",
        marginTop: "5px",
        backgroundColor: "#494959",
        borderRadius: "5px",
        border: "none",
        color: "white",
        fontSize: "16px",
        height: "35px",
        boxSizing: "border-box",
    },
    button: {
        width: "40%",
        padding: "10px",
        backgroundColor: "#3e3e4f",
        color: "white",
        border: "2px solid white",
        borderRadius: "5px",
        cursor: "pointer",
        marginLeft: "1%",
    },
    submitButton: {
        width: "70%",
        padding: "10px",
        backgroundColor: "#00b3a7",
        color: "white",
        border: "none",
        borderRadius: "50px",
        cursor: "pointer",
        marginTop: "55px",
        margin: "0 auto",
        display: "block",
    },
};

export default VerifyForm;

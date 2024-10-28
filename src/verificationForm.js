import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_TOKEN = "1a00ca71f0414c83a2fa11401c8abd36";

const VerifyForm = () => {
    const [ic, setIc] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isImageUploaded, setIsImageUploaded] = useState(false);

    useEffect(() => {
        const tempImageData = localStorage.getItem("tempImageData");
        setIsImageUploaded(!!tempImageData);
    }, []);

    const handleCameraNavigation = () => {
        navigate("/camera");
    };

    const base64ToBlob = (base64, mimeType) => {
        if (typeof base64 !== "string") {
            console.error("Invalid base64 data:", base64);
            return null;
        }
        const parts = base64.split(",");
        if (parts.length !== 2) {
            console.error("Invalid base64 format:", base64);
            return null;
        }
        const byteCharacters = atob(parts[1]);
        const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
        return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
    };

    const updateUserStatus = async (ic, status) => {
        try {
            const response = await fetch(`http://localhost:3001/api/user/update-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ic, status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || "Failed to update status. Please try again.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    const incrementSubmitAttend = async (ic) => {
        try {
            const response = await fetch(`http://localhost:3001/api/user/increment-submit-attend`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ic }),
            });

            const result = await response.json();
            if (!response.ok) {
                alert(result.message || "Failed to increment submission. Please try again.");
            } else if (result.message === 'Maximum submit attempts reached') {
                alert("You have reached the maximum submission attempts.");
            }
        } catch (error) {
            console.error("Error updating submitAttend:", error);
            alert("Failed to increment submission. Please try again.");
        }
    };

    const isWithinDistance = (lat1, lon1, lat2, lon2, tolerance) => {
        const earthRadius = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * (Math.PI / 180)) *
                  Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (earthRadius * c) <= tolerance; // Returns true if within tolerance
    };

    const verifyFace = async (image, person_uuid) => {
        const myHeaders = new Headers();
        myHeaders.append("token", API_TOKEN);

        const formData = new FormData();
        formData.append("photo", image);

        try {
            const response = await fetch(`https://api.luxand.cloud/photo/verify/${person_uuid}`, {
                method: 'POST',
                headers: myHeaders,
                body: formData,
            });
            return await response.json();
        } catch (error) {
            console.error('Error in verifyFace:', error);
            throw new Error('Face verification failed');
        }
    };

    const compareImages = async (uploadedImageData, originalImageData) => {
        const uploadedImageBlob = base64ToBlob(uploadedImageData, "image/jpeg");
        const originalImageBlob = base64ToBlob(originalImageData, "image/jpeg");
    
        if (!uploadedImageBlob || !originalImageBlob) {
            console.error("Invalid image data for comparison.");
            return false;
        }
    
        try {
            const result = await verifyFace(uploadedImageBlob, originalImageData);
            console.log("Verification Result:", result); // Log the result for debugging
            return result.status === "success";
        } catch (error) {
            console.error("Error during face verification:", error);
            return false;
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isImageUploaded) {
            alert("Please upload your image.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/user/user-data');
            const data = await response.json();
            const user = data.find(user => user.ic === parseInt(ic, 10)); // Use base 10 for parsing

            if (user) {
                if (user.submitAttend >= 3) {
                    alert("You have reached the maximum submission attempts.");
                    setLoading(false);
                    return;
                }

                navigator.geolocation.getCurrentPosition(async (position) => {
                    const userLatitude = position.coords.latitude;
                    const userLongitude = position.coords.longitude;

                    const locationStatus = isWithinDistance(user.latitude, user.longitude, userLatitude, userLongitude, 0.1)
                        ? "matched"
                        : "does not match";

                    const uploadedImageData = localStorage.getItem("tempImageData"); 
                    const originalImageData = user.imageOri; 

                    const isImageMatched = await compareImages(uploadedImageData, originalImageData);

                    if (locationStatus === "matched" && isImageMatched) {
                        await updateUserStatus(user.ic, "green");
                        await incrementSubmitAttend(user.ic);
                        alert("Submitted Successfully: Location and image matched.");
                    } else if (locationStatus === "matched") {
                        await updateUserStatus(user.ic, "yellow");
                        await incrementSubmitAttend(user.ic);
                        alert("Submitted Successfully: Image does not match.");
                    } else {
                        alert("Submitted Successfully: Location does not match.");
                    }

                    // Reset form state
                    setIc("");
                    localStorage.removeItem("tempImageData");
                    setIsImageUploaded(false);
                    setLoading(false);
                }, (error) => {
                    console.error("Error getting location:", error);
                    alert("Failed to retrieve location. Please try again.");
                    setLoading(false);
                });
            } else {
                alert("Invalid IC Number: Please enter a valid IC number.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Failed to fetch user data. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
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
                        <button type="button" onClick={handleCameraNavigation} style={styles.button}>
                            Upload Image
                        </button>
                    </div>
                    <button type="submit" style={styles.submitButton} disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
};
// Inline styles
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
    container: {
        maxWidth: "300px",
        width: "100%",
        padding: "20px",
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

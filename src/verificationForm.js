import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = "BToNdHB1ok4umLD2P0UpgXjB4RLI0yWD";
const API_SECRET = "_C8seFzywSZgJMNMJMY1w7XAkqMbs3IP";

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

    const verifyFaceWithFacePlusPlus = async (imageUrl1, imageUrl2) => {
        const formData = new FormData();
        formData.append("api_key", API_KEY);
        formData.append("api_secret", API_SECRET);
        formData.append("image_url1", imageUrl1);
        formData.append("image_url2", imageUrl2);

        try {
            const response = await fetch("https://api-us.faceplusplus.com/facepp/v3/compare", {
                method: "POST",
                body: formData,
            });
            return await response.json();
        } catch (error) {
            console.error("Error in verifyFaceWithFacePlusPlus:", error);
            throw new Error('Face verification failed');
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
            const user = data.find(user => user.ic === parseInt(ic, 10));
    
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
    
                    if (!originalImageData) {
                        alert("Original image data is missing.");
                        setLoading(false);
                        return;
                    }
    
                    // Convert original image data (array of bytes) to Base64 using Uint8Array
                    const byteCharacters = new Uint8Array(originalImageData.data);
                    let binaryString = '';
                    for (let i = 0; i < byteCharacters.length; i++) {
                        binaryString += String.fromCharCode(byteCharacters[i]);
                    }
                    const originalImageBase64 = btoa(binaryString);
                    const originalImageUrl = `data:image/jpeg;base64,${originalImageBase64}`;
    
                    // Upload the original image to Imgbb and get the URL
                    const originalImageUploadUrl = await uploadImageToImgbb(originalImageUrl);
                    const uploadedImageUrl = await uploadImageToImgbb(uploadedImageData);
    
                    // Log the original image URL
                    console.log("Original Image URL: ", originalImageUploadUrl);
                    console.log("Uploaded Image URL: ", uploadedImageUrl);
    
                    if (!uploadedImageUrl || !originalImageUploadUrl) {
                        alert("Failed to upload the images. Please try again.");
                        setLoading(false);
                        return;
                    }
    
                    const isImageMatched = await verifyFaceWithFacePlusPlus(uploadedImageUrl, originalImageUploadUrl);
                    console.log("Face Verification Result:", isImageMatched);
    
                    if (locationStatus === "matched" && isImageMatched.confidence > 50) {
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
    
    
    

    // New function to upload image to Imgbb and return the URL
    const uploadImageToImgbb = async (imageData) => {
        if (typeof imageData !== "string") {
            console.error("Invalid image data provided:", imageData);
            return null; // Return null if invalid
        }
        
        const apiKey = "c76cdeefbf39db597e37f74329a4138b"; // Replace with your Imgbb API key
        const cleanedImageData = imageData.replace(/^data:image\/\w+;base64,/, "");

        const formData = new FormData();
        formData.append("key", apiKey);
        formData.append("image", cleanedImageData);

        try {
            const response = await fetch("https://api.imgbb.com/1/upload", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                return result.data.url; // Return the uploaded image URL
            } else {
                console.error("Failed to upload image to Imgbb:", result.message);
                return null; // Return null if failed
            }
        } catch (error) {
            console.error("Error uploading image to Imgbb:", error);
            return null; // Return null if an error occurs
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
}
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

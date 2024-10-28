import React, { useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

const CameraPage = () => {
    const navigate = useNavigate();
    const [imageData, setImageData] = useState(null);
    const [isImageCaptured, setIsImageCaptured] = useState(false);

    const webcamRef = React.useRef(null);

    const handleCapture = () => {
        const capturedImageData = webcamRef.current.getScreenshot();
        setImageData(capturedImageData); // Store the captured image data
        setIsImageCaptured(true); // Mark that the image is captured
    };

    const handleRetake = () => {
        setImageData(null); // Clear the captured image
        setIsImageCaptured(false); // Allow new capture
    };

    const handleCancel = () => {
        navigate("/verificationForm"); // Navigate back to verification form
    };

    const handleConfirmUpload = () => {
        alert("Image has been successfully uploaded!"); // Show message box on confirm
        localStorage.setItem("tempImageData", imageData); // Save captured image to localStorage
        console.log("Captured Image Data: ", imageData);
        navigate("/verificationForm"); // Navigate back to verification form
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                {isImageCaptured ? (
                    <>
                        <img src={imageData} alt="Captured" style={styles.capturedImage} />
                        <button style={styles.button} onClick={handleConfirmUpload}>Confirm</button>
                        <div style={styles.buttonContainer}>
                            <button style={styles.linkButton} onClick={handleCancel}>Cancel</button>
                            <button style={styles.linkButton} onClick={handleRetake}>Retake</button>
                        </div>
                    </>
                ) : (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/png"
                            style={styles.video}
                            videoConstraints={{
                                facingMode: "environment" // Use rear camera
                            }}
                        />
                        <button style={styles.button} onClick={handleCapture}>Capture</button>
                        <div style={styles.buttonContainer}>
                            <button style={styles.linkButton} onClick={handleCancel}>Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Inline styles
const styles = {
    pageWrapper: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2d2d3a",
    },
    container: {
        width: "300px",
        padding: "20px",
        backgroundColor: "#3e3e4f",
        borderRadius: "10px",
        textAlign: "center",
    },
    video: {
        width: "100%",
        borderRadius: "10px",
    },
    capturedImage: {
        width: "100%",
        borderRadius: "10px",
        marginBottom: "20px", // Space between image and buttons
    },
    button: {
        width: "100%",
        padding: "10px",
        marginTop: "20px",
        backgroundColor: "#00b3a7",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "10px",
    },
    linkButton: {
        color: "#00b3a7",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
    },
};

export default CameraPage;

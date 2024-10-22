import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CameraPage = () => {
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const streamRef = useRef(null);
    const [imageData, setImageData] = useState(null);
    const [isImageCaptured, setIsImageCaptured] = useState(false);

    useEffect(() => {
        startCamera();

        // Cleanup function to stop the camera stream when the component unmounts
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }, // Use rear camera
            });
            videoRef.current.srcObject = stream;
            streamRef.current = stream; // Store the stream reference
        } catch (err) {
            console.error("Error accessing camera: ", err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach((track) => track.stop()); // Stop each track
            streamRef.current = null; // Clear the reference
        }
    };

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const capturedImageData = canvas.toDataURL("image/png");

        setImageData(capturedImageData); // Store the captured image data
        setIsImageCaptured(true); // Mark that the image is captured
        stopCamera(); // Stop the camera after capturing the image
    };

    const handleRetake = () => {
        setImageData(null); // Clear the captured image
        setIsImageCaptured(false); // Allow new capture
        startCamera(); // Restart the camera
    };

    const handleCancel = () => {
        stopCamera(); // Stop the camera before navigating
        navigate("/verificationForm"); // Navigate back to verification form
    };

    const handleConfirmUpload = () => {
        alert("Image has been successfully uploaded!"); // Show message box on confirm
        console.log("Captured Image Data: ", imageData);
        navigate("/verificationForm"); // Navigate after successful capture
    };

    return (
        <div style={styles.pageWrapper}>    
            <div style={styles.container}>
                {isImageCaptured ? (
                    <>
                        <img src={imageData} alt="Captured" style={styles.capturedImage} />
                        <button style={styles.button} onClick={handleConfirmUpload}>Confirmed</button>
                        <div style={styles.buttonContainer}>
                            <button style={styles.linkButton} onClick={handleCancel}>Cancel</button>
                            <button style={styles.linkButton} onClick={handleRetake}>Retake</button>
                        </div>
                    </>
                ) : (
                    <>
                        <video ref={videoRef} autoPlay style={styles.video} />
                        <button style={styles.button} onClick={handleCapture}>Confirm Upload</button>
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

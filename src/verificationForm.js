import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

const VerifyForm = () => {
    const [ic, setIc] = useState("");
    const [image, setImage] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setImage(file); // Capture the image from file input (camera or file picker)
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simulated verification check (replace with actual API call)
        if (ic && image) {
            const formData = new FormData();
            formData.append("ic", ic);
            formData.append("image", image);

            // Simulated API call, replace with your actual call
            alert("Verification successful!");
            setError("");
            navigate("/dashboard"); // Redirect to dashboard on success
        } else {
            setError("Please fill in all fields.");
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <h2>Verify</h2>
                <p>Please fill in your credentials</p>
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
                        <label>Upload Image (or take a picture):</label>
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            style={styles.fileInput}
                            accept="image/*"
                            capture="environment"  // This triggers the camera for rear-facing
                            required
                        />
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" style={styles.button}>Submit</button>
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
        alignItems: "center",
        backgroundImage: "url('/assets/login/background.png')",  // Use your provided background
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        paddingRight: "100px",
    },
    container: {
        maxWidth: "300px",
        padding: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        textAlign: "center",
    },
    inputGroup: {
        marginBottom: "15px",
    },
    input: {
        width: "100%",
        padding: "8px",
        marginTop: "5px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    fileInput: {
        width: "100%",
        padding: "8px",
        marginTop: "5px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        backgroundColor: "#f9f9f9",
    },
    button: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    error: {
        color: "red",
        marginBottom: "10px",
    },
};

export default VerifyForm;

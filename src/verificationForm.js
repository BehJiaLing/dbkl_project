import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyForm = () => {
    const [ic, setIc] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleCameraNavigation = () => {
        // Only the Upload Image button navigates to the camera page
        navigate("/camera");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`/api/user/verifyIC?ic=${ic}`);
            const data = await response.json();
    
            if (data.exists) {
                alert("Submitted successfully!");
                setError("");
                navigate("/dashboard");
            } else {
                setError("Please fill in a valid IC.");
            }
        } catch (error) {
            console.error("Error verifying IC:", error);
            setError("Something went wrong, please try again.");
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
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" style={styles.submitButton}>Submit</button>
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
        color: "white",  // Change title to white
        marginBottom: "10px",
    },
    subtitle: {
        color: "white",  // Change subtitle to white
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
    error: {
        color: "red",
        marginBottom: "10px",
    },
};

export default VerifyForm;

import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ErrorPage = () => {
    const navigate = useNavigate(); // Initialize navigation

    const handleRedirect = () => {
        navigate("/login"); // Redirect to the login page
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Access Denied</h1>
            <p style={styles.message}>You do not have permission to access this page.</p>
            <button onClick={handleRedirect} style={styles.button}>
                Go to Login
            </button>
        </div>
    );
};

// Inline styles
const styles = {
    container: {
        maxWidth: "400px",
        margin: "100px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        textAlign: "center",
        backgroundColor: "#f8d7da",
        color: "#721c24",
    },
    title: {
        fontSize: "24px",
    },
    message: {
        margin: "20px 0",
    },
    button: {
        padding: "10px 15px",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default ErrorPage;

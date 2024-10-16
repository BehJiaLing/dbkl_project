import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); 

    const handleLogin = (e) => {
        e.preventDefault();

        // Simulated login check (replace with API call)
        if (username === "admin" && password === "password123") {
            const token = "your_generated_token"; // Simulated token generation
            localStorage.setItem("authToken", token); // Store token in localStorage
            alert("Login successful!");
            setError("");
            navigate("/dashboard"); // Redirect to dashboard on success
        } else {
            setError("Invalid username or password.");
        }
    };

    return (
        <div style={styles.pageWrapper}>
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div style={styles.inputGroup}>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>
                {error && <p style={styles.error}>{error}</p>}
                <button type="submit" style={styles.button}>Login</button>
            </form>
        </div>
    </div>
);
};

// Inline styles
const styles = {
    pageWrapper:{
        height: "100vh",  
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundImage: "url('/assets/login/background.png')",  
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

export default LoginForm;

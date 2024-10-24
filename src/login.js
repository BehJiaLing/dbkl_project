import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!username || !password) {
            setError("Both username and password are required.");
            return;
        }

        setIsLoading(true); // Start loading


        try {
            const response = await axios.get("http://localhost:3001/api/login/login-data");

            // console.log(response.data); // Array of user objects

            // Check if any user matches the entered username and password
            const foundUser = response.data.find(
                (user) => user.username === username && user.password === password
            );

            if (foundUser) {
                const token = "huehdw768hduye@hue7";
                localStorage.setItem("authToken", token);
                localStorage.setItem("adminId", foundUser.id); 
                alert("Login successful!");
                setError("");
                setIsLoading(false);
                navigate("/dashboard"); 
            } else {
                setError("Invalid username or password.");
                setIsLoading(false);
            }
        } catch (error) {
            setError("Login failed. Please check your credentials.");
            console.error("Error during login:", error);
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <h1 style={styles.title}>Login</h1>
                <h2 style={styles.subTitle}>Welcome Back!</h2>
                <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password:</label>
                        <input
                            type={showPassword ? "text" : "password"} // Toggle between text and password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <div style={styles.showPasswordContainer}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)} // Toggle password visibility
                                style={styles.checkbox}
                            />
                            <label style={styles.checkboxLabel}>Show Password</label>
                        </div>
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
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
        fontSize: "32px",
        color: "white",
        marginTop: "10px",
        marginBottom: "10px",
    },
    subTitle: {
        fontSize: "20px",
        color: "white",
        marginTop: "10px",
        marginBottom: "15px",
    },

    inputGroup: {
        marginBottom: "10px",
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
        width: "70%",
        padding: "10px",
        backgroundColor: "#00b3a7",
        color: "white",
        border: "none",
        borderRadius: "50px",
        cursor: "pointer",
        marginTop: "50px",
        margin: "0 auto",
        display: "block",
    },

    error: {
        color: "red",
        marginBottom: "10px",
    },

    showPasswordContainer: {
        display: "flex",
        alignItems: "center",
        marginTop: "5px",
    },

    checkbox: {
        marginRight: "10px",
    },

    checkboxLabel: {
        color: "white",
    },
};

export default LoginForm;

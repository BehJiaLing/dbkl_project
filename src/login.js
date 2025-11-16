import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosConfig";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Both email and password are required.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post("/api/auth/login", {
                email,
                password,
            });

            const { user } = response.data;

            localStorage.setItem("userId", user.id);
            localStorage.setItem("userRole", user.role);
            localStorage.setItem("activeContent", "overview"); 

            alert("Login successful!");
            setIsLoading(false);
            navigate("/dashboard");
        } catch (err) {
            console.error("Error during login:", err);
            const msg =
                err.response?.data?.message ||
                "Login failed. Please check your credentials.";
            alert(msg);
            setIsLoading(false);
        }
    };

    const goToSignup = () => {
        navigate("/signup");
    };

    const goToForgotPassword = () => {
        navigate("/forgot-password");
    };

    return (
        <div style={isMobile ? styles.pageWrapperMobile : styles.pageWrapper}>
            <div style={isMobile ? styles.containerMobile : styles.container}>
                <h1 style={styles.title}>Login</h1>
                <h2 style={styles.subTitle}>Welcome Back!</h2>
                <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password:</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <div style={styles.showPasswordContainer}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                style={styles.checkbox}
                            />
                            <label style={styles.checkboxLabel}>Show Password</label>
                        </div>
                    </div>

                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Forgot password under form */}
                <div style={styles.forgotWrapper}>
                    <button
                        type="button"
                        onClick={goToForgotPassword}
                        style={styles.linkButton}
                    >
                        Forgot Password?
                    </button>
                </div>

                {/* Sign up section */}
                <div style={styles.signupWrapper}>
                    <span style={styles.signupText}>Don&apos;t have an account?</span>
                    <button
                        type="button"
                        onClick={goToSignup}
                        style={styles.signupButton}
                    >
                        Sign Up
                    </button>
                </div>
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
    label: {
        fontSize: "14px",
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
        marginTop: "30px",
        margin: "0 auto",
        display: "block",
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
    forgotWrapper: {
        marginTop: "10px",
        textAlign: "center",
    },
    linkButton: {
        background: "none",
        border: "none",
        color: "#00b3a7",
        cursor: "pointer",
        fontSize: "13px",
        textDecoration: "underline",
    },
    signupWrapper: {
        marginTop: "15px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
    },
    signupText: {
        color: "white",
        fontSize: "13px",
    },
    signupButton: {
        padding: "8px 20px",
        backgroundColor: "transparent",
        borderRadius: "50px",
        border: "1px solid #00b3a7",
        color: "#00b3a7",
        cursor: "pointer",
        fontSize: "14px",
    },
};

export default LoginForm;

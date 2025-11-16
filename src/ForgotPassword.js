import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosConfig";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            alert("Email is required.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await axiosInstance.post("/api/auth/request-password-reset", {
                email,
            });

            alert(
                res.data.message ||
                "If that email is registered, a reset link has been sent."
            );
            setIsLoading(false);
            // Optionally redirect back to login
            navigate("/login");
        } catch (err) {
            console.error("Forgot password error:", err);
            const msg =
                err.response?.data?.message ||
                "Failed to request password reset. Please try again.";
            alert(msg);
            setIsLoading(false);
        }
    };

    return (
        <div style={isMobile ? styles.pageWrapperMobile : styles.pageWrapper}>
            <div style={isMobile ? styles.containerMobile : styles.container}>
                <h1 style={styles.title}>Reset Password</h1>
                <h2 style={styles.subTitle}>Enter your email to get a reset link</h2>

                <form onSubmit={handleSubmit}>
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

                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>
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
        fontSize: "16px",
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
        marginTop: "20px",
        margin: "0 auto",
        display: "block",
    },
};

export default ForgotPassword;

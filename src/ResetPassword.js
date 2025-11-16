import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "./axiosConfig";

const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Helper: evaluate strength
const evaluatePasswordStrength = (password) => {
    if (!password) {
        return { label: "", color: "" };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (password.length < 8) {
        return { label: "Too short", color: "#ff4d4f" }; // red
    }

    if (score <= 2) {
        return { label: "Weak", color: "#ff4d4f" }; // red
    } else if (score === 3) {
        return { label: "Medium", color: "#faad14" }; // orange
    } else if (score === 4) {
        return { label: "Strong", color: "#52c41a" }; // green
    } else {
        return { label: "Very strong", color: "#389e0d" }; // darker green
    }
};

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState({
        label: "",
        color: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const location = useLocation();
    const navigate = useNavigate();

    const token = new URLSearchParams(location.search).get("token");

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePasswordChange = (value) => {
        setPassword(value);
        setPasswordStrength(evaluatePasswordStrength(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("Invalid or missing reset token.");
            return;
        }

        if (!password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!strongPasswordRegex.test(password)) {
            alert(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&)."
            );
            return;
        }

        setIsLoading(true);

        try {
            const res = await axiosInstance.post("/api/auth/reset-password", {
                token,
                password,
            });

            alert(res.data.message || "Password reset successful. Please log in.");
            setIsLoading(false);
            navigate("/login");
        } catch (err) {
            console.error("Reset password error:", err);
            const msg =
                err.response?.data?.message ||
                "Failed to reset password. Your link may be invalid or expired.";
            alert(msg);
            setIsLoading(false);
        }
    };

    return (
        <div style={isMobile ? styles.pageWrapperMobile : styles.pageWrapper}>
            <div style={isMobile ? styles.containerMobile : styles.container}>
                <h1 style={styles.title}>Set New Password</h1>

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password:</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            style={styles.input}
                            required
                        />
                        {/* Password strength indicator */}
                        {passwordStrength.label && (
                            <div
                                style={{
                                    ...styles.passwordStrength,
                                    color: passwordStrength.color,
                                }}
                            >
                                Strength: {passwordStrength.label}
                            </div>
                        )}
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm New Password:</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {isLoading ? "Resetting..." : "Reset Password"}
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
        fontSize: "28px",
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
    passwordStrength: {
        fontSize: "11px",
        marginTop: "4px",
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
        fontSize: "13px",
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

export default ResetPassword;

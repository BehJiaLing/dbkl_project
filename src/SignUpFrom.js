import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosConfig";
import { useNavigate } from "react-router-dom";

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

const SignUpForm = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ label: "", color: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePasswordChange = (value) => {
        setPassword(value);
        setPasswordStrength(evaluatePasswordStrength(value));
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
            const msg = "All fields are required.";
            alert(msg);
            return;
        }

        if (password !== confirmPassword) {
            const msg = "Passwords do not match.";
            alert(msg);
            return;
        }

        // Strong password rule enforced on submit
        if (!strongPasswordRegex.test(password)) {
            const msg =
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&).";
            alert(msg);
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post("/api/auth/signup", {
                username,
                email,
                password
                // role decided in backend by email domain
            });

            const msg =
                response.data.message || "Sign up successful. Please verify your email.";
            alert(msg);
            setIsLoading(false);

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error("Sign up error:", err);
            const msg = err.response?.data?.message || "Sign up failed.";
            alert(msg);
            setIsLoading(false);
        }
    };

    const goToLogin = () => {
        navigate("/login");
    };

    return (
        <div style={isMobile ? styles.pageWrapperMobile : styles.pageWrapper}>
            <div style={isMobile ? styles.containerMobile : styles.container}>
                <h1 style={styles.title}>Sign Up</h1>
                <h2 style={styles.subTitle}>Create Your Account</h2>

                <form onSubmit={handleSignUp}>
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
                        <label style={styles.label}>Confirm Password:</label>
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

                    {/* Inline error/success removed since we're using alert() */}

                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <div style={styles.loginWrapper}>
                    <span style={styles.loginText}>Already have an account?</span>
                    <button
                        type="button"
                        onClick={goToLogin}
                        style={styles.loginButton}
                    >
                        Login
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
        marginTop: "20px",
        margin: "0 auto",
        display: "block",
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
    },
    loginWrapper: {
        marginTop: "15px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
    },
    loginText: {
        color: "white",
        fontSize: "13px",
    },
    loginButton: {
        padding: "8px 20px",
        backgroundColor: "transparent",
        borderRadius: "50px",
        border: "1px solid #00b3a7",
        color: "#00b3a7",
        cursor: "pointer",
        fontSize: "14px",
    },
};

export default SignUpForm;

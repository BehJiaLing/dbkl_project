import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyForm = () => {
    const [ic, setIc] = useState("");
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleCameraNavigation = () => {
        navigate("/camera");
    };

    const updateUserStatus = async (ic, status) => {
        try {
            const response = await fetch(`http://localhost:3001/api/user/update-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ic, status }),
            });

            if (!response.ok) {
                alert("Failed to update user status"); // Alert instead of throw error
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status"); // Alert instead of throw error
        }
    };

    const incrementSubmitAttend = async (ic) => {
        try {
            const response = await fetch(`http://localhost:3001/api/user/increment-submit-attend`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ic }),
            });

            const result = await response.json(); // Parse JSON response
            if (!response.ok) {
                alert(result.message || "Failed to update submitAttend"); // Alert instead of throw error
            } else {
                alert("SubmitAttend updated: " + result.message); // Alert success message
            }
        } catch (error) {
            console.error("Error updating submitAttend:", error);
            alert("Error updating submitAttend"); // Alert instead of throw error
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true

        try {
            // Fetch user data from the API
            const response = await fetch('http://localhost:3001/api/user/user-data');
            const data = await response.json();

            // Find the user with the matching IC
            const user = data.find(user => user.ic === parseInt(ic));

            if (user) {
                // Check if the user has reached the maximum submit attempts
                if (user.submitAttend >= 3) {
                    alert("You have reached the maximum submission attempts."); // Alert instead of error state
                    setLoading(false);
                    return; // Block further submission
                }

                // Get the user's current location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const userLatitude = position.coords.latitude;
                        const userLongitude = position.coords.longitude;

                        // Compare the user's current location with the stored location
                        let status;
                        if (user.latitude === userLatitude && user.longitude === userLongitude) {
                            status = "green"; // Match found
                            alert(`IC verified successfully for user: ${user.username}`);
                        } else {
                            status = "yellow"; // No match
                            alert(`Location does not match for user: ${user.username}. Status set to yellow.`);
                        }

                        // Update the user's status in the database
                        await updateUserStatus(user.ic, status);
                        // Increment submitAttend
                        await incrementSubmitAttend(user.ic);
                        setLoading(false); // Reset loading
                    }, (error) => {
                        console.error("Error getting location:", error);
                        alert("Unable to retrieve your location."); // Alert instead of error state
                        setLoading(false); // Reset loading
                    });
                } else {
                    alert("Geolocation is not supported by this browser."); // Alert instead of error state
                    setLoading(false); // Reset loading
                }
            } else {
                alert("IC not found. Please check your input."); // Alert instead of error state
                setLoading(false); // Reset loading
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("An error occurred while verifying. Please try again."); // Alert instead of error state
            setLoading(false); // Reset loading
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
                    <button type="submit" style={styles.submitButton} disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
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
        color: "white",
        marginBottom: "10px",
    },
    subtitle: {
        color: "white",
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
};

export default VerifyForm;

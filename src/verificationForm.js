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
                alert("Unsuccessful: Please try again."); // Alert for unsuccessful status update
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Unsuccessful: Please try again."); // Alert for error updating status
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
                alert("Unsuccessful: Please try again."); // Alert for unsuccessful increment
            }
        } catch (error) {
            console.error("Error updating submitAttend:", error);
            alert("Unsuccessful: Please try again."); // Alert for error updating increment
        }
    };

    const isWithinDistance = (lat1, lon1, lat2, lon2, tolerance) => {
        const earthRadius = 6371; // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * (Math.PI / 180)) *
                  Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c; // Distance in km
        return distance <= tolerance;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true

        try {
            const response = await fetch('http://localhost:3001/api/user/user-data');
            const data = await response.json();

            const user = data.find(user => user.ic === parseInt(ic));

            if (user) {
                if (user.submitAttend >= 3) {
                    alert("Unsuccessful: You have reached the maximum submission attempts."); // Alert for max attempts
                    setLoading(false);
                    return; // Block further submission
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const userLatitude = position.coords.latitude;
                        const userLongitude = position.coords.longitude;

                        let status;
                        if (isWithinDistance(user.latitude, user.longitude, userLatitude, userLongitude, 0.1)) {
                            status = "green";
                            alert("Submitted Successfully: Location matched."); // Alert for successful submission and match
                        } else {
                            status = "yellow";
                            alert("Submitted Successfully: Location does not match."); // Alert for successful submission but no match
                        }

                        await updateUserStatus(user.ic, status);
                        await incrementSubmitAttend(user.ic);
                        setLoading(false); // Reset loading
                    }, (error) => {
                        console.error("Error getting location:", error);
                        alert("Unsuccessful: Please try again."); // Alert for location retrieval error
                        setLoading(false); // Reset loading
                    });
                } else {
                    alert("Unsuccessful: Geolocation is not supported by this browser."); // Alert if geolocation is not supported
                    setLoading(false); // Reset loading
                }
            } else {
                alert("Invalid IC Number: Please enter a valid IC number."); // Alert for invalid IC
                setLoading(false); // Reset loading
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Unsuccessful: Please try again."); // Alert for fetching error
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

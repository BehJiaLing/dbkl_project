import React from "react";
import "font-awesome/css/font-awesome.min.css";
import axiosInstance from "../axiosConfig"; 

const Navbar = ({
    onMenuClick,
    toggleSidebar,
    isSidebarVisible,
    activeContent,
    role,
    allowedPages = [], 
}) => {
    const handleLogout = async () => {
        try {
            await axiosInstance.post("/api/auth/logout");
        } catch (err) {
            console.error("Error calling logout API:", err);
        }

        // Clear all local storage (auth + UI state)
        localStorage.clear();

        alert("You have been logged out.");

        if (onMenuClick) {
            onMenuClick("logout"); 
        }
    };

    return (
        <nav style={styles.navbar}>
            <ul style={styles.navItems}>
                {allowedPages.includes("overview") && (
                    <li
                        style={{
                            ...styles.navItem,
                            color: activeContent === "overview" ? "#00CCBE" : "#fff",
                        }}
                        onClick={() => onMenuClick("overview")}
                    >
                        Overview
                    </li>
                )}

                {allowedPages.includes("details") && (
                    <li
                        style={{
                            ...styles.navItem,
                            color: activeContent === "details" ? "#00CCBE" : "#fff",
                        }}
                        onClick={() => onMenuClick("details")}
                    >
                        Data Details
                    </li>
                )}

                {allowedPages.includes("access-management") && (
                    <li
                        style={{
                            ...styles.navItem,
                            color:
                                activeContent === "access-management" ? "#00CCBE" : "#fff",
                        }}
                        onClick={() => onMenuClick("access-management")}
                    >
                        Access Management
                    </li>
                )}

                {allowedPages.includes("user-list") && (
                    <li
                        style={{
                            ...styles.navItem,
                            color:
                                activeContent === "user-list" ? "#00CCBE" : "#fff",
                        }}
                        onClick={() => onMenuClick("user-list")}
                    >
                        Users Management
                    </li>
                )}
            </ul>

            <div style={styles.rightContainer}>
                <div style={styles.burgerMenu} onClick={toggleSidebar}>
                    {isSidebarVisible ? (
                        <>
                            <i className="fa fa-times" style={styles.icon}></i>
                            {/* Close icon */}
                        </>
                    ) : (
                        <>
                            <i className="fa fa-bars" style={styles.icon}></i>
                            {/* Burger icon */}
                        </>
                    )}
                </div>

                <div onClick={handleLogout} style={styles.logout}>
                    <i className="fa fa-sign-out" style={styles.icon}></i>
                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        backgroundColor: "#1A2F52",
        color: "#fff",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rightContainer: {
        display: "flex",
        alignItems: "center",
    },
    burgerMenu: {
        cursor: "pointer",
        padding: "10px",
    },
    navItems: {
        listStyle: "none",
        display: "flex",
        gap: "20px",
        margin: 0,
        padding: 0,
    },
    navItem: {
        cursor: "pointer",
        color: "#fff",
        fontWeight: "bold",
        padding: "10px",
    },
    logout: {
        cursor: "pointer",
        color: "#fff",
        padding: "10px",
    },
    icon: {
        fontSize: "20px",
    },
};

export default Navbar;

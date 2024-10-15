import React from "react";
import 'font-awesome/css/font-awesome.min.css';

const Navbar = ({ onMenuClick, toggleSidebar, isSidebarVisible, activeContent }) => {
    return (
        <nav style={styles.navbar}>
            <ul style={styles.navItems}>
                <li
                    style={{
                        ...styles.navItem,
                        color: activeContent === "overview" ? "#00CCBE" : "#fff"
                    }}
                    onClick={() => onMenuClick("overview")}
                >
                    Overview
                </li>
                <li
                    style={{
                        ...styles.navItem,
                        color: activeContent === "details" ? "#00CCBE" : "#fff"
                    }}
                    onClick={() => onMenuClick("details")}
                >
                    Data Details
                </li>
            </ul>
            <div style={styles.rightContainer}>
                <div style={styles.burgerMenu} onClick={toggleSidebar}>
                    {isSidebarVisible ? (
                        <i className="fa fa-times" style={styles.icon}></i> // Close icon
                    ) : (
                        <i className="fa fa-bars" style={styles.icon}></i> // Burger icon
                    )}
                </div>
                <div onClick={() => onMenuClick("logout")} style={styles.logout}>
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

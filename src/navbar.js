import React from "react";

const Navbar = ({ onMenuClick, toggleSidebar }) => {
    return (
        <nav style={styles.navbar}>
            <ul style={styles.navItems}>
                <li style={styles.navItem} onClick={() => onMenuClick("overview")}>Overview</li>
                <li style={styles.navItem} onClick={() => onMenuClick("details")}>Data Details</li>
                <li style={styles.navItem} onClick={() => onMenuClick("logout")}>Log Out</li>
            </ul>
            <div style={styles.burgerMenu} onClick={toggleSidebar}>
                &#9776; 
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        backgroundColor: "#333",
        color: "#fff",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between", 
        alignItems: "center",
    },
    burgerMenu: {
        cursor: "pointer",
        fontSize: "24px",
        padding: "10px",
    },
    navItems: {
        listStyle: "none",
        display: "flex",
        gap: "20px",
        margin: 0,
    },
    navItem: {
        cursor: "pointer",
        color: "#fff",
    },
};

export default Navbar;

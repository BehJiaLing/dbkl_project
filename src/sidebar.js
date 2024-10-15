import React from 'react';

const Sidebar = ({ isSidebarVisible }) => {
    return (
        <div style={{
            ...styles.sidebar,
            transform: isSidebarVisible ? "translateX(0)" : "translateX(100%)"
        }}>
            <h2>Analysis Graph</h2>
            <div style={styles.graphPlaceholder}>Graph goes here</div>
        </div>
    );
};

const styles = {
    sidebar: {
        width: "30%",
        backgroundColor: "#f8f9fa",
        borderLeft: "1px solid #ccc",
        padding: "20px",
        transition: "transform 0.3s ease",
    },
    graphPlaceholder: {
        width: "100%",
        height: "300px",
        backgroundColor: "lightblue",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        marginTop: "20px",
    }
};

export default Sidebar;

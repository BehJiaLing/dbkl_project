import React from "react";

const MapContent = ({ isSidebarVisible }) => {
    return (
        <div
            style={{
                ...styles.mapContainer,
                width: isSidebarVisible ? "70%" : "100%", 
            }}
        >
            <h2>Map View</h2>
            <div style={styles.mapPlaceholder}>Map goes here</div>
        </div>
    );
};

const styles = {
    mapContainer: {
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        transition: "width 0.3s ease", 
    },
    mapPlaceholder: {
        width: "100%",
        height: "400px",
        backgroundColor: "lightgray",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        marginTop: "20px",
    },
};

export default MapContent;

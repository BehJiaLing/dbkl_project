import React from "react";

const DataDetailsContent = () => {
    return (
        <div style={styles.container}>
            <h2>Data Details Content</h2>
            <p>This is the data details content. You can add detailed data views here.</p>
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        backgroundColor: "#f4f4f4",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "width 0.3s ease",
    },
};

export default DataDetailsContent;

import React from "react";

const Error = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Permission Denied</h1>
                <p style={styles.message}>You do not have access to view this page.</p>
                {/* <img
                    src="/assets/permission_denied.png" // Replace with a suitable image if available
                    alt="Permission Denied"
                    style={styles.image}
                /> */}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f8f8",
    },
    card: {
        textAlign: "center",
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: "28px",
        color: "#e74c3c",
        marginBottom: "20px",
    },
    message: {
        fontSize: "18px",
        color: "#555",
        marginBottom: "20px",
    },
    image: {
        maxWidth: "200px",
        marginTop: "20px",
    },
};

export default Error;

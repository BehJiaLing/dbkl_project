import React from "react";

const Dashboard = () => {
    return (
        <div style={styles.container}>
            <h1>Welcome to the Dashboard</h1>
            <p>This is a protected page only accessible after login.</p>
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        textAlign: "center",
    },
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import OverviewContent from "./dash_overview";
import DataDetailsContent from "./dash_data-details";

const Dashboard = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [activeContent, setActiveContent] = useState("overview");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/error"); 
        }
    }, [navigate]);

    const toggleSidebar = () => {
        setIsSidebarVisible(prevState => !prevState);
    };

    const handleMenuClick = (menuItem) => {
        if (menuItem === "logout") {
            localStorage.removeItem("authToken"); 
            navigate("/login"); 
        } else {
            setActiveContent(menuItem); 
        }
    };

    const renderContent = () => {
        switch (activeContent) {
            case "overview":
                return <OverviewContent />;
            case "details":
                return <DataDetailsContent />;
            default:
                return null; 
        }
    };

    return (
        <div style={styles.dashboardContainer}>
            <Navbar
                onMenuClick={handleMenuClick}
                toggleSidebar={toggleSidebar}
                isSidebarVisible={isSidebarVisible} 
                activeContent={activeContent}
            />

            <div style={styles.mainContent}>
                <div
                    style={{
                        ...styles.contentContainer,
                        width: isSidebarVisible ? "70%" : "100%", 
                    }}
                >
                    {renderContent()}
                </div>

                {isSidebarVisible && <Sidebar isSidebarVisible={isSidebarVisible} />}
            </div>
        </div>
    );
};

const styles = {
    dashboardContainer: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
    },
    mainContent: {
        display: "flex",
        flex: 1,
        overflow: "hidden",
    },
    contentContainer: {
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        transition: "width 0.3s ease",
    },
};

export default Dashboard;
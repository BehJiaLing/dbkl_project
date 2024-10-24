import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import OverviewContent from "./dash_overview";
import DataDetailsContent from "./dash_data-details";
import ErrorComponent from "./components/errorCom";

const Dashboard = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [activeContent, setActiveContent] = useState("overview");
    const [allowedPages, setAllowedPages] = useState([]); // To store allowed pages
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const adminId = localStorage.getItem("adminId"); // Get adminId from localStorage
        if (!token || !adminId) {
            navigate("/error");
            return;
        }

        // Fetch allowed pages for the admin based on adminId
        const fetchPageAccess = async () => {
            try {
                const response = await axios.get("http://localhost:3001/api/access-control/page-data", {
                    params: { adminId }
                });

                const allowedPageIds = response.data
                    .filter(page => page.admin_id === parseInt(adminId)) // Filter by adminId
                    .map(page => page.page_id); // Get page_id

                // Map page_id to page names
                const pageNames = allowedPageIds.map(pageId => {
                    if (pageId === 1) return "overview";
                    if (pageId === 2) return "details";
                    return null;
                }).filter(Boolean); // Remove null values

                setAllowedPages(pageNames);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching access control:", error);
                setLoading(false);
            }
        };

        fetchPageAccess();
    }, [navigate]);

    useEffect(() => {
        const savedSidebarVisibility = localStorage.getItem("isSidebarVisible");
        const savedActiveContent = localStorage.getItem("activeContent");

        if (savedSidebarVisibility) {
            setIsSidebarVisible(JSON.parse(savedSidebarVisibility)); 
        }

        if (savedActiveContent) {
            setActiveContent(savedActiveContent);
        }
    }, []); 

    const toggleSidebar = () => {
        setIsSidebarVisible((prevState) => {
            const newState = !prevState;
            localStorage.setItem("isSidebarVisible", JSON.stringify(newState)); 
            return newState;
        });
    };

    const handleMenuClick = (menuItem) => {
        if (menuItem === "logout") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("adminId"); // Clear adminId
            navigate("/login");
        } else { 
            setActiveContent(menuItem);
            localStorage.setItem("activeContent", menuItem); 
        } 
    };

    const renderContent = () => {
        if (loading) {
            return <div>Loading...</div>; // Show loading indicator while checking access
        }

        // Check if the admin has access to the current content
        if (!allowedPages.includes(activeContent)) {
            return <ErrorComponent />; // Render ErrorComponent if access is denied
        }

        switch (activeContent) {
            case "overview":
                return <OverviewContent />;
            case "details":
                return <DataDetailsContent />;
            default:
                return <ErrorComponent />; // Fallback if no valid content is found
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

                {isSidebarVisible && <Sidebar />}
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        transition: "width 0.3s ease",
    },
};

export default Dashboard;

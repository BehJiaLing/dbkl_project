import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from './axiosConfig';
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import OverviewContent from "./dash_overview";
import DataDetailsContent from "./dash_data-details";
import ErrorComponent from "./components/errorCom";

const Dashboard = () => {
    const initialIsMobile = window.innerWidth <= 768;
    const [isMobile, setIsMobile] = useState(initialIsMobile);
    const [isSidebarVisible, setIsSidebarVisible] = useState(!initialIsMobile);
    const [activeContent, setActiveContent] = useState("overview");
    const [allowedPages, setAllowedPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () =>{
            const mobileView = window.innerWidth <= 768;
            setIsMobile(mobileView);
            if (mobileView) {
                setIsSidebarVisible(false); // Hide sidebar on mobile
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const adminId = localStorage.getItem("adminId");
        if (!token || !adminId) {
            navigate("/error");
            return;
        }

        const fetchPageAccess = async () => {
            try {
                const response = await axiosInstance.get("/api/access-control/page-data", {
                    params: { adminId }
                });

                const allowedPageIds = response.data
                    .filter(page => page.admin_id === parseInt(adminId))
                    .map(page => page.page_id);

                const pageNames = allowedPageIds.map(pageId => {
                    if (pageId === 1) return "overview";
                    if (pageId === 2) return "details";
                    return null;
                }).filter(Boolean);

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
            localStorage.removeItem("adminId");
            localStorage.removeItem("isSidebarVisible");
            localStorage.removeItem("activeContent");
            navigate("/login");
        } else {
            setActiveContent(menuItem);
            localStorage.setItem("activeContent", menuItem);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div>Loading...</div>;
        }

        if (!allowedPages.includes(activeContent)) {
            return <ErrorComponent />;
        }

        switch (activeContent) {
            case "overview":
                return <OverviewContent />;
            case "details":
                return <DataDetailsContent />;
            default:
                return <ErrorComponent />;
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
                        width: isMobile ? "100%" : isSidebarVisible ? "70%" : "100%",
                    }}
                >
                    {renderContent()}
                </div>

                {isSidebarVisible && <Sidebar isMobile={isMobile} />}

                {isMobile && isSidebarVisible && (
                    <div style={styles.overlay} onClick={() => setIsSidebarVisible(false)} />
                )}
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
        position: "relative", // Important for absolute positioning of sidebar
    },
    contentContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        transition: "width 0.3s ease",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
        zIndex: 999, // Ensure the overlay is above other content
    },
};

export default Dashboard;

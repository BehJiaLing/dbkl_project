import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosConfig";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import OverviewContent from "./dash_overview";
import DataDetailsContent from "./dash_data-details";
import RoleManagement from "./RoleManagement";
import UserListPage from "./UserListPage";
import ErrorComponent from "./components/errorCom";

const Dashboard = () => {
    const initialIsMobile = window.innerWidth <= 768;
    const [isMobile, setIsMobile] = useState(initialIsMobile);
    const [isSidebarVisible, setIsSidebarVisible] = useState(!initialIsMobile);
    const [activeContent, setActiveContent] = useState("overview");
    const [allowedPages, setAllowedPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

    const navigate = useNavigate();

    // Handle resize for mobile / sidebar
    useEffect(() => {
        const handleResize = () => {
            const mobileView = window.innerWidth <= 768;
            setIsMobile(mobileView);
            if (mobileView) {
                setIsSidebarVisible(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Reusable function to fetch allowed pages for the logged-in user
    const fetchMyPages = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/access-control/my-pages");
            const pageNames = response.data.map((page) => page.name); 

            setAllowedPages(pageNames);

            // Ensure activeContent is still allowed
            setActiveContent((prev) => {
                if (pageNames.includes(prev)) return prev;
                return pageNames[0] || "overview";
            });

            setLoading(false);
        } catch (error) {
            console.error("Error fetching access control:", error);
            setLoading(false);

            if (error.response && error.response.status === 401) {
                // Not authenticated / token invalid
                alert("Your session has expired. Please log in again.");
                navigate("/login");
            } else {
                navigate("/error");
            }
        }
    }, [navigate]);

    // Initial auth/role + first fetch of allowed pages
    useEffect(() => {
        const userRole = localStorage.getItem("userRole");
        setRole(userRole || null);

        fetchMyPages();
    }, [fetchMyPages]);

    // Restore sidebar visibility and active content (optional)
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
            navigate("/login");
            return;
        }

        setActiveContent(menuItem);
        localStorage.setItem("activeContent", menuItem);
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
                return <OverviewContent role={role} />;
            case "details":
                return <DataDetailsContent role={role} />;
            case "access-management":
                return <RoleManagement role={role} onAccessUpdated={fetchMyPages} />;
            case "user-list":
                return <UserListPage role={role} />;
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
                role={role}
                allowedPages={allowedPages}
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

                {isSidebarVisible && (
                    <Sidebar
                        isMobile={isMobile}
                        role={role}
                        allowedPages={allowedPages}
                    />
                )}

                {isMobile && isSidebarVisible && (
                    <div
                        style={styles.overlay}
                        onClick={() => setIsSidebarVisible(false)}
                    />
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
        position: "relative",
    },
    contentContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        backgroundColor: "#f4f4f4",
        padding: "20px",
        overflowY: "auto",
        transition: "width 0.3s ease",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 999,
    },
};

export default Dashboard;

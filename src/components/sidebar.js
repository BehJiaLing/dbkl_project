import PolarAreaChart from "./polar-area-chart";
import SubmissionRequest from "./submissionrequest";

const Sidebar = ({ isMobile }) => {
    return (
        <div style={isMobile ? styles.sidebarMobile : styles.sidebar}>
            <div style={isMobile ? styles.contentMobileContainer : styles.contentContainer}>
                <div>
                    <h3>Users Status Overview</h3>
                    <PolarAreaChart />
                </div>
                <div>
                    <h3>Submission Request</h3>
                    <SubmissionRequest />
                </div>
            </div>
        </div>
    );
};

const styles = {
    sidebar: {
        width: "30%",
        padding: "20px",
        backgroundColor: "#f8f9fa",
    },
    sidebarMobile: {
        width: "70%", // Full width for mobile
        height: "100%", // Full height for mobile
        position: "absolute", // Absolute positioning to overlay on content
        padding: "20px",
        top: 0, // Align to top
        right: 0, // Align to left
        backgroundColor: "#f8f9fa",
        zIndex: 1000, // Ensure it is above the content
    },
    contentMobileContainer:{
        maxHeight: "100%",
        overflowY: "auto",
    },
    contentContainer: {
        overflowY: "auto", // Enable vertical scrolling
        paddingRight: "10px", // Add some padding to avoid content touching the scrollbar
    },
};

export default Sidebar;

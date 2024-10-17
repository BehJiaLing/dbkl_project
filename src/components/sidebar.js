import PolarAreaChart from "./polar-area-chart";
import FailedVerification from "./failedverification";

const Sidebar = () => {
    return (
        <div style={styles.sidebar}>
            <div style={styles.contentContainer}>
                <div>
                    <h3>Users Status Overview</h3>
                    <PolarAreaChart />
                </div>
                <div>
                    <h3>Failed Verification</h3>
                    <FailedVerification />
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
    contentContainer: {
        maxHeight: "500px", // Set a maximum height for the content
        overflowY: "auto", // Enable vertical scrolling
        paddingRight: "10px", // Add some padding to avoid content touching the scrollbar
    },
};

export default Sidebar;

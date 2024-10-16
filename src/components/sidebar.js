import PolarAreaChart from "./polar-area-chart";

const Sidebar = () => {
    return (
        <div style={styles.sidebar}>
            <div>
                <h3>Users Status Overview</h3>
                <PolarAreaChart />
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
};

export default Sidebar;

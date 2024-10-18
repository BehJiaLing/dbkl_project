import React from "react";

const PointFilter = ({ filter, onChange }) => {
    return (
        <div style={{ marginBottom: "20px" }}>
            <label htmlFor="pointFilter">Filter Points: </label>
            <select id="pointFilter" value={filter} onChange={onChange} style={{ padding: "5px", borderRadius: "5px" }}>
                <option value="all">All</option>
                <option value="green">Green Point</option>
                <option value="red">Red Point</option>
                <option value="yellow">Yellow Point</option>
            </select>
        </div>
    );
};

export default PointFilter;

import React, { useState } from "react";

const DataDetailsContent = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        console.log("Searching for:", event.target.value);
    };
    
    const data = [
        {
            personName: "John Doe",
            ic: "123456-78-9101",
            locationName: "Location A",
            address: "123 Main St, City, Country",
            coordinates: "3.1390, 101.6869",
            uploadedTime: "2024-10-16 10:00 AM",
        },
        {
            personName: "Jane Smith",
            ic: "987654-32-1098",
            locationName: "Location B",
            address: "456 Side St, Another City, Country",
            coordinates: "2.9264, 101.6964",
            uploadedTime: "2024-10-15 2:30 PM",
        },
        {
            personName: "John Doe",
            ic: "123456-78-9101",
            locationName: "Location A",
            address: "123 Main St, City, Country",
            coordinates: "3.1390, 101.6869",
            uploadedTime: "2024-10-16 10:00 AM",
        },
        {
            personName: "Jane Smith",
            ic: "987654-32-1098",
            locationName: "Location B",
            address: "456 Side St, Another City, Country",
            coordinates: "2.9264, 101.6964",
            uploadedTime: "2024-10-15 2:30 PM",
        },
        {
            personName: "John Doe",
            ic: "123456-78-9101",
            locationName: "Location A",
            address: "123 Main St, City, Country",
            coordinates: "3.1390, 101.6869",
            uploadedTime: "2024-10-16 10:00 AM",
        },
        {
            personName: "Jane Smith",
            ic: "987654-32-1098",
            locationName: "Location B",
            address: "456 Side St, Another City, Country",
            coordinates: "2.9264, 101.6964",
            uploadedTime: "2024-10-15 2:30 PM",
        },
        {
            personName: "John Doe",
            ic: "123456-78-9101",
            locationName: "Location A",
            address: "123 Main St, City, Country",
            coordinates: "3.1390, 101.6869",
            uploadedTime: "2024-10-16 10:00 AM",
        },
        {
            personName: "Jane Smith",
            ic: "987654-32-1098",
            locationName: "Location B",
            address: "456 Side St, Another City, Country",
            coordinates: "2.9264, 101.6964",
            uploadedTime: "2024-10-15 2:30 PM",
        },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.searchContainer}>
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={handleSearch} 
                    placeholder="Search" 
                    style={styles.searchInput}
                />
                <span style={styles.searchIcon}>🔍</span>
            </div>

            <div style={styles.tableContainer}>
    <table style={styles.table}>
        <thead>
            <tr>
                <th style={styles.th}>Person Name</th>
                <th style={styles.th}>IC</th>
                <th style={styles.th}>Location Name</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Coordinates</th>
                <th style={styles.th}>Uploaded Time</th>
            </tr>
        </thead>
        <tbody>
            {data.map((item, index) => (
                <tr key={index}>
                    <td style={styles.td}>{item.personName}</td>
                    <td style={styles.td}>{item.ic}</td>
                    <td style={styles.td}>{item.locationName}</td>
                    <td style={styles.td}>{item.address}</td>
                    <td style={styles.td}>{item.coordinates}</td>
                    <td style={styles.td}>{item.uploadedTime}</td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        backgroundColor: "#f4f4f4",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        transition: "width 0.3s ease",
    },
    searchContainer: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: "5px",
        border: "1px solid #ccc",
        padding: "5px 10px",
        width: "300px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // For better visibility
    },
    searchInput: {
        border: "none",
        outline: "none",
        flex: 1,
        padding: "5px",
    },
    searchIcon: {
        marginLeft: "5px",
        color: "#999",
    },
    tableContainer: {
        width: "100%",
        maxHeight: "500px", // Set the max height for the container
        overflowY: "auto", // Enable vertical scrolling
        marginTop: "20px",
        border: "1px solid #ddd", // Add a border for better visibility
    },
    table: {
        width: "95%", 
        borderCollapse: "separate", 
        borderSpacing: "0 5px", 
        tableLayout: "fixed", 
    },
    th: {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "left",
        backgroundColor: "#001f3f",
        color: "#fff",
        lineHeight: "1",
        width: "16.6%", 
    },
    td: {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "left",
        lineHeight: "1",
        backgroundColor: "transparent",
    },
};

export default DataDetailsContent;

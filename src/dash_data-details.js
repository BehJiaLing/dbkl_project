import React, { useState } from "react";
import PointFilter from "./components/pointfilter";

const DataDetailsContent = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    
    const data = [
        {
            personName: "John Doe",
            ic: "123456-78-9101",
            locationName: "Location A",
            address: "123 Main St, City, Country",
            coordinates: "3.1390, 101.6869",
            uploadedTime: "2024-10-16 10:00 AM",
            pointType: "green",
        },
        {
            personName: "Jane Smith",
            ic: "987654-32-1098",
            locationName: "Location B",
            address: "456 Side St, Another City, Country",
            coordinates: "2.9264, 101.6964",
            uploadedTime: "2024-10-15 2:30 PM",
            pointType: "red",
        },
        {
            personName: "Alex Green",
            ic: "321654-98-7654",
            locationName: "Location C",
            address: "789 Park Ave, Another City, Country",
            coordinates: "4.0000, 101.3000",
            uploadedTime: "2024-10-15 3:00 PM",
            pointType: "yellow",
        },
        {
            personName: "Jack Lim",
            ic: "111111-22-3333",
            locationName: "Location D",
            address: "222 Moo St, Moo City, Country",
            coordinates: "6.1390, 101.6869",
            uploadedTime: "2024-11-16 11:00 AM",
            pointType: "green",
        },
        {
            personName: "Jennie Kim",
            ic: "888888-88-8888",
            locationName: "Location E",
            address: "333 Main DD, DD City, Country",
            coordinates: "3.2290, 101.6869",
            uploadedTime: "2024-12-16 8:00 AM",
            pointType: "green",
        },
        {
            personName: "Jessy J",
            ic: "232323-66-6666",
            locationName: "Location F",
            address: "888 Main St, City, Country",
            coordinates: "7.1390, 101.6869",
            uploadedTime: "2024-4-16 7:00 AM",
            pointType: "green",
        },
        {
            personName: "Mc Tan",
            ic: "555555-55-5555",
            locationName: "Location G",
            address: "12 Tmn St, City, Country",
            coordinates: "9.1390, 101.6869",
            uploadedTime: "2024-2-16 4:00 PM",
            pointType: "green",
        },
    ];

    const filteredData = data.filter((item) => {
        const matchesSearchTerm =
            item.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ic.includes(searchTerm) ||
            item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === "all" || item.pointType === filter;

        return matchesSearchTerm && matchesFilter;
    });

    return (
        <div style={styles.container}>
            {/* Flex container for search bar and filter */}
            <div style={styles.searchFilterContainer}>
                {/* Search input */}
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

                {/* Point Filter Component aligned to the right */}
                <PointFilter filter={filter} onChange={handleFilterChange} />
            </div>

            {/* Table */}
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
                        {filteredData.map((item, index) => (
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
   
    searchFilterContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px", 
    },
    searchContainer: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: "5px",
        border: "1px solid #ccc",
        padding: "5px 10px",
        width: "300px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
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
        height: "400px",  
        overflowY: "auto", 
        marginTop: "20px",
        border: "1px solid #ddd",
        boxSizing: "border-box", 
    },
    table: {
        width: "100%",  
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
        position: "sticky", 
        top: "0",
        zIndex: "1",
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

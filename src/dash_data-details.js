import React, { useState, useEffect } from "react";
import PointFilter from "./components/pointfilter"; // Assuming you have this component
import axiosInstance from './axiosConfig'; 
import axios from "axios";

const DataDetailsContent = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [data, setData] = useState([]); // This will hold data fetched from the database
    const [loading, setLoading] = useState(true); // To track loading state
    const [error, setError] = useState(null); // To track any errors
    const [addresses, setAddresses] = useState({}); // State to hold fetched addresses

    // Fetch data from the backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/api/user/user-data');
                const mappedData = response.data.map(item => ({
                    personName: item.username,
                    ic: item.ic,
                    address: item.address,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    pointType: item.status,
                    uploadedTime: new Date().toLocaleString(),
                }));
                setData(mappedData);

                // Fetch addresses after getting the data
                const addressPromises = mappedData.map(async (item) => {
                    const address = await getAddressFromCoordinates(item.latitude, item.longitude);
                    return { ic: item.ic, address };
                });

                const addressesArray = await Promise.all(addressPromises);
                const addressesMap = addressesArray.reduce((acc, curr) => {
                    acc[curr.ic] = curr.address;
                    return acc;
                }, {});

                setAddresses(addressesMap);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to fetch address using nominatim openstreetmap API
    const getAddressFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            return {
                name: response.data.name || 'Name not found',
                display_name: response.data.display_name || 'Address not found'
            };
        } catch (error) {
            console.error('Error fetching address:', error);
            return { name: 'Name not found', display_name: 'Address not found' };
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    // Filter the data based on the search term and the selected point filter
    const filteredData = data.filter((item) => {
        const matchesSearchTerm =
            (item.personName && item.personName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.ic && typeof item.ic === "string" && item.ic.includes(searchTerm));

        const matchesFilter = filter === "all" || item.pointType === filter;

        return matchesSearchTerm && matchesFilter;
    });

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.searchFilterContainer}>
                {/* Search input on the left */}
                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search by name, IC, location, or address"
                        style={styles.searchInput}
                    />
                </div>

                {/* Filter component on the right */}
                <div style={styles.filterContainer}>
                    <PointFilter filter={filter} onChange={handleFilterChange} />
                </div>
            </div>

            {/* Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Person Name</th>
                            <th style={styles.th}>IC</th>
                            <th style={styles.th}>Location Name</th>
                            <th style={styles.th}>Full Address</th>
                            <th style={styles.th}>Coordinates</th>
                            <th style={styles.th}>Uploaded Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => {
                                const addressInfo = addresses[item.ic] || {};
                                return (
                                    <tr key={index}>
                                        <td style={styles.td}>{item.personName}</td>
                                        <td style={styles.td}>{item.ic}</td>
                                        <td style={styles.td}>{item.address}</td>
                                        {/* <td style={styles.td}>{addressInfo.name || 'Fetching name...'}</td> */}
                                        <td style={styles.td}>{addressInfo.display_name || 'Fetching address...'}</td>
                                        <td style={styles.td}>{`${item.latitude}, ${item.longitude}`}</td>
                                        <td style={styles.td}>{item.uploadedTime}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td style={styles.noDataTd} colSpan="6">
                                    No matching results found
                                </td>
                            </tr>
                        )}
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
        alignItems: "center",
        transition: "width 0.3s ease",
    },
    searchFilterContainer: {
        width: "90%",
        maxWidth: "1200px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px", // Reduced the space between the search/filter and the table
        boxSizing: "border-box",
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
    filterContainer: {
        display: "flex",
        alignItems: "center",
        marginLeft: "20px",
    },
    tableContainer: {
        width: "90%",
        maxWidth: "1200px",
        height: "400px",
        overflowY: "auto",
        marginTop: "10px", // Reduced the space between the search/filter and the table
        border: "1px solid #ddd",
        boxSizing: "border-box",
        backgroundColor: "#fff",
        borderRadius: "5px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
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
        width: "16.6%",
        position: "sticky",
        top: "0",
        zIndex: "1",
    },
    td: {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "left",
        backgroundColor: "transparent",
    },
    noDataTd: {
        textAlign: "center",
        padding: "20px",
        fontSize: "16px",
    },
};

export default DataDetailsContent;

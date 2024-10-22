import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import greenIcon from 'leaflet/dist/images/green-icon.png'; 
import redIcon from 'leaflet/dist/images/red_icon.png';
import yellowIcon from 'leaflet/dist/images/yellow_icon.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Function to create custom marker icon based on the status
const createCustomIcon = (status) => {
    let iconUrl;

    switch (status) {
        case 'green':
            iconUrl = greenIcon;
            break;
        case 'red':
            iconUrl = redIcon;
            break;
        case 'yellow':
            iconUrl = yellowIcon;
            break;
        default:
            iconUrl = markerIcon; 
            break;
    }

    return new L.Icon({
        iconUrl,
        shadowUrl: markerShadow,
        iconSize: [40, 61], // Size of the custom icon
        iconAnchor: [12, 41], // Anchor point
        popupAnchor: [1, -34], // Position of the popup relative to the icon
        shadowSize: [41, 41], // Shadow size
        shadowAnchor: [12, 41] // Shadow anchor point
    });
};

const OverviewContent = () => {
    const [users, setUsers] = useState([]);
    const [addresses, setAddresses] = useState({});
    const [filter, setFilter] = useState('all'); 
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axios.get('http://localhost:3001/api/user/user-data')
            .then(async (response) => {
                setUsers(response.data);

                const addressPromises = response.data.map(async (user) => {
                    const address = await getAddressFromCoordinates(user.latitude, user.longitude);
                    return { ic: user.ic, address };
                });

                const addressesArray = await Promise.all(addressPromises);
                const addressesMap = addressesArray.reduce((acc, curr) => {
                    acc[curr.ic] = curr.address;
                    return acc;
                }, {});
                setAddresses(addressesMap);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
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

    // Function to fetch address using Google Maps Geocoding API
    // const getAddressFromCoordinates = async (latitude, longitude) => {
    //     const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';  // Replace with your actual API key
    //     try {
    //         const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
    //         if (response.data.status === 'OK' && response.data.results.length > 0) {
    //             return response.data.results[0].formatted_address || 'Address not found';
    //         } else {
    //             return 'Address not found';
    //         }
    //     } catch (error) {
    //         console.error('Error fetching address:', error);
    //         return 'Address not found';
    //     }
    // };

    // set offset to have multiple user pointer
    const getOffsetCoordinates = (latitude, longitude, index) => {
        const offset = index * 0.00001; // Small offset for each user
        return [latitude + offset, longitude + offset];
    };

    // multiple pop-up at one pointer
    // const getUsersAtSameLocation = (latitude, longitude) => {
    //     return users.filter((user) => user.latitude === latitude && user.longitude === longitude);
    // };

    // Function to handle the filter change
    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    // Filter users based on the selected status filter
    // const filteredUsers = filter === 'all' ? users : users.filter(user => user.status === filter);

    // Function to handle search query change
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Filter users based on search and selected status filter
    const filteredUsers = users.filter((user) => {
        const userAddress = addresses[user.ic] || {};
        const matchesSearch =
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (userAddress.display_name && userAddress.display_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = filter === 'all' || user.status === filter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div style={styles.overviewContainer}>
            <div style={{display: 'flex', flexDirection: 'row', width: '100%', marginBottom: '20px'}}>
                <div style={styles.mapContainer}>
                    <MapContainer center={[4.5, 102]} zoom={7} style={{ height: '400px', width: '100%' }}>
                        <TileLayer
                            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {/* multiple pop-up at one pointer */}
                        {/* {Array.isArray(filteredUsers) && filteredUsers.map((user, index) => {
                        const usersAtLocation = getUsersAtSameLocation(user.latitude, user.longitude);
                        return (
                            <Marker
                                key={`${user.ic}-${index}`}
                                position={[user.latitude, user.longitude]}
                                icon={createCustomIcon(user.status)}
                            >
                                <Popup>
                                    <div>
                                        <h4>Users at this location:</h4>
                                        <ul>
                                            {usersAtLocation.map((u) => (
                                                <li key={u.ic}>
                                                    Name: {u.username} | Status: {u.status}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })} */}
                        {Array.isArray(filteredUsers) && filteredUsers.map((user, index) => (
                            <Marker
                                key={user.ic}
                                position={getOffsetCoordinates(user.latitude, user.longitude, index)} // Slight offset
                                icon={createCustomIcon(user.status)} // Set icon based on status
                            >
                                {/* using OpenStreetMap get the address link */}
                                <Popup>
                                    <div>
                                        Name: {user.username} <br />
                                        Staus: {user.status.toUpperCase()} <br />
                                        Location Name: {addresses[user.ic]?.name || 'Fetching name...'} <br />
                                        {/* Full Address: {addresses[user.ic]?.display_name || 'Fetching address...'} <br /> */}
                                        {addresses[user.ic]?.name && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresses[user.ic]?.name || `${user.latitude},${user.longitude}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View on Google Maps
                                            </a>
                                        )}
                                    </div>
                                </Popup>
                                {/* using Google Map API get the address link
                            <Popup>
                                <div style={getPopupStyleByStatus(user.status)}> 
                                    Name: {user.username} <br />
                                    Location Name: {addresses[user.ic]?.name || 'Fetching name...'} <br />
                                    Full Address: {addresses[user.ic]?.display_name || 'Fetching address...'} <br />
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresses[user.ic] || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View on Google Maps
                                    </a>
                                </div>
                            </Popup> */}
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
                <div style={styles.statusExplanation}>
                    <h3>Status Legend</h3>
                    <p><span style={styles.greenDot}></span> Green: All Checked!</p>
                    <p><span style={styles.yellowDot}></span> Yellow: Address Failed!</p>
                    <p><span style={styles.redDot}></span> Red: Haven't Submit!</p>
                </div>
            </div>

            <div style={styles.filterContainer}>
                <div style={styles.filter2Container}>
                    <div style={styles.leftContainer}>
                        <h3>
                            Overview to All User's Status
                        </h3>
                    </div>
                    <div style={styles.rightContainer}>
                        <select
                            id="statusFilter"
                            value={filter}
                            onChange={handleFilterChange}
                            style={styles.statusSelect}
                        >
                            <option value="all">All Status</option>
                            <option value="green">Green Status</option>
                            <option value="yellow">Yellow Status</option>
                            <option value="red">Red Status</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search by username or address..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            style={styles.searchInput}
                        />
                    </div>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Username</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Location Name</th>
                            <th style={styles.th}>Full Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => {
                            const userAddress = addresses[user.ic] || {};
                            return (
                                <tr key={user.ic}>
                                    <td style={styles.td}>{user.username}</td>
                                    <td style={styles.td}>{user.status}</td>
                                    <td style={styles.td}>{userAddress.name || 'Fetching name...'}</td>
                                    <td style={styles.td}>{userAddress.display_name || 'Fetching address...'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    overviewContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100vh",
        width: "100%",
        padding: "20px",
        overflowY: "auto",
        boxSizing: "border-box",
    },
    statusExplanation: {
        backgroundColor: "#f9f9f9",
        textAlign: "left",
        width: "30%",
        padding: "10px 20px"
    },
    greenDot: {
        height: "12px",
        width: "12px",
        backgroundColor: "green",
        borderRadius: "50%",
        display: "inline-block",
        marginRight: "10px",
    },
    yellowDot: {
        height: "12px",
        width: "12px",
        backgroundColor: "yellow",
        borderRadius: "50%",
        display: "inline-block",
        marginRight: "10px",
    },
    redDot: {
        height: "12px",
        width: "12px",
        backgroundColor: "red",
        borderRadius: "50%",
        display: "inline-block",
        marginRight: "10px",
    },
    mapContainer: {
        width: "100%",
        height: "100%",
        maxWidth: "1200px", // Set a max width to limit content width
    },
    filterContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        marginBottom: "20px", // Add space between sections
    },
    filter2Container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        width: "100%"
    },
    leftContainer: {
        width: "40%"
    },
    rightContainer: {
        display: "flex",
        flexDirection: "row",
        width: "60%",
        gap: "20px"
    },
    statusLabel: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#333",
        marginRight: "10px",
    },
    statusSelect: {
        padding: "8px 12px",
        borderRadius: "5px",
        border: "1px solid #ddd",
        fontSize: "14px",
        fontWeight: "500",
        color: "#333",
        outline: "none",
        cursor: "pointer",
    },
    searchInput: {
        padding: "8px 12px",
        borderRadius: "5px",
        border: "1px solid #ddd",
        fontSize: "14px",
        width: "100%",
        fontWeight: "500",
        color: "#333",
        outline: "none",
    },
    tableContainer: {
        width: "100%",
        maxWidth: "1200px", // Set max width to match the rest
        marginBottom: "20px", // Add space at the bottom
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "16px",
    },
    th: {
        padding: "10px",
        border: "1px solid #ddd",
        backgroundColor: "#f4f4f4",
        fontWeight: "bold",
    },
    td: {
        padding: "10px",
        border: "1px solid #ddd",
    },
};

export default OverviewContent;

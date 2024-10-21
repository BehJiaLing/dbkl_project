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

// Function to get the popup style based on status
const getPopupStyleByStatus = (status) => {
    let backgroundColor;

    switch (status) {
        case 'green':
            backgroundColor = '#03fc62';
            break;
        case 'red':
            backgroundColor = '#ff8c8c';
            break;
        case 'yellow':
            backgroundColor = '#faec55';
            break;
        default:
            backgroundColor = 'white'; // Default popup color
            break;
    }

    return {
        backgroundColor,
        padding: '5px',
        borderRadius: '5px',
    };
};

const OverviewContent = () => {
    const [users, setUsers] = useState([]);
    const [addresses, setAddresses] = useState({});

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

    return (
        <MapContainer center={[4.5, 102]} zoom={7} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {Array.isArray(users) && users.map((user, index) => (
                <Marker
                    key={user.ic}
                    position={[user.latitude, user.longitude]}
                    icon={createCustomIcon(user.status)} // Set icon based on status
                >
                    {/* using OpenStreetMap get the address link */}
                    <Popup>
                        <div style={getPopupStyleByStatus(user.status)}> {/* Set background color */}
                            Name: {user.username} <br />
                            Address: {addresses[user.ic]?.display_name || 'Fetching address...'} <br />
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#0388fc' }}
                            >
                                View on Google Maps
                            </a>
                        </div>
                    </Popup>
                    {/* using Google Map API get the address link */}
                    {/* <Popup>
                        <div style={getPopupStyleByStatus(user.status)}> 
                            Name: {user.username} <br />
                            Address: {addresses[user.ic]?.display_name || 'Fetching address...'} <br />
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
    );
};

export default OverviewContent;

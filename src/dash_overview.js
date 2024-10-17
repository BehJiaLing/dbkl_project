import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41]
});

const OverviewContent = () => {
    const [users, setUsers] = useState([]);
    const [addresses, setAddresses] = useState({});

    useEffect(() => {
        axios.get('http://localhost:3001/api/user/user-data')
            .then(async response => {
                setUsers(response.data);

                // Fetch addresses for each user using their userId as the unique key
                const addressPromises = response.data.map(async (user) => {
                    const address = await getAddressFromCoordinates(user.latitude, user.longitude);
                    return { ic: user.ic, address }; // Use userId as the unique key
                });

                const addressesArray = await Promise.all(addressPromises);
                const addressesMap = addressesArray.reduce((acc, curr) => {
                    acc[curr.ic] = curr.address; // Store address by userId
                    return acc;
                }, {});
                console.log(addressesMap);
                setAddresses(addressesMap);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    const getAddressFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            return response.data.display_name || 'Address not found';
        } catch (error) {
            console.error('Error fetching address:', error);
            return 'Address not found';
        }
    };

    return (
        <MapContainer center={[5.4141, 100.3288]} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {Array.isArray(users) && users.map((user, index) => (
                <Marker key={user.ic} position={[user.latitude, user.longitude]} icon={customMarkerIcon}>
                    <Popup>
                        Name: {user.username} <br />
                        Address: {addresses[user.ic] || 'Fetching address...'}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default OverviewContent;

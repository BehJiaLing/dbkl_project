import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const OverviewContent = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/user/user-data')
            .then(response => {
                console.log(response.data);
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    return (
        <MapContainer center={[5.4141, 100.3288]} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Check if users is an array before mapping */}
            {Array.isArray(users) && users.map((user, index) => (
                <Marker key={index} position={[user.latitude, user.longitude]}>
                    <Popup>
                        {user.username} <br /> Latitude: {user.latitude} <br /> Longitude: {user.longitude}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default OverviewContent;
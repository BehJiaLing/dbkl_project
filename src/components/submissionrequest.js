import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../axiosConfig';

const SubmissionRequest = () => {
    const [selectedTries, setSelectedTries] = useState('all');
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleTriesChange = (e) => {
        setSelectedTries(e.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/user/user-data');
                
                // Debug: Log the response to check if the data format is correct
                console.log("API Response:", response.data); 
                
                setUsers(Array.isArray(response.data) ? response.data : []);  // Ensure it's an array
                setError(null);  // Clear any previous errors
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter users based on selected number of tries (submitAttend)
    const filteredUsers = selectedTries === 'all'
        ? users
        : users.filter(user => user.submitAttend === parseInt(selectedTries, 10));

    return (
        <div className="container">
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}

            {!loading && !error && (
                <>
                    <div className="tries-filter">
                        <label htmlFor="tries">Tries: </label>
                        <select id="tries" value={selectedTries} onChange={handleTriesChange}>
                            <option value="all">All</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                        </select>
                    </div>

                    <div className="user-list">
                        <h3>List of Users</h3>
                        {filteredUsers.length > 0 ? (
                            <ul>
                                {filteredUsers.map((user, index) => (
                                    <li key={index}>
                                        {user.username} - {user.submitAttend !== undefined ? user.submitAttend : '0'} tries
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No users found with the selected number of tries.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SubmissionRequest;

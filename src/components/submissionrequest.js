import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../axiosConfig';

const SubmissionRequest = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Filter users with submitAttend greater than 3
    const filteredUsers = users.filter(user => user.submitAttend > 3);

    // Handle Accept button click
    const handleAccept = async (userId) => {
        try {
            // Make a request to reset submission count and remove from FailedSubmission
            const response = await axios.put(`http://localhost:3001/api/user/FailedSubmission/${userId}`);

            if (response.status === 200) {
                // Update UI to remove the user from the list
                setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
                alert(response.data.message);
            } else {
                alert("Failed to reset user's submission count. Please try again.");
            }
        } catch (error) {
            console.error("Error accepting user:", error);
            alert("An error occurred while processing the request.");
        }
    };

    return (
        <div className="container">
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}

            {!loading && !error && (
                <div className="user-list">
                    <h3 style={{ fontSize: '16px', fontWeight: 'normal' }}>More Than 3 Times</h3>
                    
                    {filteredUsers.length > 0 ? (
                        <ul>
                            {filteredUsers.map((user, index) => (
                                <li key={index} style={{ marginBottom: '8px' }}>
                                    {user.username} {/* Removed the tries count */}
                                    <button 
                                        style={{ marginLeft: '10px' }}
                                        onClick={() => handleAccept(user.id)} // Pass user.id instead of user.username
                                    >
                                        Accept
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No users found with more than 3 tries.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubmissionRequest;

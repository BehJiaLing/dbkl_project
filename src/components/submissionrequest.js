import React, { useState } from 'react';

const SubmissionRequest = () => {
    const [selectedTries, setSelectedTries] = useState('all');

    const handleTriesChange = (e) => {
        setSelectedTries(e.target.value);
    };

    return (
        <div className="container">
            <div className="tries-filter">
                <label htmlFor="tries">Tries: </label>
                <select id="tries" value={selectedTries} onChange={handleTriesChange}>
                    <option value="all">All</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                </select>
            </div>
        </div>
    );
};


export default SubmissionRequest;

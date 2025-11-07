'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import './CreateMovement.css';

const CreateMovement: React.FC = () => {
    const [movementName, setMovementName] = useState('');

    // Dropdown #2 State
    const [openCategory, setOpenCategory] = useState(false);
    const [categoryValue, setCategoryValue] = useState('Boxing');

    const categoryOptions = ['Boxing', 'Boxing2', 'Boxing3', 'Boxing4'];

    const handleSubmit = () => {};

    return (
        <div className="movement-container content-admin-movment">
            <div className="movement-card">
                <h2>Movement Details</h2>
                <form onSubmit={handleSubmit} className="movement-form">
                    <label>Movement Name</label>
                    <input
                        type="text"
                        placeholder="Enter movement name"
                        value={movementName}
                        onChange={(e) => setMovementName(e.target.value)}
                        required
                    />
                    <div className="category catCtn">
                        <label htmlFor="category">Category</label>
                        <div className="customDropdown">
                            <button
                                type="button"
                                className={`dropdownBtn ${openCategory ? 'active' : ''}`}
                                onClick={() => setOpenCategory(!openCategory)}
                            >
                                {categoryValue}
                            </button>

                            {openCategory && (
                                <ul className="dropdownList">
                                    {categoryOptions.map((opt) => (
                                        <li
                                            key={opt}
                                            className="dropdownItem"
                                            onClick={() => {
                                                setCategoryValue(opt);
                                                setOpenCategory(false);
                                            }}
                                        >
                                            {opt}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="workoutsVdo">
                        <h2>Upload Photos and Videos</h2>
                        <div className="uploadBox">
                            <input
                                type="file"
                                accept="video/*"
                                id="videoUploads"
                                className="videoUpload"
                            />
                            <label htmlFor="videoUploads" className="uploadLabel">
                                <div className="uploadIcon">
                                    <img src="/vdo_upload_icon.png" alt="upload-icon" />
                                </div>
                                <p className="wrkoutVdoPara">
                                    <span className="workVdioBtn">Select To Upload</span>
                                    <span> or drag your video here</span>
                                </p>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateMovement;

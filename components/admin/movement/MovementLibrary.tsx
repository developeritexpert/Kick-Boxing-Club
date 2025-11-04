'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import './MovementLibrary.css';

type Movement = {
    id: string;
    name: string;
    category: string;
    created_by: string;
    video_url?: string;
    video_provider?: string;
};

const MovementLibrary: React.FC = () => {
    return (
        <div>
            <div className="library-container">
                <h3 className="hdr">Edit Movement</h3>

                <div className="edit-mvmbt">
                    <div className="edit-mvmnt-cntnt">
                        <div className="mvmnt-name  cat-ctn">
                            <label htmlFor="movementName">Movement Name</label>
                            <select id="movementName" className="cate-sel">
                                <option value="jab-cross-combo">Jab-Cross Combo</option>
                                <option value="jab-cross-combo2">Jab-Cross Combo2</option>
                                <option value="jab-cross-combo3">Jab-Cross Combo3</option>
                                <option value="jab-cross-combo4">Jab-Cross Combo4</option>
                            </select>
                        </div>

                        <div className="category  cat-ctn">
                            <label htmlFor="category">Category</label>
                            <select id="category" className="cate-sel">
                                <option>Boxing</option>
                                <option>Boxing2</option>
                                <option>Boxing3</option>
                                <option>Boxing4</option>
                            </select>
                        </div>
                    </div>

                    <div className="subcategory cat-ctn">
                        <label htmlFor="subcategory">Sub- category</label>
                        <select id="subcategory" className="cate-sel">
                            <option>Upper Body</option>
                            <option>Upper Body2</option>
                            <option>Upper Body3</option>
                            <option>Upper Body4</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="workoutsVdo">
                <h2>Upload Photos and Videos</h2>
                <div className="uploadBox">
                    <input type="file" accept="video/*" id="videoUpload" />
                    <label htmlFor="videoUpload" className="uploadLabel">
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
            <button className="btn btn-black delt-btn">Delete Movement</button>
        </div>
    );
};

export default MovementLibrary;

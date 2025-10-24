"use client";

import React, { useState } from "react";
import "./CreateMovement.css";

const CreateMovement: React.FC = () => {
  const [movementName, setMovementName] = useState("");
  const [category, setCategory] = useState("Upper body");
  const [video, setVideo] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ movementName, category, video });
    alert("Movement submitted!");
  };

  return (
    <div className="movement-container">
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

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Upper body</option>
            <option>Lower body</option>
            <option>Cardio</option>
            <option>Full body</option>
          </select>

          <label>Upload Videos</label>
          <div className="upload-box">
            <input
              type="file"
              accept="video/*"
              id="videoUpload"
              onChange={handleFileChange}
            />
            <label htmlFor="videoUpload" className="upload-label">
              <div className="upload-icon">⬆️</div>
              <p>Select to Upload<br />or drag your video here</p>
            </label>
            {video && <p className="file-name">{video.name}</p>}
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

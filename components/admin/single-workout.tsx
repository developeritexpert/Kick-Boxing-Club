"use client";

import React from "react";
import "./single-workout.css";

const SingleWorkout: React.FC = () => {
  return (
    <div className="single-workout-container">
      <div className="workout-card">
        <img
          src="https://picsum.photos/800/400?random=1"
          alt="Workout"
          className="workout-image"
        />

        <h1 className="workout-title">Morning Kickboxing Live</h1>

        <div className="workout-meta">
          <div className="meta-item">
            <span className="meta-label">Duration:</span>
            <span className="meta-value">60 min</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Status:</span>
            <span className="meta-value status-active">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleWorkout;

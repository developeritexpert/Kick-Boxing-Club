'use client';

import React from 'react';
// import Image from 'next/image';
import './single-workout.css';

const SingleWorkout: React.FC = () => {
    return (
        <div className="single-workout-container">
            <div className="workout-card">
                <img
                    src="https://picsum.photos/800/400?random=1"
                    alt="Workout"
                    className="workout-image"
                />
                {/* <Image src="https://picsum.photos/800/400?random=1" alt="Workout" width={800} height={400} className="workout-image" priority /> */}
                <div className="casting-cnt">
                     <h1 className="workout-title">Morning Kickboxing Live</h1>
                     <img src="/casting_icon.png" alt="casting img"/>

                </div>

                <div className="workout-meta">
                    <div className="meta-item">
                          <span className="meta-icon">
                            <img src="/duration_icon.png" alt="tick_icon"/>
                          </span>
                        <span className="meta-label">Duration:</span>
                        <span className="meta-value">60 min</span>
                    </div>
                    <div className="meta-item">
                         <span className="meta-icon">
                            <img src="/tick_icon.png" alt="duration_icon"/>
                          </span>
                        <span className="meta-label">Status:</span>
                        <span className="meta-value status-active">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleWorkout;

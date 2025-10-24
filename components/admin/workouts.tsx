"use client";

import React from "react";
import "./workouts.css";

interface Workout {
  id: number;
  title: string;
  duration: string;
  difficulty: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

const Workouts: React.FC = () => {
  const workouts: Workout[] = [
    {
      id: 1,
      title: "Upper Body Power Session",
      duration: "35 min",
      difficulty: "Intermediate",
      level: "Intermediate"
    },
    {
      id: 2,
      title: "Lower Body 20 min",
      duration: "20 min",
      difficulty: "Advanced",
      level: "Advanced"
    },
    {
      id: 3,
      title: "Kickboxing Burnout",
      duration: "25 min",
      difficulty: "Advanced",
      level: "Advanced"
    },
    {
      id: 4,
      title: "Boxing Combos",
      duration: "15 min",
      difficulty: "Intermediate",
      level: "Intermediate"
    },
    {
      id: 5,
      title: "Core Sired Circuit",
      duration: "15 min",
      difficulty: "Beginner",
      level: "Beginner"
    },
    {
      id: 6,
      title: "Full Body",
      duration: "30 min",
      difficulty: "Beginner",
      level: "Beginner"
    }
  ];

  const getDifficultyClass = (level: string) => {
    switch (level) {
      case "Beginner":
        return "difficulty-beginner";
      case "Intermediate":
        return "difficulty-intermediate";
      case "Advanced":
        return "difficulty-advanced";
      default:
        return "difficulty-beginner";
    }
  };

  return (
    <div className="workouts-container">
        
      <div className="workouts-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search workouts..." 
            className="search-input"
          />
        </div>
        <button className="add-workout-btn">
          Add New
        </button>
      </div>

      <div className="workouts-grid">
        {workouts.map((workout) => (
          <div key={workout.id} className="workout-card">
            <div className="workout-header">
              <h3 className="workout-title">{workout.title}</h3>
              <span className={`difficulty-badge ${getDifficultyClass(workout.level)}`}>
                {workout.level}
              </span>
            </div>
            <div className="workout-duration">{workout.duration}</div>
            <div className="workout-difficulty">{workout.difficulty}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workouts;
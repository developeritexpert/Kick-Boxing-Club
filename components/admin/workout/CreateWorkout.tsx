'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './CreateWorkout.css';

const CreateWorkout: React.FC = () => {
  const [location, setLocation] = useState('');
  const [classType, setClassType] = useState('');
  const [focus, setFocus] = useState('');
  const [search, setSearch] = useState('');

  const handleCreate = () => {
    alert('Workout created!');
  };

  const handleCancel = () => {
    setLocation('');
    setClassType('');
    setFocus('');
    setSearch('');
  };

  return (
    <div className="create-workout-container">
      <div className="header">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="create-workout-content">

        <div className="workout-library card">
          <h3>Workout Library</h3>

          <div className="form-group">
            <label>Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Select location</option>
              <option value="studio1">Studio 1</option>
              <option value="studio2">Studio 2</option>
            </select>
          </div>

          <div className="form-group">
            <label>Class</label>
            <select
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
            >
              <option value="">Select class</option>
              <option value="boxing">Boxing</option>
              <option value="kickboxing">Kickboxing</option>
            </select>
          </div>

          <div className="form-group focus-group">
            <label>Focus</label>
            <div className="focus-buttons">
              {['Upper Body', 'Lower Body', 'Full Body'].map((f) => (
                <button
                  key={f}
                  className={`focus-btn ${focus === f ? 'active' : ''}`}
                  onClick={() => setFocus(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="workout-list">
            <h4>Workout List</h4>
            <ul>
              <li>Push Ups — Jab / Cross / Hook</li>
              <li>Sit Ups</li>
              <li>Jab / Cross / Right Hand</li>
              <li>Mountain Climbers</li>
              <li>Jab / Cross / Left Hand</li>
            </ul>
          </div>
        </div>


        <div className="class-type card">
          <h3>Class Type</h3>
          <div className="class-columns">
            <div className="class-column">
              <h4>Boxing</h4>
              {[1, 2, 3, 4].map((_, i) => (
                <input key={i} type="text" className="class-input" />
              ))}
            </div>
            <div className="class-column">
              <h4>Kickboxing</h4>
              {[1, 2, 3, 4].map((_, i) => (
                <input key={i} type="text" className="class-input" />
              ))}
            </div>
          </div>
        </div>
      </div>


      <div className="button-group">
        <button className="btn cancel" onClick={handleCancel}>Cancel</button>
        <button className="btn create" onClick={handleCreate}>Create</button>
      </div>
    </div>
  );
};

export default CreateWorkout;
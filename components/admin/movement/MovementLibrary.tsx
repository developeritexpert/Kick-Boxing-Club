"use client";

import React, { useState } from "react";
import "./MovementLibrary.css";

const MovementLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const movements = [
    { name: "Jump Squats", category: "HIIT", addedBy: "John Doe" },
    { name: "Jab-Cross Combo", category: "Boxing", addedBy: "Sarah K." },
    { name: "Roundhouse Kick", category: "Kickboxing", addedBy: "Mark P." },
    { name: "Burpees", category: "HIIT", addedBy: "Lisa T." },
    { name: "Hook-Uppercut Combo", category: "Boxing", addedBy: "Alex R." },
    { name: "Side Kick", category: "Kickboxing", addedBy: "John D." },
  ];

  const filteredMovements = movements.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter === "All" || m.category === filter)
  );

  return (
    <div className="library-container">
      <div className="library-header">
        <input
          type="text"
          placeholder="🔍  Search..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="category-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>HIIT</option>
          <option>Boxing</option>
          <option>Kickboxing</option>
        </select>
      </div>

      <div className="table-container">
        <table className="movement-table">
          <thead>
            <tr>
              <th>Movement Name</th>
              <th>Category</th>
              <th>Added By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((m, index) => (
              <tr key={index}>
                <td>{m.name}</td>
                <td>{m.category}</td>
                <td>{m.addedBy}</td>
                <td>
                  <button className="edit-btn">✏️ Edit</button>
                  <button className="delete-btn">🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovementLibrary;

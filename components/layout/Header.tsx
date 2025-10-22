"use client";

import React from "react";

export default function Header({ onToggle }: { onToggle?: () => void }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        {/* optional header toggle (hidden on wide screens) */}
        <button className="header-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          ☰
        </button>
      </div>

      <div className="header-title">Welcome to Dashboard, John Doe!</div>

      <div className="header-right">
        <img src="/logo.png" alt="Kickboxing Club" className="header-logo" />
      </div>
    </header>
  );
}

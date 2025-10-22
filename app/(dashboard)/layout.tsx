"use client";

import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "../../styles/dashboard.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Single source of truth for sidebar collapsed state
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-layout ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="main-area">
        <Header onToggle={() => setCollapsed(!collapsed)} />
        <main className="content-area">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

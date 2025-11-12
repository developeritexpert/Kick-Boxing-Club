'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/layout/instructor/Sidebar';
import Header from '../../../components/layout/instructor/Header';
import Footer from '../../../components/layout/instructor/Footer';
import '../../../styles/instructor/dashboard.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Single source of truth for sidebar collapsed state
    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (window.innerWidth < 768) {
            setCollapsed(true);
        }
    }, []);

    return (
        <div className={`admin-layout instructor ${collapsed ? 'collapsed' : ''}`}>
            {/* <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} /> */}
            {mounted && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}

            <div className="main-area">
                <Header onToggle={() => setCollapsed(!collapsed)} />
                <main className="content-area instructor-area">{children}</main>
                <Footer />
            </div>
        </div>
    );
}

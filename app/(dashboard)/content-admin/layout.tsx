'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/layout/conten_admin/Sidebar';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import '../../../styles/content_admin_dashboard.css/dashboard.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Single source of truth for sidebar collapsed state
    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
            {/* <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} /> */}
            {mounted && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}

            <div className="main-area">
                <Header onToggle={() => setCollapsed(!collapsed)} />
                <main className="content-area">{children}</main>
                <Footer />
            </div>
        </div>
    );
}

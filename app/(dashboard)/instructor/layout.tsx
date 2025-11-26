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
    
        useEffect(() => {
        if (!mounted) return;

        const isMobile = window.innerWidth < 768;
        if (isMobile && !collapsed) {
            // sidebar open → freeze main content
                 document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
  
        } else {
            // sidebar closed → restore scrolling
        document.body.style.overflow = '';
                       document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
         
        }
    }, [collapsed, mounted]); 

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

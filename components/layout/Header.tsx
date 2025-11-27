'use client';

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
// import Image from 'next/image';

export default function AdminHeader({ onToggle }: { onToggle?: () => void }) {
    const user = useAuthStore((state) => state.user);

    const firstName = user?.first_name ?? "";
    const lastName = user?.last_name ?? "";
    return (
        <header className="dashboard-header">
            <div className="header-left">
                {/* optional header toggle (hidden on wide screens) */}
                <button className="header-toggle" onClick={onToggle} aria-label="Toggle sidebar">
                    ☰
                </button>
            </div>

            <div className="header-title">
                {firstName.length > 10 ? firstName.substring(0, 10) + '... ' : ` ${firstName} ` }{" "}
                <span className="last-name">
                    {lastName.length > 10 ? lastName.substring(0, 10) + "..." : lastName}
                </span>
            </div>

            <div className="header-right">
                <img src="/logo.png" alt="Kickboxing Club" className="header-logo" />
                {/* <Image
                    src="/logo.png"
                    alt="Kickboxing Club"
                    width={72}
                    height={36}
                    className="header-logo"
                    priority
                /> */}
            </div>
        </header>
    );
}

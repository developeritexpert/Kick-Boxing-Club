'use client';

import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
 import Image from 'next/image';

export default function Header({ onToggle }: { onToggle?: () => void }) {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="dashboard-header">
            <div className="header-left">
                {/* optional header toggle (hidden on wide screens) */}
                <button className="header-toggle" onClick={onToggle} aria-label="Toggle sidebar">
                    ☰
                </button>
            </div>

            {/* <div className="header-title">Welcome to Dashboard, John Does!</div> */}
            <div className="header-title">
             {user?.first_name} {user?.last_name}
            </div>

            <div className="header-right">
                {/* <Image src="/logo.png" alt="Kickboxing Club" className="header-logo"   width={72}
                 priority
                    height={90}/> */}
                <img
                    src="/logo.png"
                    alt="Kickboxing Club"
                    className="header-logo"
                />
            </div>
        </header>
    );
}

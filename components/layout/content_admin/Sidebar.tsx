'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import { supabaseClient } from '@/lib/supabaseClient';
import Link from 'next/link';

type Props = {
    collapsed: boolean;
    setCollapsed: (val: boolean) => void;
};

const menu = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: '/home_icon.png',
        alt: 'home-icon',
        href: '/content-admin',
    },
    // { key: 'users', label: 'User Management', icon: '/create_management_icon.png',alt:"create-library-icon" , href: '/content-admin/users' },
    // { key: 'workouts', label: 'Workout Library', icon: '📚', href: '/admin/workouts' },
    {
        key: 'movement',
        label: 'Create a Movement',
        icon: '/create_movmnt.png',
        alt: 'create_movmnt_icon',
        href: '/content-admin/movement/create',
    },
    {
        key: 'momentLibrary',
        label: 'Movement Library',
        icon: '/movement_library_icon.png',
        alt: 'movement_library_icon_icon',
        href: '/content-admin/movement/library',
    },
    {
        key: 'workout',
        label: 'Create a Workout',
        icon: '/create_workout_icon.png',
        alt: '/create_workout_icon.png',
        href: '/content-admin/workouts/create',
    },
    {
        key: 'workoutLibrary',
        label: 'Workout Library',
        icon: '/workout_libray.png',
        alt: 'workout_libray_icon',
        href: '/content-admin/workouts',
    },
    {
        key: 'favorites',
        label: 'My Favorites',
        icon: '/myFav_icon.png',
        alt: 'myFav__icon',
        href: '/content-admin/favorites',
    },
    {
        key: 'recent',
        label: 'Recent Workouts',
        icon: '/recent_icon.png',
        alt: 'recent__icon',
        href: '/content-admin/recent',
    },
    // { key: "builder", label: "Workout Builder", icon: "🧩", href: "/admin/builder" },
    {
        key: 'settings',
        label: 'Settings',
        icon: '/setting_icon.png',
        alt: 'setting_icon',
        href: '/content-admin/settings',
    },
];

export default function Sidebar({ collapsed, setCollapsed }: Props) {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const clearUser = useAuthStore((state) => state.clearUser);

    useEffect(() => {
        setMounted(true);
    }, []);

    // const handleLogout = async () => {
    //     try {
    //         await supabaseClient.auth.signOut();

    //         clearUser();

    //         document.cookie = `sb-access-token=; path=/; max-age=0`;

    //         toast.success('Logged out successfully!');
    //         router.push('/');
    //     } catch (err) {
    //         console.error('Logout failed:', err);
    //         toast.error('Failed to logout!');
    //     }
    // };

    const handleLogout = async () => {
        try {
            document.cookie = 'sb-access-token=; path=/; max-age=0';
            document.cookie = 'sb-refresh-token=; path=/; max-age=0';
            document.cookie = 'user-role=; path=/; max-age=0';

            const logoutResult = await fetch('/api/auth/logout', { method: 'POST' });
            console.log(`logoutResult`);
            console.log(logoutResult);

            clearUser();
            toast.success('Logged out successfully!');
            router.push('/');
            router.refresh();
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    if (!mounted) return null;
    const handleSidebar = () => {
        if (window.innerWidth <= 768) {
            // Only mobile
            setCollapsed(true);
        }
    };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Sidebar">
            <div className="sidebar-top">
                <div className="sidebar-brand">
                    {/* <div className="hamburger" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
                        ☰
                    </div> */}
                    {!collapsed && <div className="brand-text">All Locations</div>}
                    {collapsed && (
                        <div className="brand-logo">
                            <Image
                                src="/KickboxingLogo.png"
                                alt="kickboxing-logo"
                                width={33}
                                height={33}
                            />
                        </div>
                    )}
                </div>
                <div className="close_btn" onClick={handleSidebar}>
                    <img src="/new_close.png" alt="close-img" />
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {menu.map((m) => {
                        const isActive =
                            m.href === '/content-admin'
                                ? pathname === '/content-admin'
                                : pathname === m.href;

                        return (
                            <li
                                key={m.key}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={handleSidebar}
                            >
                                <Link href={m.href} className="nav-link">
                                    <span className="nav-icon">
                                        <img src={m.icon} alt="home_icon" />
                                    </span>
                                    {!collapsed && <span className="nav-label">{m.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout">
                    <Image src="/logout_icon.png" alt="logout-icon" width={18} height={23} />
                    <span className="logout-text">Logout</span>
                </button>
            </div>
        </aside>
    );
}

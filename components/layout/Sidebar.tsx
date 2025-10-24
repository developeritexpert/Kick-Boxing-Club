"use client";

import React from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { supabaseClient } from '@/lib/supabaseClient';

type Props = {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
};

const menu = [
  { key: "dashboard", label: "Dashboard", icon: "🏠", href: "/admin" },
  { key: "users", label: "User Management", icon: "👤", href: "/admin/users" },
  { key: "workouts", label: "Workout Library", icon: "📚", href: "/admin/workouts" },
  { key: "movement", label: "Create a Movement", icon: "🏠", href: "/admin/movement/create" },
  { key: "momentLibrary", label: "Movement Library", icon: "🏠", href: "/admin/movement/library" },
  { key: "workout", label: "Create a Workout", icon: "💪", href: "/admin/create" },
  { key: "workoutLibrary", label: "Workout Library", icon: "💪", href: "/admin/workout/library" },
  { key: "favorites", label: "My Favorites", icon: "💪", href: "/admin/favorites" },
  { key: "recent", label: "Recent Workouts", icon: "💪", href: "/admin/recent" },
  // { key: "builder", label: "Workout Builder", icon: "🧩", href: "/admin/builder" },
  { key: "settings", label: "Setting", icon: "⚙️", href: "/admin/settings" },
];

export default function Sidebar({ collapsed, setCollapsed }: Props) {
  // Hardcoded active key for demo. Replace with router-based active detection.
  const activeKey = "dashboard";

    const router = useRouter()
    const clearUser = useAuthStore((state) => state.clearUser);

    // const handleLogout = () => {
    //     clearUser();
    //     document.cookie = `sb-access-token=; path=/; max-age=0`;
    //     toast.success("Logged out successfully!")
    //     router.push("/");
    // }

    const handleLogout = async () => {
    try {

      await supabaseClient.auth.signOut();

      clearUser();

      document.cookie = `sb-access-token=; path=/; max-age=0`;

      toast.success("Logged out successfully!");
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Failed to logout!");
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} aria-label="Sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="hamburger" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
            ☰
          </div>
          {!collapsed && <div className="brand-text">All Locations</div>}
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menu.map((m) => (
            <li key={m.key} className={m.key === activeKey ? "nav-item active" : "nav-item"}>
              <a href={m.href} className="nav-link">
                <span className="nav-icon">{m.icon}</span>
                {!collapsed && <span className="nav-label">{m.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick = {handleLogout} className="logout">Logout</button>
      </div>
    </aside>
  );
}

"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LogoutButton from "@/components/Logout/LogoutButton";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/auth/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <header className="flex justify-between items-center px-6 py-4 bg-gray-900 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-800">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <LogoutButton />
      </header>

      <section className="p-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome, {user.first_name || user.email} </h2>
        <p className="text-gray-300 text-lg mb-6">
          You are logged in as <span className="font-semibold text-blue-400">{user.role}</span>
        </p>

        <div className="bg-gray-800 bg-opacity-40 rounded-2xl p-6 shadow-lg border border-gray-700 max-w-md w-full">
          <h3 className="text-xl font-semibold mb-2">Your Info</h3>
          <ul className="text-gray-300 space-y-2 text-left">
            <li><strong>Email:</strong> {user.email}</li>
            {user.phone && <li><strong>Phone:</strong> {user.phone}</li>}
            <li><strong>Role:</strong> {user.role}</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

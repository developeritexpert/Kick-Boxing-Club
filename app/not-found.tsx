'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function NotFound() {
    const router = useRouter();
    const clearUser = useAuthStore((state) => state.clearUser);

    const handleLogout = async () => {
        try {
            document.cookie = 'sb-access-token=; path=/; max-age=0';
            document.cookie = 'sb-refresh-token=; path=/; max-age=0';
            document.cookie = 'user-role=; path=/; max-age=0';

            const logoutResult = await fetch('/api/auth/logout', { method: 'POST' });
            console.log(`logoutResult`);
            console.log(logoutResult);

            clearUser();
            // toast.success('Logged out successfully!');
            router.push('/');
            router.refresh();
        } catch (error) {
            // toast.error('Logout failed');
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-lg mb-4">Oops! The page you are looking for does not exist.</p>
                <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-md transition-all duration-200"
                >
                    Go to Home Page
                </button>
            </div>
        </main>
    );
}

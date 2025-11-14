'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();
    const clearUser = useAuthStore((state) => state.clearUser);
    // const handleLogout = () => {
    //     clearUser();
    //     document.cookie = `sb-access-token=; path=/; max-age=0`;
    //     document.cookie = `sb-refresh-token=; path=/; max-age=0`;
    //     document.cookie = `user-role=; path=/; max-age=0`;
    //     toast.success('Logged out successfully!');
    //     router.push('/');
    // };

    // logout btn
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

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
        >
            Logout 123
        </button>
    );
}

"use client"

import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LogoutButton(){
    const router = useRouter()
    const clearUser = useAuthStore((state) => state.clearUser);
    const handleLogout = () => {
        clearUser();
        document.cookie = `sb-access-token=; path=/; max-age=0`;
        toast.success("Logged out successfully!")
        router.push("/");
    }

    return (
        <button
            onClick = {handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200" 
        >
            Logout
        </button>
    );
}
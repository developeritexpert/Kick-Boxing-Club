'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-lg mb-4">Oops! The page you are looking for does not exist.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-md transition-all duration-200"
                >
                    Go to Home Page
                </button>
            </div>
        </main>
    );
}

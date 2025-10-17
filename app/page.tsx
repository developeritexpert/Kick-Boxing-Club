"use client";

import { useRouter } from "next/navigation";

// this page will work as login form as default 

export default function Page() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="text-center p-8 rounded-2xl bg-gray-900/60 backdrop-blur-lg shadow-2xl max-w-md w-full border border-gray-700">
        <h1 className="text-4xl font-bold mb-4">Welcome to Kick Boxing Club </h1>
        <p className="text-gray-300 mb-8">
          Join our community and track your progress.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/auth/login")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition duration-200"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/auth/register")}
            className="px-6 py-3 bg-gray-100 text-gray-900 hover:bg-white rounded-xl font-semibold transition duration-200"
          >
            Register
          </button>
        </div>
      </div>
    </main>
  );
}

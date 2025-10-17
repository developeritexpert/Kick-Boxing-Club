"use client";

import { useState , useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { API_ROUTES } from "@/lib/constants";
import toast from "react-hot-toast";
import { useAuthStore ,User } from "@/stores/useAuthStore";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") router.push("/admin/dashboard");
      else router.push("/dashboard");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues) => {
    setMessage(null);
    try {
      const res = await fetch(API_ROUTES.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setUser(result.user as User);
        toast.success("Login successful!");
        setMessage("Login successful! Redirecting...");

        // if (result.user.role === "admin") {
        //   router.push("/admin/dashboard")
        // }else {
        //   router.push("/dashboard")
        // }

      } else {
        toast.error(result.error || "Login failed");
        // setMessage(result.error || "Login failed");
      }
    } catch (err) {
      toast.error("something went wrong");
      setMessage("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="bg-gray-900 bg-opacity-40 backdrop-blur-lg rounded-2xl p-8 shadow-xl w-full max-w-md border border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {message && <p className="mt-3 text-center text-sm text-gray-200">{message}</p>}
          </div>

          <div className="mt-6 text-center text-gray-400 text-sm">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

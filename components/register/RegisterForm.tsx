"use client";

import { useState , useEffect} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { API_ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  // const setUser = useAuthStore((state) => state.setUser);
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormValues) => {
    setMessage(null);
    try {
      const res = await fetch(API_ROUTES.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Registration successful! Please check your email to confirm.");
        setMessage(" Registration successful! Please check your email to confirm.");
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        toast.error(result.error || "Registration failed");
        setMessage(result.error || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong");
      setMessage("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="bg-gray-900 bg-opacity-40 backdrop-blur-lg rounded-2xl p-8 shadow-xl w-full max-w-md border border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                {...register("first_name")}
                className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Last Name"
                {...register("last_name")}
                className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Phone Number"
                {...register("phone")}
                className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>

            {message && <p className="mt-3 text-center text-sm text-gray-200">{message}</p>}
          </div>

          <div className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Login here
            </button>
          </div>
        </form>
      </div>
    </main>

  );
}

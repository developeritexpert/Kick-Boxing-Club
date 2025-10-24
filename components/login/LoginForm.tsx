"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { API_ROUTES } from "@/lib/constants";
import { supabaseClient } from '@/lib/supabaseClient';
import toast from "react-hot-toast";
import { useAuthStore, User } from "@/stores/useAuthStore";
import "../../styles/login.css";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") router.push("/admin");
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

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await fetch(API_ROUTES.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        await supabaseClient.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });

        const { data: { user } } = await supabaseClient.auth.getUser();
        console.log("User from getUser:", user);

        setUser(result.user as User);
        toast.success("Login successful!");
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login To Your Account</h2>
        <p>Welcome Back! Log in to access your account and continue where you left off.</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <p style={{ color: "#c00", fontSize: "12px", marginTop: "5px", textAlign: "left" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className={errors.password ? "error" : ""}
            />
            {errors.password && (
              <p style={{ color: "#c00", fontSize: "12px", marginTop: "5px", textAlign: "left" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <div style={{ textAlign: "left", marginBottom: "10px" }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
          Forgot Password?
        </a>
      </div>
      <div className="login-footer">
        © Copyright Kickboxing Club. All Rights Reserved
      </div>
    </div>
  );
}
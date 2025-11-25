// app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import './forgotPassword.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null,
    );
    const supabase = createClientComponentClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Password reset link has been sent to your email!',
            });
            setEmail('');
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'An error occurred. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-pswrd-container">
            <div className="forgot-box">
                <div className="">
                    <h2 className="">Forgot your password?</h2>
                    <p className="inside-forget-para">
                        Enter your email address and we&apos;ll send you a link to reset your
                        password.
                    </p>
                </div>
                <form className="forget-form" onSubmit={handleSubmit}>
                    <div className="forget-form-email-address">
                        <label htmlFor="email" className="">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className=""
                            placeholder="Email address"
                        />
                    </div>

                    {message && (
                        <div
                            className={` forget-msg ${
                                message.type === 'success' ? 'bg-light-grn' : 'bg-light-rd'
                            }`}
                        >
                            <p
                                className={` ${
                                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}
                            >
                                {message.text}
                            </p>
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={loading} className="sbmit-btn">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>

                    <div className="text-center">
                        {/* <a
                        href="/"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                        Back to login
                        </a> */}

                        <Link href="/" className="back-to-lgin-btn">
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

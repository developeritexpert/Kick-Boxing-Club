// app/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import './resetPassword.css';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null,
    );
    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        // Check if user came from reset password email
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                // User is authorized to reset password
            }
        });
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setMessage({
                type: 'error',
                text: 'Passwords do not match',
            });
            setLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setMessage({
                type: 'error',
                text: 'Password must be at least 6 characters long',
            });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Password updated successfully! Redirecting to login...',
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/');
            }, 2000);
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
        <div className="reset-password-container">
            <div className="reset-password-box">
                <div>
                    <h2 className="">Reset your password</h2>
                    <p className="reset-text-blw">Enter your new password below</p>
                </div>
                <form className="reset-password-form" onSubmit={handleSubmit}>
                    <div className="reset-password-ctn">
                        <div className="change-pswrd">
                            <label htmlFor="password" className="">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="New password"
                            />
                        </div>
                        <div className="change-pswrd">
                            <label htmlFor="confirm-password" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`reset-password-msg ${
                                message.type === 'success' ? '.bg-light-grn' : 'bg-light-rd'
                            }`}
                        >
                            <p
                                className={`text-sm ${
                                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}
                            >
                                {message.text}
                            </p>
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={loading} className="sbmit-btn">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

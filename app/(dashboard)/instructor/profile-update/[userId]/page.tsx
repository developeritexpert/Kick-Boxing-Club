'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/dashboard.css';
// import EditProfile from '@/components/content_admin/profile/EditProfile';
import EditProfile from '@/components/instructor/profile/EditProfile';

export default function EditUserPage() {
    const router = useRouter();
    return (
        <div className="user-management-container edit-instructor-user">
            <div className="table-header">
                <h2>Edit Profile</h2>
                <button
                    className="add-user-btn"
                    onClick={() => router.push('/instructor/settings')}
                >
                <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="29"
                        viewBox="0 0 16 29"
                        fill="none"
                    >
                        <path
                            d="M14.1621 1.5L1.5 14.1621L14.1621 26.8242"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span> Back</span>
                </button>
            </div>

            <EditProfile />
        </div>
    );
}

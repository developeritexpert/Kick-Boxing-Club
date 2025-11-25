'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/dashboard.css';
// import EditProfile from '@/components/content_admin/profile/EditProfile';
import EditProfile from '@/components/instructor/profile/EditProfile';

export default function EditUserPage() {
    const router = useRouter();
    return (
        <div className="user-management-container">
            <div className="table-header">
                <h2>Edit Profile</h2>
                <button
                    className="add-user-btn"
                    onClick={() => router.push('/instructor/settings')}
                >
                    ← Back
                </button>
            </div>

            <EditProfile />
        </div>
    );
}

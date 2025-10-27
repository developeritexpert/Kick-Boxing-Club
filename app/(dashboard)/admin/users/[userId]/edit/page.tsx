'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import '../../../../../../styles/dashboard.css';

import EditUser from '@/components/admin/EditUser';

export default function EditUserPage() {
    const router = useRouter();
    return (
        <div className="user-management-container">
            <div className="table-header">
                <h2>Edit User</h2>
                <button className="add-user-btn" onClick={() => router.push('/admin/users')}>
                    ← Back
                </button>
            </div>

            <EditUser />
        </div>
    );
}

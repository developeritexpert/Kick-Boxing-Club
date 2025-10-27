'use client';

import React from 'react';
import Link from 'next/link';
import '../../../../styles/dashboard.css';

import UserTable from '@/components/admin/UserTable';

export default function UserManagementPage() {
    return (
        <div className="user-management-container">
            <div className="table-header">
                <h2>User Management</h2>
                <Link href="/admin/users/add">
                    <button className="add-user-btn">+ Add User</button>
                </Link>
            </div>

            <UserTable />
        </div>
    );
}

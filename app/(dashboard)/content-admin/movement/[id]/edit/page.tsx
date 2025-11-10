'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import EditMovement from '@/components/content_admin/movement/EditMovement';

export default function EditUserPage() {
    const router = useRouter();
    return (
        <div className="editmvment">
            <div className="table-header">
                {/* <h2>Edit Movement</h2> */}
                <button
                    className="add-user-btn"
                    onClick={() => router.push('/content-admin/movement/library')}
                >
                    ← Back
                </button>
            </div>

            <EditMovement />
        </div>
    );
}

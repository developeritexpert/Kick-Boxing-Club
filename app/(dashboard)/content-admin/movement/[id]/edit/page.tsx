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
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="29" viewBox="0 0 16 29" fill="none">
<path d="M14.1621 1.5L1.5 14.1621L14.1621 26.8242" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
                    <span> Back</span>
                </button>
            </div>

            <EditMovement />
        </div>
    );
}

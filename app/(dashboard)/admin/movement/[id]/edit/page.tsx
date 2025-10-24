"use client";

import React from "react";
import { useRouter } from 'next/navigation';

import "../../../../../../styles/dashboard.css"; 

import EditMovement from "@/components/admin/movement/EditMovement";

export default function EditUserPage() {
    const router = useRouter();
  return (
    <div className="user-management-container">
      <div className="table-header">
        <h2>Edit Movement</h2>
        <button className="add-user-btn" onClick={() => router.push('/admin/movement')}>← Back</button>
      </div>

     <EditMovement />
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function ContentAdminPage() {
    const router = useRouter();
    return (
        <div className="dashboard-page">
            <div className="page-header-spacer" />
            <section className="cards-row">
                <article className="card">
                    <div>
                               <div className="card-title">Total Workouts</div>
                    <div className="card-value">152</div>
                    <div className="card-sub">Total number of uploaded videos</div>
                    </div>
                    
             <img src="/computer_image.png" alt="computer-img"/>

                </article>

                <article className="card">
                    <div className="card-title">Total Workouts</div>
                    <div className="card-value">85</div>
                    <div className="card-sub">Total - workouts</div>
                </article>

                <article className="card">
                    <div className="card-title">Active Instructors</div>
                    <div className="card-value">15</div>
                    <div className="card-sub">Tracking all Instructors</div>
                </article>
            </section>

            <section className="instructor-panel">
                <div className="panel-header">
                    <div>
                        <strong>All instructors</strong>
                        <div className="muted">Active: 10 | Inactive: 5</div>
                    </div>
                </div>

                <div className="graph-placeholder">[Graph Placeholder]</div>

                <div className="panel-actions">
                    <button className="btn btn-black">Manage Access Levels</button>
                    <button className="btn btn-red" onClick={() => router.push('//content-admin/users/add')}>
                        Add New Role
                    </button>
                </div>
            </section>
        </div>
    );
}

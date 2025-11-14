'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    return (
        <div className="dashboard-page">
            <div className="page-header-spacer" />
            <section className="cards-row">
                <article className="card">
                    <div className="card-title">Total Movements</div>
                    <div className="card-value">500+</div>
                    <div className="card-sub">total for all-time</div>
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
                    <button className="btn btn-black" onClick={() => router.push('/admin/users')}>
                        Manage Access Levels
                    </button>
                    <button className="btn btn-red" onClick={() => router.push('/admin/users/add')}>
                        Add New Role
                    </button>
                </div>
            </section>
        </div>
    );
}

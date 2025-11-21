'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const router = useRouter();

    const [boxingCount, setBoxingCount] = useState<number | null>(null);
    const [kickBoxingCount, setkickBoxingCount] = useState<number | null>(null);
    const [UBCount, setUBCount] = useState<number | null>(null);
    const [LBCount, setLBCount] = useState<number | null>(null);
    const [FBCount, setFBCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        let isCancelled = false;

        const fetchAdminDashboardStats = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch('/api/admin/dashboard/stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || 'Failed to fetch dashboard stats');
                }

                if (!isCancelled) {
                    setBoxingCount(data.data?.boxingCount ?? 0);
                    setkickBoxingCount(data.data?.kickBoxingCount ?? 0);
                    setUBCount(data.data?.hiitUpperCount ?? 0);
                    setLBCount(data.data?.hiitLowerCount ?? 0);
                    setFBCount(data.data?.hiitFullBodyCount ?? 0);
                }

            } catch (error : any) {
                console.error('Error fetching dashboard stats:', error);
                setError(error?.message || 'Failed to load workout data');
                toast.error('Failed to load workout data')
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }
        fetchAdminDashboardStats()

        return () => {
            isCancelled = true;
        };
    }, []);


    const renderValue = (value: number | null) => {
        if (loading) return '...';
        if (error) return '--';
        return value ?? 0;
    };

    const workoutCards = [
        {
            title: 'Upper Body Workouts',
            value: renderValue(UBCount),
            sub: 'Arms, shoulders, and chest strength.',
            img: '/running.png',
        },
        {
            title: 'Lower Body Workouts',
            value: renderValue(LBCount),
            sub: 'Legs, glutes, and core stability.',
            img: '/sitting.png',
        },
        {
            title: 'Full Body Workouts',
            value: renderValue(FBCount),
            sub: 'Balanced routines for complete body conditioning.',
            img: 'bookReading.svg',
        },
        {
            title: 'Boxing Combinations',
            value: renderValue(boxingCount),
            sub: 'Technique-based drills for punches and combos.',
            img: '/boxing.svg',
        },
        {
            title: 'Kickboxing Combinations',
            value: renderValue(kickBoxingCount),
            sub: 'Dynamic movements combining kicks and strikes.',
            img: '/standingBoxing.svg',
        },
    ];

    const handleRedirect = () => {
        router.push(`/admin/movement/library`);
    }

    return (
        <div className="dashboard-page admin-dsbr">
            <div className="page-header-spacer" />
            <section className="cards-row">
                {workoutCards.map((card, index) => (
                    <article className="card" key={index} onClick={handleRedirect} style={{cursor : 'pointer'}}>
                        <div>
                            <div className="card-title">{card.title}</div>
                            <div className="card-value">{card.value}</div>
                            <div className="card-sub">{card.sub}</div>
                        </div>

                        <Image src={card.img} alt={card.title} height={42} width={45} />
                    </article>
                ))}
            </section>

            <section className="">
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

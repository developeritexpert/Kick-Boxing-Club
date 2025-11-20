'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminPage() {
    const workoutCards = [
        {
            title: 'Upper Body Workouts',
            value: '25+',
            sub: 'Arms, shoulders, and chest strength.',
            img: '/running.jpg',
        },
        {
            title: 'Lower Body Workouts',
            value: '20+',
            sub: 'Legs, glutes, and core stability.',
            img: '/sitting.jpg',
        },
        {
            title: 'Full Body Workouts',
            value: '15+',
            sub: 'Balanced routines for complete body conditioning.',
            img: 'bookReading.svg',
        },
        {
            title: 'Boxing Combinations',
            value: '10',
            sub: 'Technique-based drills for punches and combos.',
            img: '/boxing.svg',
        },
        {
            title: 'Kickboxing Combinations',
            value: '15+',
            sub: 'Dynamic movements combining kicks and strikes.',
            img: '/standingBoxing.svg',
        },
    ];

    const router = useRouter();
    return (
        <div className="dashboard-page admin-dsbr">
            <div className="page-header-spacer" />
            <section className="cards-row">
                {workoutCards.map((card, index) => (
                    <article className="card" key={index}>
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

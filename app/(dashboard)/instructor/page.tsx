// instructor dashboard page
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/instructor/InstructorPage.module.css';
import { useAuthStore } from '@/stores/useAuthStore';

interface RecentWorkout {
    workout_id: string;
    workout_name: string;
    class_name: string;
    status: string;
    last_accessed_at: string;
}

export default function InstructorPage() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const [movementCount, setMovementCount] = useState<number | null>(null);
    const [workoutCount, setWorkoutCount] = useState<number | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        let isCancelled = false;

        async function fetchDashboardStats() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/common/dashboard/stats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: user?.id }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || 'Failed to fetch dashboard stats');
                }

                if (!isCancelled) {
                    setMovementCount(data.data?.movementCount ?? 0);
                    setWorkoutCount(data.data?.workoutCount ?? 0);
                }
            } catch (err: any) {
                console.error('Error fetching dashboard stats:', err);
                if (!isCancelled) {
                    setError(err.message || 'Error fetching dashboard stats');
                    setMovementCount(null);
                    setWorkoutCount(null);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        async function fetchRecentWorkouts() {
            try {
                const res = await fetch('/api/common/dashboard/recent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: user?.id }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || 'Failed to fetch recent workouts');
                }

                if (!isCancelled) {
                    setRecentWorkouts(data.data || []);
                }
            } catch (err: any) {
                console.error('Error fetching recent workouts:', err);
                if (!isCancelled) {
                    setRecentWorkouts([]);
                }
            }
        }

        fetchDashboardStats();
        fetchRecentWorkouts();

        return () => {
            isCancelled = true;
        };
    }, [user?.id]);

    const renderValue = (value: number | null) => {
        if (loading) return '...';
        if (error) return '--';
        return value ?? 0;
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Published') {
            return '/small_tick_icon.png';
        }
        return '/small_tick_icon.png'; // Default icon
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleWorkoutsCardClick = () => {
        router.push(`/instructor/workouts`);
    };

    const handleMovementCardClick = () => {
        router.push(`/instructor/movement/library`);
    };

    const handleRecentClick = (id: string) => {
        router.push(`/instructor/workouts/${id}`);
    };

    const capitalizeFirstLetter = (str?: string | null) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div className={`${styles.dashboardPage} instructor-dsbrd`}>
            <div className={styles.pageHeaderSpacer} />

            <div className={styles.cardsRow}>
                <article
                    className={styles.card}
                    onClick={handleWorkoutsCardClick}
                    style={{ cursor: 'pointer' }}
                >
                    <div>
                        <div className={styles.cardTitle}>Total Workouts</div>
                        <div className={styles.cardValue}>{renderValue(workoutCount)}</div>
                        <div className={styles.cardSub}>Total number of uploaded videos</div>
                    </div>
                    <Image src="/computer_image.png" alt="computer-img" width={57} height={52} />
                </article>

                <article
                    className={styles.card}
                    onClick={handleWorkoutsCardClick}
                    style={{ cursor: 'pointer' }}
                >
                    <div>
                        <div className={styles.cardTitle}>Total Movements</div>
                        <div className={styles.cardValue}>{renderValue(movementCount)}</div>
                        <div className={styles.cardSub}>
                            Total number of movement categories & subcategories
                        </div>
                    </div>
                    <Image src="/grid_image.png" alt="grid_image" width={52} height={52} />
                </article>

                <article
                    className={styles.card}
                    onClick={handleWorkoutsCardClick}
                    style={{ cursor: 'pointer' }}
                >
                    <div>
                        <div className={styles.cardTitle}>Published Videos</div>
                        <div className={styles.cardValue}>{renderValue(movementCount)}</div>
                        <div className={styles.cardSub}>
                            Number of active videos visible to instructors
                        </div>
                    </div>
                    <Image src="/hand_caught.png" alt="hand_caught-img" width={48} height={52} />
                </article>
            </div>

            <div className={styles.recentActivity}>
                <div className={styles.recentActivityHdg}>
                    <h4>Recent Activity</h4>
                </div>

                <div className={styles.recentCards}>
                    {recentWorkouts.length > 0 ? (
                        recentWorkouts.map((workout) => (
                            <div key={workout.workout_id} className={styles.recentActivityCard}>
                                <div
                                    className={styles.crd}
                                    onClick={() => handleRecentClick(workout.workout_id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h4>
                                        {/* {workout.workout_name} */}
                                        {workout.workout_name.length > 30
                                            ? workout.workout_name.substring(0, 30) + '...'
                                            : workout.workout_name}
                                    </h4>
                                    <div className={styles.cardContent}>
                                        <div className={styles.row}>
                                            <div className={styles.iconRow}>
                                                <Image
                                                    src="/small_grid_icon.png"
                                                    alt="grid-icon"
                                                    width={12}
                                                    height={12}
                                                />
                                                Class:
                                            </div>
                                            <p>{workout.class_name}</p>
                                        </div>

                                        <div className={styles.row}>
                                            <div className={styles.iconRow}>
                                                <Image
                                                    src={getStatusIcon(workout.status)}
                                                    alt="status-icon"
                                                    width={12}
                                                    height={12}
                                                />
                                                Status:
                                            </div>
                                            <p>{capitalizeFirstLetter(workout.status)}</p>
                                        </div>

                                        <div className={styles.row}>
                                            <div className={styles.iconRow}>
                                                <Image
                                                    src="/date_icon.png"
                                                    alt="date-icon"
                                                    width={12}
                                                    height={12}
                                                />
                                                Date:
                                            </div>
                                            <p>{formatDate(workout.last_accessed_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.recentActivityCard}>
                            <p>No recent workouts found</p>
                        </div>
                    )}
                </div>

                {/* <div className={styles.recentCards}>
                    <div className={styles.recentActivityCard}>
                        <div className={styles.crd}>
                            <h4>Kickboxing Combo — 5 Punch Drill</h4>
                            <div className={styles.cardContent}>
                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_grid_icon.png"
                                            alt="grid-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Class:
                                    </div>
                                    <p>Upper Body Power Session</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_tick_icon.png"
                                            alt="tick-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Status:
                                    </div>
                                    <p>Published</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>Category</div>
                                    <p>Kickboxing</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/date_icon.png"
                                            alt="date-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Date:
                                    </div>
                                    <p>Oct 21, 2025</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.recentActivityCard}>
                        <div className={styles.cardInner}>
                            <h4>HIIT Full Body Blast</h4>
                            <div className={styles.cardContent}>
                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_grid_icon.png"
                                            alt="grid-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Class:
                                    </div>
                                    <p>HIIT</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_tick_icon.png"
                                            alt="tick-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Status:
                                    </div>
                                    <p>Draft</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>Category</div>
                                    <p>Pushup</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/date_icon.png"
                                            alt="date-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Date:
                                    </div>
                                    <p>Oct 17, 2025</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.recentActivityCard}>
                        <div className={styles.cardInner}>
                            <h4>Core Strength Circuit</h4>
                            <div className={styles.cardContent}>
                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_grid_icon.png"
                                            alt="grid-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Class:
                                    </div>
                                    <p>Full Body</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/small_tick_icon.png"
                                            alt="tick-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Status:
                                    </div>
                                    <p>Removed</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>Category</div>
                                    <p>Arm Circle</p>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.iconRow}>
                                        <Image
                                            src="/date_icon.png"
                                            alt="date-icon"
                                            width={12}
                                            height={12}
                                        />
                                        Date:
                                    </div>
                                    <p>Oct 15, 2025</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

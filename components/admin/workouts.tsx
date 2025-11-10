'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import './workouts.css';

interface Movement {
    id: string;
    name: string;
    thumbnail_url: string;
    category_id: string;
    categories: {
        id: string;
        name: string;
    };
}

interface WorkoutMovement {
    sequence_order: number;
    duration: number;
    rest_after: number;
    movements: Movement;
}

interface Workout {
    id: string;
    name: string;
    total_duration: number;
    status: string;
    created_by: string;
    created_at: string;
    workout_movements: WorkoutMovement[];
}

const Workouts: React.FC = () => {
    const user = useAuthStore((state) => state.user);

    const router = useRouter();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeArrow, setActiveArrow] = useState<'left' | 'right' | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [favorites, setFavorites] = useState<string[]>([]);

    const itemsPerPage = 6;

    useEffect(() => {
        fetchWorkouts();
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchFavorites(user.id);
        }
    }, [user]);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/workout');
            const result = await response.json();

            if (result.success && result.data) {
                setWorkouts(result.data);
            } else {
                setError('Failed to fetch workouts');
            }
        } catch (err) {
            setError('Error fetching workouts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async (userId: string) => {
        try {
            const res = await fetch('/api/admin/workout/favorite/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });

            const result = await res.json();
            if (result.success) {
                setFavorites(result.data || []);
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} min`;
    };

    const getDifficulty = (duration: number): string => {
        if (duration < 600) return 'Beginner';
        if (duration < 1200) return 'Intermediate';
        return 'Advanced';
    };

    const getExercises = (movements: WorkoutMovement[]): string => {
        const firstThree = movements.slice(0, 3).map((wm) => wm.movements.name);
        return `(${firstThree.join(', ')})`;
    };

    const handleNewWorkout = () => {
        router.push('/admin/workouts/create');
    };

    const filteredWorkouts = workouts.filter((workout) =>
        workout.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentWorkouts = filteredWorkouts.slice(startIndex, endIndex);

    const handleArrowClick = (side: 'left' | 'right') => {
        setActiveArrow(side);

        if (side === 'left' && currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        } else if (side === 'right' && currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePageClick = (num: number) => {
        setCurrentPage(num);
        setActiveArrow(null);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [filteredWorkouts, currentPage, totalPages]);

    const handleCardClick = (workoutId: string) => {
        router.push(`/admin/workouts/${workoutId}`);
        console.log(`card : ${workoutId}`);
    };

    const handleHeartClick = async (e: React.MouseEvent<HTMLSpanElement>, workoutId: string) => {
        e.preventDefault();
        e.stopPropagation();
        // console.log(`Heart : ${workoutId}`);

        if (!user) {
            toast.error('No user logged in');
            console.error('No user logged in');
            return;
        }

        try {
            const res = await fetch('/api/admin/workout/favorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workout_id: workoutId, user_id: user.id }),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(result.message);
                // console.log(result.message);

                setFavorites((prev) =>
                    prev.includes(workoutId)
                        ? prev.filter((id) => id !== workoutId)
                        : [...prev, workoutId],
                );
            } else {
                toast.error(result.error);
                console.error(result.error);
            }
        } catch (err) {
            toast.error(`Failed to favorite workout: ${err}`);
            console.error('Failed to favorite workout:', err);
        }
    };

    return (
        <div className="workouts-container">
            <div className="workouts-controls">
                <div className="search-box">
                    <span className="search-icon">
                        <img src="/search_icon.png" alt="search icon" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search workouts..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <button className="add-workout-btn" onClick={handleNewWorkout} disabled={loading}>
                    Create New Workout
                </button>
            </div>

            {loading ? (
                <div className="loading-content">Loading workouts...</div>
            ) : error ? (
                <div className="error-content">{error}</div>
            ) : filteredWorkouts.length === 0 ? (
                <div className="loading-content">No workouts found</div>
            ) : (
                <>
                    <div className="workouts-grid">
                        {currentWorkouts.map((workout) => (
                            <div
                                key={workout.id}
                                className="workout-card"
                                onClick={() => handleCardClick(workout.id)}
                            >
                                <div className="workout-header">
                                    <h3 className="workout-title">{workout.name}</h3>
                                    <span
                                        className="workout-hrt-icn"
                                        onClick={(e) => handleHeartClick(e, workout.id)}
                                    >
                                        {/* <img src="/heart-icon.png" alt="heart icon" /> */}
                                        <img
                                            src={
                                                favorites.includes(workout.id)
                                                    ? '/heart-filled.png'
                                                    : '/heart-icon.png'
                                            }
                                            alt="heart icon"
                                        />
                                    </span>
                                </div>
                                <div className="workout-duration">
                                    {formatDuration(workout.total_duration)}
                                </div>
                                <div className="workout-difficulty">
                                    {getDifficulty(workout.total_duration)}
                                </div>
                                <div className="workout-exercises">
                                    {workout.workout_movements?.length > 0
                                        ? getExercises(workout.workout_movements)
                                        : '(No movements)'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="workouts-pgnatin">
                            <div
                                className={`arrow left-arrow ${activeArrow === 'left' ? 'active' : ''}`}
                                onClick={() => handleArrowClick('left')}
                                style={{
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                }}
                            >
                                <svg
                                    width="4"
                                    height="7"
                                    viewBox="0 0 4 7"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M3.44914 6.44963C3.41912 6.48162 3.37833 6.49973 3.3357 6.49999C3.31455 6.5002 3.29357 6.49584 3.27407 6.48718C3.25456 6.47852 3.23694 6.46574 3.22227 6.44963L0.547425 3.62192C0.532403 3.60624 0.520475 3.58757 0.512334 3.56699C0.504193 3.5464 0.5 3.52431 0.5 3.502C0.5 3.47968 0.504193 3.45759 0.512334 3.43701C0.520475 3.41642 0.532403 3.39775 0.547425 3.38208L3.22227 0.553767C3.23697 0.537145 3.25469 0.523822 3.27437 0.514589C3.29405 0.505356 3.31528 0.500403 3.33681 0.500024C3.35834 0.499644 3.37972 0.503847 3.39967 0.512381C3.41963 0.520915 3.43776 0.533607 3.45299 0.5497C3.46821 0.565794 3.48022 0.58496 3.48829 0.606059C3.49636 0.627158 3.50034 0.649759 3.49998 0.672515C3.49962 0.695272 3.49493 0.71772 3.4862 0.738522C3.47747 0.759325 3.46486 0.778058 3.44914 0.793606L0.887736 3.502L3.44914 6.20979C3.46409 6.2255 3.47596 6.24419 3.48406 6.26477C3.49216 6.28535 3.49633 6.30742 3.49633 6.32971C3.49633 6.352 3.49216 6.37407 3.48406 6.39465C3.47596 6.41523 3.46409 6.43391 3.44914 6.44963Z"
                                        fill={`${activeArrow === 'left' ? 'white' : '#b40200'}`}
                                        stroke={`${activeArrow === 'left' ? 'white' : '#b40200'}`}
                                    />
                                </svg>
                            </div>

                            {[...Array(totalPages)].map((_, index) => {
                                const num = index + 1;
                                return (
                                    <div
                                        key={num}
                                        className={`page-number ${currentPage === num ? 'active' : ''}`}
                                        onClick={() => handlePageClick(num)}
                                    >
                                        {num}
                                    </div>
                                );
                            })}

                            <div
                                className={`arrow right-arrow ${activeArrow === 'right' ? 'active' : ''}`}
                                onClick={() => handleArrowClick('right')}
                                style={{
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                }}
                            >
                                <svg
                                    width="4"
                                    height="7"
                                    viewBox="0 0 4 7"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M0.55086 6.44963C0.580879 6.48162 0.62167 6.49973 0.664297 6.49999C0.685452 6.5002 0.706425 6.49584 0.725931 6.48718C0.745437 6.47852 0.763064 6.46574 0.777734 6.44963L3.45257 3.62192C3.4676 3.60624 3.47952 3.58757 3.48767 3.56699C3.49581 3.5464 3.5 3.52431 3.5 3.502C3.5 3.47968 3.49581 3.45759 3.48767 3.43701C3.47952 3.41642 3.4676 3.39775 3.45257 3.38208L0.777734 0.553767C0.763026 0.537145 0.745306 0.523822 0.725628 0.514589C0.705949 0.505356 0.684715 0.500403 0.663189 0.500024C0.641663 0.499644 0.620284 0.503847 0.600326 0.512381C0.580367 0.520915 0.562237 0.533607 0.547013 0.5497C0.53179 0.565794 0.519784 0.58496 0.511711 0.606059C0.503639 0.627158 0.499663 0.649759 0.500022 0.672515C0.500381 0.695272 0.505067 0.71772 0.513801 0.738522C0.522534 0.759325 0.535137 0.778058 0.55086 0.793606L3.11226 3.502L0.55086 6.20979C0.535906 6.2255 0.524039 6.24419 0.515941 6.26477C0.507843 6.28535 0.503674 6.30742 0.503674 6.32971C0.503674 6.352 0.507843 6.37407 0.515941 6.39465C0.524039 6.41523 0.535906 6.43391 0.55086 6.44963Z"
                                        fill={`${activeArrow === 'right' ? 'white' : '#b40200'}`}
                                        stroke={`${activeArrow === 'right' ? 'white' : '#b40200'}`}
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Workouts;

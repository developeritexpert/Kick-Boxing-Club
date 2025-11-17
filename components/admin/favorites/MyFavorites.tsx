'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import './MyFavorites.css';

interface FavoriteWorkout {
    workout_id: string;
    workout_name: string;
    class_name: string | null;
    created_by: string | null;
}

const MyFavorites: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const [favorites, setFavorites] = useState<FavoriteWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) fetchFavorites();
    }, [user]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/favorites/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.id }),
            });

            const result = await res.json();
            if (result.success) {
                setFavorites(result.data);
            } else {
                setError(result.error || 'Failed to load favorites');
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError('Something went wrong while fetching favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = (workoutId: string) => {
        router.push(`/admin/workouts/${workoutId}`);
    };

    const handleDelete = async (workout_id: string) => {
        try {
            const res = await fetch('/api/admin/favorites/list', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.id, workout_id }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Removed from favorites');
                setFavorites((prev) => prev.filter((f) => f.workout_id !== workout_id));
            } else {
                toast.error(result.error || 'Failed to remove workout');
            }
        } catch (err) {
            console.error('Error removing workout:', err);
            toast.error('Something went wrong');
        }
    };

    const filteredFavorites = favorites.filter((w) =>
        w.workout_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (loading) return <div className="loading-content">Loading favorites...</div>;
    if (error) return <div className="error-content">{error}</div>;

    return (
        <div>
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
                />
            </div>

            {filteredFavorites.length === 0 ? (
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="text-gray-500 text-2xl font-semibold  px-8 py-6 rounded-2xl ">
                        No workouts found matching &quot;
                        {searchTerm.length > 30 ? searchTerm.substring(0, 30) + '...' : searchTerm}
                        &quot;
                    </div>
                </div>
            ) : (
                <table className="favourites-tbl">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Workout Name</th>
                            <th>Class</th>
                            <th>Created By</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFavorites.map((workout , index) => (
                            <tr key={workout.workout_id}>
                                <td>{ index + 1 }</td>
                                <td>
                                    {/* {workout.workout_name} */}
                                    {workout.workout_name.length > 40
                                        ? workout.workout_name.substring(0, 40) + '...'
                                        : workout.workout_name}
                                </td>
                                <td>{workout.class_name || '—'}</td>
                                <td>{workout.created_by || '—'}</td>
                                <td>
                                    <div className="fav-btn">
                                        <button
                                            className="view"
                                            onClick={() => handleViewClick(workout.workout_id)}
                                        >
                                            <img src="/view_icon.png" alt="view-icon" />
                                            <div> View</div>
                                        </button>
                                        <button
                                            className="delete"
                                            onClick={() => handleDelete(workout.workout_id)}
                                        >
                                            <img src="/delete_icon.png" alt="delete-icon" />
                                            <div> Delete</div>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyFavorites;

// import React from 'react';
// import './MyFavorites.css';
// interface Workout {
//     id: number;
//     name: string;
//     category: string;
//     instructor: string;
// }

// const MyFavorites: React.FC = () => {
//     const favoriteWorkouts: Workout[] = [
//         { id: 1, name: 'Power HIIT Circuit', category: 'HIIT', instructor: 'John Deo' },
//         { id: 2, name: 'Jab-Cross Burnout', category: 'Boxing', instructor: 'Sarah K.' },
//         { id: 3, name: 'Cardio Sculpt', category: 'Cardio', instructor: 'Aman Singh' },
//         { id: 4, name: 'Core Crusher', category: 'Abs', instructor: 'Priya Mehta' },
//         { id: 5, name: 'Full Body Burn', category: 'Strength', instructor: 'James Parker' },
//         { id: 6, name: 'Morning Yoga Flow', category: 'Yoga', instructor: 'Ananya Sharma' },
//         { id: 7, name: 'Lower Body Blast', category: 'Legs', instructor: 'Vikram Patel' },
//         { id: 8, name: 'Dance Fit Groove', category: 'Zumba', instructor: 'Kavya R.' },
//         { id: 9, name: 'Spin & Sweat', category: 'Cycling', instructor: 'David Clark' },
//         { id: 10, name: 'Upper Body Power', category: 'Strength', instructor: 'Sonia D.' },
//         { id: 11, name: 'Mindful Stretch', category: 'Yoga', instructor: 'Neha Kapoor' },
//         { id: 12, name: 'Fat Burn Express', category: 'Cardio', instructor: 'Ryan Lee' },
//         { id: 13, name: 'Combat Conditioning', category: 'Boxing', instructor: 'Rohit Raj' },
//         { id: 14, name: 'Tabata Torch', category: 'HIIT', instructor: 'Emma Wilson' },
//         { id: 15, name: 'Pilates Core Flow', category: 'Pilates', instructor: 'Maya Iyer' },
//     ];

//     return (
//         <div>
//             <div className="search-box">
//                 <span className="search-icon">
//                     <img src="/search_icon.png" alt="search icon" />
//                 </span>
//                 <input type="text" placeholder="Search workouts..." className="search-input" />
//             </div>
//             <table className="favourites-tbl">
//                 <thead>
//                     <tr>
//                         <th>Workout Name</th>
//                         <th>Category</th>

//                         <th>Instructor</th>
//                         <th>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {favoriteWorkouts.map((workout) => (
//                         <tr key={workout.id}>
//                             <td>{workout.name}</td>
//                             <td>{workout.category}</td>
//                             <td>{workout.instructor}</td>
//                             <td>
//                                 <div className="fav-btn">
//                                     <button className="view">
//                                         <img src="/view_icon.png" alt="view-icon" />
//                                         <div> View</div>
//                                     </button>
//                                     <button className="delete">
//                                         <img src="/delete_icon.png" alt="delete-icon" />
//                                         <div> Delete</div>
//                                     </button>
//                                 </div>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default MyFavorites;

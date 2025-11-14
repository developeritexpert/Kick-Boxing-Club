'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import './RecentWorkouts.css';

interface RecentWorkout {
    workout_id: string;
    workout_name: string;
    class_name: string | null;
    created_by: string | null;
    last_accessed_at: string;
}

const RecentWorkouts: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRecents = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            console.log('Fetching recent workouts for user:', user.id);
            setLoading(true);

            try {
                const res = await fetch('/api/admin/recent-workouts/list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id }),
                });

                const result = await res.json();
                console.log('Recent workouts result:', result);

                if (result.success) {
                    setRecentWorkouts(result.data);
                } else {
                    toast.error(result.error || 'Failed to fetch recent workouts');
                }
            } catch (err) {
                console.error('Error fetching recents:', err);
                toast.error('Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchRecents();
    }, [user?.id]);

    const handleDelete = async (workoutId: string) => {
        try {
            const res = await fetch('/api/admin/recent-workouts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.id, workout_id: workoutId }),
            });

            const result = await res.json();
            if (result.success) {
                toast.success('Removed from recent workouts');
                setRecentWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId));
            } else {
                toast.error(result.error || 'Failed to remove workout');
            }
        } catch (err) {
            console.error('Error deleting workout:', err);
            toast.error('Something went wrong');
        }
    };

    const handleViewClick = (workoutId: string) => {
        router.push(`/admin/workouts/${workoutId}`);
    };

    const filteredWorkouts = recentWorkouts.filter((w) =>
        w.workout_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-gray-600 text-xl font-semibold">
                    Loading recent workouts...
                </div>
            </div>
        );
    }

    // Show empty state (no workouts at all)
    if (!recentWorkouts.length) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-gray-500 text-2xl font-semibold px-8 py-6 rounded-2xl bg-gray-50 shadow-sm">
                    No recent workouts yet
                </div>
            </div>
        );
    }

    // Show search results empty state
    if (!filteredWorkouts.length) {
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
                <div className="flex items-center justify-center h-[40vh]">
                    <div className="text-gray-500 text-xl font-semibold">
                        No workouts found matching &quot;
                        {searchTerm.length > 30 ? searchTerm.substring(0, 30) + '...' : searchTerm}
                        &quot;
                    </div>
                </div>
            </div>
        );
    }

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

            <table className="favourites-tbl">
                <thead>
                    <tr>
                        <th>Workout Name</th>
                        <th>Class</th>
                        <th>Last Accessed</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWorkouts.map((workout) => (
                        <tr key={workout.workout_id}>
                            <td>
                                {/* {workout.workout_name} */}
                                {workout.workout_name.length > 40
                                    ? workout.workout_name.substring(0, 40) + '...'
                                    : workout.workout_name}
                            </td>
                            <td>{workout.class_name || '-'}</td>
                            <td>
                                {new Date(workout.last_accessed_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </td>
                            <td>
                                <div className="fav-btn">
                                    <button
                                        className="view"
                                        onClick={() => handleViewClick(workout.workout_id)}
                                    >
                                        <img src="/view_icon.png" alt="view-icon" />
                                        <div>View</div>
                                    </button>
                                    <button
                                        className="delete"
                                        onClick={() => handleDelete(workout.workout_id)}
                                    >
                                        <img src="/delete_icon.png" alt="delete-icon" />
                                        <div>Delete</div>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentWorkouts;

// 'use client'

// import React, { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuthStore } from '@/stores/useAuthStore'
// import toast from 'react-hot-toast'
// import './RecentWorkouts.css'

// interface RecentWorkout {
//     workout_id: string
//     workout_name: string
//     class_name: string | null
//     created_by: string | null
//     last_accessed_at: string
// }

// const RecentWorkouts: React.FC = () => {
//     const user = useAuthStore((state) => state.user)
//     const router = useRouter()
//     const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([])
//     const [loading, setLoading] = useState(false)
//     const [searchTerm, setSearchTerm] = useState('')
//     const [hasFetched, setHasFetched] = useState(false)

//     useEffect(() => {
//         const fetchRecents = async () => {
//             if (!user?.id) return

//             console.log('Fetching recent workouts for user:', user.id)
//             setLoading(true)

//             try {
//                 const res = await fetch('/api/admin/recent-workouts/list', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ user_id: user.id }),
//                 })

//                 const result = await res.json()
//                 console.log('Recent workouts result:', result)

//                 if (result.success) {
//                     setRecentWorkouts(result.data)
//                 } else {
//                     toast.error(result.error || 'Failed to fetch recent workouts')
//                 }
//             } catch (err) {
//                 console.error('Error fetching recents:', err)
//                 toast.error('Something went wrong')
//             } finally {
//                 setHasFetched(true)
//                 setLoading(false)
//             }
//         }

//         fetchRecents()
//     }, [user?.id])

//     const handleDelete = async (workoutId: string) => {
//         try {
//             const res = await fetch('/api/admin/recent-workouts', {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ user_id: user?.id, workout_id: workoutId }),
//             })

//             const result = await res.json()
//             if (result.success) {
//                 toast.success('Removed from recent workouts')
//                 setRecentWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId))
//             } else {
//                 toast.error(result.error || 'Failed to remove workout')
//             }
//         } catch (err) {
//             console.error('Error deleting workout:', err)
//             toast.error('Something went wrong')
//         }
//     }

//     const handleViewClick = (workoutId: string) => {
//         router.push(`/admin/workouts/${workoutId}`)
//     }

//     const filteredWorkouts = recentWorkouts.filter((w) =>
//         w.workout_name.toLowerCase().includes(searchTerm.toLowerCase())
//     )

//     // if (!user?.id && !hasFetched) {
//     //     return (
//     //         <div className="flex items-center justify-center h-[50vh]">
//     //             <div className="text-gray-500 text-xl font-semibold">Loading recent workouts...</div>
//     //         </div>
//     //     )
//     // }

//     if ( (!user?.id && !hasFetched) || loading) {
//         return (
//             <div className="flex items-center justify-center h-[50vh]">
//                 <div className="text-gray-600 text-xl font-semibold">Loading recent workouts...</div>
//             </div>
//         )
//     }

//     if (hasFetched && !filteredWorkouts.length) {
//         return (
//             <div className="flex items-center justify-center h-[50vh]">
//                 <div className="text-gray-500 text-2xl font-semibold px-8 py-6 rounded-2xl bg-gray-50 shadow-sm">
//                     No recent workouts yet
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div>
//             <div className="search-box">
//                 <span className="search-icon">
//                     <img src="/search_icon.png" alt="search icon" />
//                 </span>
//                 <input
//                     type="text"
//                     placeholder="Search workouts..."
//                     className="search-input"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//             </div>

//             <table className="favourites-tbl">
//                 <thead>
//                     <tr>
//                         <th>Workout Name</th>
//                         <th>Class</th>
//                         <th>Last Accessed</th>
//                         <th>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredWorkouts.map((workout) => (
//                         <tr key={workout.workout_id}>
//                             <td>{workout.workout_name}</td>
//                             <td>{workout.class_name || '-'}</td>
//                             <td>
//                                 {new Date(workout.last_accessed_at).toLocaleDateString('en-IN', {
//                                     day: 'numeric',
//                                     month: 'short',
//                                     year: 'numeric',
//                                 })}
//                             </td>
//                             <td>
//                                 <div className="fav-btn">
//                                     <button className="view" onClick={() => handleViewClick(workout.workout_id)}>
//                                         <img src="/view_icon.png" alt="view-icon" />
//                                         <div>View</div>
//                                     </button>
//                                     <button className="delete" onClick={() => handleDelete(workout.workout_id)}>
//                                         <img src="/delete_icon.png" alt="delete-icon" />
//                                         <div>Delete</div>
//                                     </button>
//                                 </div>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     )
// }

// export default RecentWorkouts

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import Image from 'next/image';
import './RecentWorkouts.css';

interface RecentWorkout {
    workout_id: string;
    workout_name: string;
    class_name: string | null;
    created_by: string | null;
    last_accessed_at: string;
}

const RecentWorkouts: React.FC = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchRecents = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            console.log('Fetching recent workouts for user:', user.id);
            setLoading(true);

            try {
                const res = await fetch('/api/content-admin/recent-workouts/list', {
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
            const res = await fetch('/api/content-admin/recent-workouts', {
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
        router.push(`/content-admin/workouts/${workoutId}`);
    };

    const filteredWorkouts = recentWorkouts.filter((w) =>
        w.workout_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
    const indexOfLastWorkout = currentPage * itemsPerPage;
    const indexOfFirstWorkout = indexOfLastWorkout - itemsPerPage;
    const currentWorkouts = filteredWorkouts.slice(indexOfFirstWorkout, indexOfLastWorkout);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

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

    return (
        <div className="recentWrkout content-admin-recnt-workout">
            <div className="search-box">
                <span className="search-icon">
                    <Image src="/search_icon.png" alt="search icon" width={15} height={15} />
                </span>
                <input
                    type="text"
                    placeholder="Search workouts..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Show search results empty state */}
            {!filteredWorkouts.length ? (
                <div className="flex items-center justify-center h-[40vh]">
                    <div className="text-gray-500 text-xl font-semibold">
                        No workouts found matching &quot;{searchTerm}&quot;
                    </div>
                </div>
            ) : (
                <>
                    <table className="favourites-tbl">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Workout Name</th>
                                <th>Class</th>
                                <th>Last Accessed</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentWorkouts.map((workout, index) => (
                                <tr key={workout.workout_id}>
                                    <td>{indexOfFirstWorkout + index + 1}</td>
                                    <td>{workout.workout_name}</td>
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
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M7.59961 14.6001C11.4657 14.6001 14.5996 11.4662 14.5996 7.6001C14.5996 3.734 11.4657 0.600098 7.59961 0.600098C3.73351 0.600098 0.599609 3.734 0.599609 7.6001C0.599609 11.4662 3.73351 14.6001 7.59961 14.6001Z"
                                                        stroke="white"
                                                        strokeWidth="1.2"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M6.19922 7.60009V5.17529L8.29922 6.38769L10.3992 7.60009L8.29922 8.81249L6.19922 10.0249V7.60009Z"
                                                        stroke="white"
                                                        strokeWidth="1.2"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <div> View</div>
                                            </button>
                                            <button
                                                className="delete"
                                                onClick={() => handleDelete(workout.workout_id)}
                                            >
                                                <svg
                                                    width="12"
                                                    height="15"
                                                    viewBox="0 0 12 15"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M7.12012 0.050293L7.13477 0.0649414L7.85742 0.786621H11.2021V3.09717H10.4658V11.8892C10.4658 12.4885 10.2274 13.0639 9.80371 13.4878C9.37983 13.9117 8.80453 14.1498 8.20508 14.1499H3.04688C2.44738 14.1499 1.87215 13.9117 1.44824 13.4878C1.02447 13.0639 0.786133 12.4886 0.786133 11.8892V3.09717H0.0498047V0.786621H3.39453L4.11719 0.0649414L4.13184 0.050293H7.12012ZM1.62305 11.8892C1.62305 12.2666 1.77321 12.629 2.04004 12.896C2.30701 13.163 2.66933 13.313 3.04688 13.313H8.20508C8.58259 13.3129 8.94497 13.1629 9.21191 12.896C9.47871 12.629 9.62891 12.2666 9.62891 11.8892V3.09717H1.62305V11.8892ZM3.83398 4.47119V11.9399H2.99707V4.47119H3.83398ZM8.25488 4.47119V11.9399H7.41797V4.47119H8.25488ZM3.80469 1.62354H0.886719V2.26025H10.3652V1.62354H7.44727L6.71094 0.887207H4.54102L3.80469 1.62354Z"
                                                        fill="black"
                                                        stroke="black"
                                                        strokeWidth="0.1"
                                                    />
                                                </svg>
                                                <div> Delete</div>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>

                            <div className="pagination-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`pagination-number ${
                                            currentPage === pageNumber ? 'active' : ''
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Pagination Info */}
                    {totalPages > 1 && (
                        <div className="pagination-info">
                            Showing {indexOfFirstWorkout + 1} to {Math.min(indexOfLastWorkout, filteredWorkouts.length)} of {filteredWorkouts.length} workouts
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RecentWorkouts;





































// without pagination 
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/stores/useAuthStore';
// import toast from 'react-hot-toast';
// import Image from 'next/image';
// import './RecentWorkouts.css';

// interface RecentWorkout {
//     workout_id: string;
//     workout_name: string;
//     class_name: string | null;
//     created_by: string | null;
//     last_accessed_at: string;
// }

// interface Workout {
//     id: number;
//     name: string;
//     category: string;
//     date: string;
// }

// const RecentWorkouts: React.FC = () => {
//     const router = useRouter();
//     const user = useAuthStore((state) => state.user);
//     const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');

//     useEffect(() => {
//         const fetchRecents = async () => {
//             if (!user?.id) {
//                 setLoading(false);
//                 return;
//             }

//             console.log('Fetching recent workouts for user:', user.id);
//             setLoading(true);

//             try {
//                 const res = await fetch('/api/content-admin/recent-workouts/list', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ user_id: user.id }),
//                 });

//                 const result = await res.json();
//                 console.log('Recent workouts result:', result);

//                 if (result.success) {
//                     setRecentWorkouts(result.data);
//                 } else {
//                     toast.error(result.error || 'Failed to fetch recent workouts');
//                 }
//             } catch (err) {
//                 console.error('Error fetching recents:', err);
//                 toast.error('Something went wrong');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchRecents();
//     }, [user?.id]);

//     const handleDelete = async (workoutId: string) => {
//         try {
//             const res = await fetch('/api/content-admin/recent-workouts', {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ user_id: user?.id, workout_id: workoutId }),
//             });

//             const result = await res.json();
//             if (result.success) {
//                 toast.success('Removed from recent workouts');
//                 setRecentWorkouts((prev) => prev.filter((w) => w.workout_id !== workoutId));
//             } else {
//                 toast.error(result.error || 'Failed to remove workout');
//             }
//         } catch (err) {
//             console.error('Error deleting workout:', err);
//             toast.error('Something went wrong');
//         }
//     };

//     const handleViewClick = (workoutId: string) => {
//         router.push(`/content-admin/workouts/${workoutId}`);
//     };

//     const filteredWorkouts = recentWorkouts.filter((w) =>
//         w.workout_name.toLowerCase().includes(searchTerm.toLowerCase()),
//     );

//     // Show loading state
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-[50vh]">
//                 <div className="text-gray-600 text-xl font-semibold">
//                     Loading recent workouts...
//                 </div>
//             </div>
//         );
//     }

//     // Show empty state (no workouts at all)
//     if (!recentWorkouts.length) {
//         return (
//             <div className="flex items-center justify-center h-[50vh]">
//                 <div className="text-gray-500 text-2xl font-semibold px-8 py-6 rounded-2xl bg-gray-50 shadow-sm">
//                     No recent workouts yet
//                 </div>
//             </div>
//         );
//     }

//     // Show search results empty state
//     if (!filteredWorkouts.length) {
//         return (
//             <div className="content-admin-recnt-workout">
//                 <div className="search-box">
//                     <span className="search-icon">
//                         <img src="/search_icon.png" alt="search icon" />
//                     </span>
//                     <input
//                         type="text"
//                         placeholder="Search workouts..."
//                         className="search-input"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>
//                 <div className="flex items-center justify-center h-[40vh]">
//                     <div className="text-gray-500 text-xl font-semibold">
//                         No workouts found matching &quot;{searchTerm}&quot;
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="recentWrkout content-admin-recnt-workout">
//             <div className="search-box">
//                 <span className="search-icon">
//                     <Image src="/search_icon.png" alt="search icon" width={15} height={15} />
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
//                         <th>S.No</th>
//                         <th>Workout Name</th>
//                         <th>Class</th>
//                         <th>Last Accessed</th>
//                         <th>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredWorkouts.map((workout , index) => (
//                         <tr key={workout.workout_id}>
//                             <td>{index + 1}</td>
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
//                                     <button
//                                         className="view"
//                                         onClick={() => handleViewClick(workout.workout_id)}
//                                     >
//                                         <svg
//                                             width="16"
//                                             height="16"
//                                             viewBox="0 0 16 16"
//                                             fill="none"
//                                             xmlns="http://www.w3.org/2000/svg"
//                                         >
//                                             <path
//                                                 d="M7.59961 14.6001C11.4657 14.6001 14.5996 11.4662 14.5996 7.6001C14.5996 3.734 11.4657 0.600098 7.59961 0.600098C3.73351 0.600098 0.599609 3.734 0.599609 7.6001C0.599609 11.4662 3.73351 14.6001 7.59961 14.6001Z"
//                                                 stroke="white"
//                                                 strokeWidth="1.2"
//                                                 strokeLinejoin="round"
//                                             />
//                                             <path
//                                                 d="M6.19922 7.60009V5.17529L8.29922 6.38769L10.3992 7.60009L8.29922 8.81249L6.19922 10.0249V7.60009Z"
//                                                 stroke="white"
//                                                 strokeWidth="1.2"
//                                                 strokeLinejoin="round"
//                                             />
//                                         </svg>

//                                         <div> View</div>
//                                     </button>
//                                     <button
//                                         className="delete"
//                                         onClick={() => handleDelete(workout.workout_id)}
//                                     >
//                                         <svg
//                                             width="12"
//                                             height="15"
//                                             viewBox="0 0 12 15"
//                                             fill="none"
//                                             xmlns="http://www.w3.org/2000/svg"
//                                         >
//                                             <path
//                                                 d="M7.12012 0.050293L7.13477 0.0649414L7.85742 0.786621H11.2021V3.09717H10.4658V11.8892C10.4658 12.4885 10.2274 13.0639 9.80371 13.4878C9.37983 13.9117 8.80453 14.1498 8.20508 14.1499H3.04688C2.44738 14.1499 1.87215 13.9117 1.44824 13.4878C1.02447 13.0639 0.786133 12.4886 0.786133 11.8892V3.09717H0.0498047V0.786621H3.39453L4.11719 0.0649414L4.13184 0.050293H7.12012ZM1.62305 11.8892C1.62305 12.2666 1.77321 12.629 2.04004 12.896C2.30701 13.163 2.66933 13.313 3.04688 13.313H8.20508C8.58259 13.3129 8.94497 13.1629 9.21191 12.896C9.47871 12.629 9.62891 12.2666 9.62891 11.8892V3.09717H1.62305V11.8892ZM3.83398 4.47119V11.9399H2.99707V4.47119H3.83398ZM8.25488 4.47119V11.9399H7.41797V4.47119H8.25488ZM3.80469 1.62354H0.886719V2.26025H10.3652V1.62354H7.44727L6.71094 0.887207H4.54102L3.80469 1.62354Z"
//                                                 fill="black"
//                                                 stroke="black"
//                                                 strokeWidth="0.1"
//                                             />
//                                         </svg>
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

// export default RecentWorkouts;

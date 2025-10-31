'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Stream } from '@cloudflare/stream-react';
import './single-workout.css';

interface MovementItem {
    id: string;
    sequence_order: number;
    duration: number;
    rest_after: number;
    movements: {
        id: string;
        name: string;
        video_id: string | null;
        video_url: string;
        thumbnail_url: string;
    };
}

interface WorkoutData {
    id: string;
    name: string;
    workout_movements: MovementItem[];
}

const SingleWorkout: React.FC = () => {
    const [workout, setWorkout] = useState<WorkoutData | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { workoutId } = useParams();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const currentIndexRef = useRef(currentIndex);
    const workoutRef = useRef(workout);


    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        workoutRef.current = workout;
    }, [workout]);

    useEffect(() => {
        if (!workoutId) return;

        const fetchWorkout = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/admin/workout/${workoutId}`);

                if (!res.ok) {
                    throw new Error('Failed to load workout');
                }

                const data: WorkoutData = await res.json();
                setWorkout(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching workout:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkout();
    }, [workoutId]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startRestPeriod = (restSeconds: number) => {
        if (restSeconds <= 0) {
            goToNextVideo();
            return;
        }

        setIsResting(true);
        setRestTimer(restSeconds);

        timerRef.current = setInterval(() => {
            setRestTimer((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    setIsResting(false);

                    const currentWorkout = workoutRef.current;
                    const currentIdx = currentIndexRef.current;

                    if (currentWorkout && currentIdx < currentWorkout.workout_movements.length - 1) {
                        setCurrentIndex(currentIdx + 1);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleVideoEnd = () => {
        const current = workout?.workout_movements[currentIndex];
        if (!current) return;

        if (!workout || currentIndex >= workout.workout_movements.length - 1) {
            return;
        }

        startRestPeriod(current.rest_after);
    };

    const goToNextVideo = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsResting(false);
        setRestTimer(0);

        if (workout && currentIndex < workout.workout_movements.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goToPreviousVideo = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsResting(false);
        setRestTimer(0);

        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const skipRest = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsResting(false);
        setRestTimer(0);
        goToNextVideo();
    };

    if (loading) {
        return (
            <div className="single-workout-container">
                <div className="workout-card">
                    <p>Loading workout...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="single-workout-container">
                <div className="workout-card">
                    <p style={{ color: 'red' }}>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!workout || !workout.workout_movements || workout.workout_movements.length === 0) {
        return (
            <div className="single-workout-container">
                <div className="workout-card">
                    <p>No workout movements found.</p>
                </div>
            </div>
        );
    }

    const currentMovement = workout.workout_movements[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === workout.workout_movements.length - 1;
    const totalMovements = workout.workout_movements.length;

    return (
        <div className="single-workout-container">
            <div className="workout-card">
                <div style={{ width: '100%', marginBottom: '20px' }}>
                    <h1 className="workout-title">{workout.name}</h1>
                    <div className="workout-meta">
                        <div className="meta-item">
                            <span className="meta-label">Movement:</span>
                            <span className="meta-value">{currentIndex + 1} of {totalMovements}</span>
                        </div>
                    </div>
                </div>

                {isResting ? (
                    <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        background: 'linear-gradient(135deg, #ff0202ff 0%, #ff0202ff 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        color: 'white'
                    }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px' }}>Rest Time</h2>
                        <div style={{ fontSize: '72px', fontWeight: '700', marginBottom: '20px' }}>{restTimer}s</div>
                        {currentIndex < totalMovements - 1 && (
                            <p style={{ fontSize: '20px', marginBottom: '20px' }}>
                                Next: {workout.workout_movements[currentIndex + 1]?.movements.name}
                            </p>
                        )}
                        <button
                            onClick={skipRest}
                            style={{
                                background: 'white',
                                color: '#ff0202ff',
                                padding: '12px 24px',
                                borderRadius: '24px',
                                border: 'none',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Skip Rest
                        </button>
                    </div>
                ) : (
                    <>
                        {currentMovement?.movements.video_id ? (
                            // default cloudFlare plalyer
                            // <iframe
                            //     key={currentMovement.movements.video_id}
                            //     src={`https://iframe.videodelivery.net/${currentMovement.movements.video_id}?autoplay=true&muted=false`}
                            //     allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                            //     allowFullScreen
                            //     className="workout-image"
                            //     style={{ aspectRatio: '16/9', border: 'none' }}
                            // />
                            <Stream
                                controls
                                autoplay
                                src={currentMovement.movements.video_id}
                                onEnded={handleVideoEnd}
                                onError={(e) => console.error('Video error', e)}
                                className="w-full h-full rounded-xl"
                            />

                        ) : (
                            <div style={{
                                width: '100%',
                                aspectRatio: '16/9',
                                background: '#f0f0f0',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <p>No video available</p>
                            </div>
                        )}

                        <div style={{ width: '100%', marginTop: '16px' }}>
                            <div className="casting-cnt">
                                <h2 className="workout-title">{currentMovement?.movements.name}</h2>
                                <img src="/casting_icon.png" alt="casting img" />
                            </div>
                            <div className="workout-meta">
                                {currentMovement?.duration > 0 && (
                                    <div className="meta-item">
                                        <span className="meta-label">Duration:</span>
                                        <span className="meta-value">{currentMovement.duration}s</span>
                                    </div>
                                )}
                                {currentMovement?.rest_after > 0 && (
                                    <div className="meta-item">
                                        <span className="meta-label">Rest After:</span>
                                        <span className="meta-value">{currentMovement.rest_after}s</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                    gap: '16px'
                }}>
                    <button
                        onClick={goToPreviousVideo}
                        disabled={isFirst}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '24px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: isFirst ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            background: isFirst ? '#e0e0e0' : '#ff0202ff',
                            color: isFirst ? '#999' : 'white',
                            opacity: isFirst ? 0.6 : 1
                        }}
                    >
                        ← Previous
                    </button>

                    <div style={{ flex: 1, maxWidth: '300px' }}>
                        <div style={{
                            background: '#e0e0e0',
                            height: '8px',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                background: '#ff0202ff',
                                height: '100%',
                                width: `${((currentIndex + 1) / totalMovements) * 100}%`,
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    <button
                        onClick={isLast ? undefined : goToNextVideo}
                        disabled={isLast}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '24px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: isLast ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            background: isLast ? '#e0e0e0' : '#ff0202ff',
                            color: isLast ? '#999' : 'white',
                            opacity: isLast ? 0.6 : 1
                        }}
                    >
                        Next →
                    </button>
                </div>

                {!isResting && !isLast && (
                    <button
                        onClick={handleVideoEnd}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px',
                            background: '#ff0202ff',
                            color: 'white'
                        }}
                    >
                        Video Finished - Start Rest Period
                    </button>
                )}

                {isLast && !isResting && (
                    <div style={{
                        width: '100%',
                        marginTop: '24px',
                        background: '#ff0202ff',
                        color: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                            Workout Complete!
                        </h3>
                        <p style={{ fontSize: '18px' }}>Great job finishing all movements!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SingleWorkout;








// ::::::::::::::::autoplay error :::::::::::::::::::
// ::::::::::::::::autoplay error :::::::::::::::::::
// ::::::::::::::::autoplay error :::::::::::::::::::
// ::::::::::::::::autoplay error :::::::::::::::::::
// ::::::::::::::::autoplay error :::::::::::::::::::




// 'use client';

// import React, { useEffect, useState, useRef } from 'react';
// import { useParams } from 'next/navigation';
// import { Stream } from '@cloudflare/stream-react';
// import './single-workout.css';

// interface MovementItem {
//     id: string;
//     sequence_order: number;
//     duration: number;
//     rest_after: number;
//     movements: {
//         id: string;
//         name: string;
//         video_id: string | null;
//         video_url: string;
//         thumbnail_url: string;
//     };
// }

// interface WorkoutData {
//     id: string;
//     name: string;
//     workout_movements: MovementItem[];
// }

// const SingleWorkout: React.FC = () => {
//     const [workout, setWorkout] = useState<WorkoutData | null>(null);
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [isResting, setIsResting] = useState(false);
//     const [restTimer, setRestTimer] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const { workoutId } = useParams();

//     const timerRef = useRef<NodeJS.Timeout | null>(null);

//     useEffect(() => {
//         if (!workoutId) return;

//         const fetchWorkout = async () => {
//             try {
//                 setLoading(true);
//                 const res = await fetch(`/api/admin/workout/${workoutId}`);

//                 if (!res.ok) {
//                     throw new Error('Failed to load workout');
//                 }

//                 const data: WorkoutData = await res.json();
//                 setWorkout(data);
//                 setError(null);
//             } catch (err) {
//                 console.error('Error fetching workout:', err);
//                 setError(err instanceof Error ? err.message : 'Unknown error occurred');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchWorkout();
//     }, [workoutId]);

//     useEffect(() => {
//         return () => {
//             if (timerRef.current) {
//                 clearInterval(timerRef.current);
//             }
//         };
//     }, []);

//     const startRestPeriod = (restSeconds: number) => {
//         if (restSeconds <= 0) {
//             goToNextVideo();
//             return;
//         }

//         setIsResting(true);
//         setRestTimer(restSeconds);

//         timerRef.current = setInterval(() => {
//             setRestTimer((prev) => {
//                 if (prev <= 1) {
//                     if (timerRef.current) {
//                         clearInterval(timerRef.current);
//                     }
//                     setIsResting(false);
//                     goToNextVideo();
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);
//     };

//     const handleVideoEnd = () => {
//         const current = workout?.workout_movements[currentIndex];
//         if (!current) return;

//         if (!workout || currentIndex >= workout.workout_movements.length - 1) {
//             return;
//         }

//         startRestPeriod(current.rest_after);
//     };

//     const goToNextVideo = () => {
//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }

//         setIsResting(false);
//         setRestTimer(0);

//         if (workout && currentIndex < workout.workout_movements.length - 1) {
//             setCurrentIndex(prev => prev + 1);
//         }
//     };

//     const goToPreviousVideo = () => {
//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }

//         setIsResting(false);
//         setRestTimer(0);

//         if (currentIndex > 0) {
//             setCurrentIndex(prev => prev - 1);
//         }
//     };

//     const skipRest = () => {
//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }
//         setIsResting(false);
//         setRestTimer(0);
//         goToNextVideo();
//     };

//     if (loading) {
//         return (
//             <div className="single-workout-container">
//                 <div className="workout-card">
//                     <p>Loading workout...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="single-workout-container">
//                 <div className="workout-card">
//                     <p style={{ color: 'red' }}>Error: {error}</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!workout || !workout.workout_movements || workout.workout_movements.length === 0) {
//         return (
//             <div className="single-workout-container">
//                 <div className="workout-card">
//                     <p>No workout movements found.</p>
//                 </div>
//             </div>
//         );
//     }

//     const currentMovement = workout.workout_movements[currentIndex];
//     const isFirst = currentIndex === 0;
//     const isLast = currentIndex === workout.workout_movements.length - 1;
//     const totalMovements = workout.workout_movements.length;


//     if (!currentMovement) {
//         return (
//             <div className="single-workout-container">
//                 <div className="workout-card">
//                     <p>Loading movement...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="single-workout-container">
//             <div className="workout-card">
//                 <div style={{ width: '100%', marginBottom: '20px' }}>
//                     <h1 className="workout-title">{workout.name}</h1>
//                     <div className="workout-meta">
//                         <div className="meta-item">
//                             <span className="meta-label">Movement:</span>
//                             <span className="meta-value">{currentIndex + 1} of {totalMovements}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {isResting ? (
//                     <div style={{
//                         width: '100%',
//                         aspectRatio: '16/9',
//                         background: 'linear-gradient(135deg, #ff0202ff 0%, #ff0202ff 100%)',
//                         borderRadius: '8px',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         padding: '40px',
//                         color: 'white'
//                     }}>
//                         <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px' }}>Rest Time</h2>
//                         <div style={{ fontSize: '72px', fontWeight: '700', marginBottom: '20px' }}>{restTimer}s</div>
//                         {currentIndex < totalMovements - 1 && (
//                             <p style={{ fontSize: '20px', marginBottom: '20px' }}>
//                                 Next: {workout.workout_movements[currentIndex + 1]?.movements.name}
//                             </p>
//                         )}
//                         <button
//                             onClick={skipRest}
//                             style={{
//                                 background: 'white',
//                                 color: '#ff0202ff',
//                                 padding: '12px 24px',
//                                 borderRadius: '24px',
//                                 border: 'none',
//                                 fontWeight: '600',
//                                 cursor: 'pointer',
//                                 fontSize: '16px'
//                             }}
//                         >
//                             Skip Rest
//                         </button>
//                     </div>
//                 ) : (
//                     <>
//                         {currentMovement.movements.video_id ? (
//                             // default cloudFlare plalyer
//                             // <iframe
//                             //     key={currentMovement.movements.video_id}
//                             //     src={`https://iframe.videodelivery.net/${currentMovement.movements.video_id}?autoplay=true&muted=false`}
//                             //     allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
//                             //     allowFullScreen
//                             //     className="workout-image"
//                             //     style={{ aspectRatio: '16/9', border: 'none' }}
//                             // />
//                             <Stream
//                                 controls
//                                 autoplay
//                                 src={currentMovement.movements.video_id}
//                                 onEnded={handleVideoEnd}
//                                 onError={(e) => console.error('Video error', e)}
//                                 className="w-full h-full rounded-xl"
//                             />

//                         ) : (
//                         <div style={{
//                             width: '100%',
//                             aspectRatio: '16/9',
//                             background: '#f0f0f0',
//                             borderRadius: '8px',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center'
//                         }}>
//                             <p>No video available</p>
//                         </div>
//                         )}

//                         <div style={{ width: '100%', marginTop: '16px' }}>
//                             <div className="casting-cnt">
//                                 <h2 className="workout-title">{currentMovement.movements.name}</h2>
//                                 <img src="/casting_icon.png" alt="casting img"/>
//                             </div>
//                             <div className="workout-meta">
//                                 {currentMovement.duration > 0 && (
//                                     <div className="meta-item">
//                                         <span className="meta-label">Duration:</span>
//                                         <span className="meta-value">{currentMovement.duration}s</span>
//                                     </div>
//                                 )}
//                                 {currentMovement.rest_after > 0 && (
//                                     <div className="meta-item">
//                                         <span className="meta-label">Rest After:</span>
//                                         <span className="meta-value">{currentMovement.rest_after}s</span>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </>
//                 )}

//                 <div style={{
//                     width: '100%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'space-between',
//                     marginTop: '24px',
//                     gap: '16px'
//                 }}>
//                     <button
//                         onClick={goToPreviousVideo}
//                         disabled={isFirst}
//                         style={{
//                             padding: '12px 24px',
//                             borderRadius: '24px',
//                             border: 'none',
//                             fontWeight: '600',
//                             cursor: isFirst ? 'not-allowed' : 'pointer',
//                             fontSize: '16px',
//                             background: isFirst ? '#e0e0e0' : '#ff0202ff',
//                             color: isFirst ? '#999' : 'white',
//                             opacity: isFirst ? 0.6 : 1
//                         }}
//                     >
//                         ← Previous
//                     </button>

//                     <div style={{ flex: 1, maxWidth: '300px' }}>
//                         <div style={{
//                             background: '#e0e0e0',
//                             height: '8px',
//                             borderRadius: '4px',
//                             overflow: 'hidden'
//                         }}>
//                             <div style={{
//                                 background: '#ff0202ff',
//                                 height: '100%',
//                                 width: `${((currentIndex + 1) / totalMovements) * 100}%`,
//                                 transition: 'width 0.3s ease'
//                             }} />
//                         </div>
//                     </div>

//                     <button
//                         onClick={isLast ? undefined : goToNextVideo}
//                         disabled={isLast}
//                         style={{
//                             padding: '12px 24px',
//                             borderRadius: '24px',
//                             border: 'none',
//                             fontWeight: '600',
//                             cursor: isLast ? 'not-allowed' : 'pointer',
//                             fontSize: '16px',
//                             background: isLast ? '#e0e0e0' : '#ff0202ff',
//                             color: isLast ? '#999' : 'white',
//                             opacity: isLast ? 0.6 : 1
//                         }}
//                     >
//                         Next →
//                     </button>
//                 </div>

//                 {!isResting && !isLast && (
//                     <button
//                         onClick={handleVideoEnd}
//                         style={{
//                             width: '100%',
//                             marginTop: '16px',
//                             padding: '16px',
//                             borderRadius: '8px',
//                             border: 'none',
//                             fontWeight: '600',
//                             cursor: 'pointer',
//                             fontSize: '16px',
//                             background: '#ff0202ff',
//                             color: 'white'
//                         }}
//                     >
//                         Video Finished - Start Rest Period
//                     </button>
//                 )}

//                 {isLast && !isResting && (
//                     <div style={{
//                         width: '100%',
//                         marginTop: '24px',
//                         background: '#ff0202ff',
//                         color: 'white',
//                         padding: '24px',
//                         borderRadius: '8px',
//                         textAlign: 'center'
//                     }}>
//                         <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
//                             Workout Complete!
//                         </h3>
//                         <p style={{ fontSize: '18px' }}>Great job finishing all movements!</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default SingleWorkout;






// ::::::::::::Static Design::::::::::::
// ::::::::::::Static Design::::::::::::
// ::::::::::::Static Design::::::::::::


// 'use client';

// import React from 'react';
// // import Image from 'next/image';
// import './single-workout.css';

// const SingleWorkout: React.FC = () => {
//     return (
//         <div className="single-workout-container">
//             <div className="workout-card">
//                 <img
//                     src="https://picsum.photos/800/400?random=1"
//                     alt="Workout"
//                     className="workout-image"
//                 />
//                 <div className="casting-cnt">
//                      <h1 className="workout-title">Morning Kickboxing Live</h1>
//                      <img src="/casting_icon.png" alt="casting img"/>

//                 </div>

//                 <div className="workout-meta">
//                     <div className="meta-item">
//                           <span className="meta-icon">
//                             <img src="/duration_icon.png" alt="tick_icon"/>
//                           </span>
//                         <span className="meta-label">Duration:</span>
//                         <span className="meta-value">60 min</span>
//                     </div>
//                     <div className="meta-item">
//                          <span className="meta-icon">
//                             <img src="/tick_icon.png" alt="duration_icon"/>
//                           </span>
//                         <span className="meta-label">Status:</span>
//                         <span className="meta-value status-active">Active</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SingleWorkout;

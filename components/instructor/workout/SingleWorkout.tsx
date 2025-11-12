'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useChromecastContext } from '@/lib/context/ChromecastContext';
import { CastWorkoutPlayer } from '../chromeCast/CastWorkoutPlayer';
import { useAuthStore } from '@/stores/useAuthStore';
import './SingleWorkout.css';

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
    const user = useAuthStore((state) => state.user);
    const [workout, setWorkout] = useState<WorkoutData | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(0);
    const [workoutComplete, setWorkoutComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { workoutId } = useParams();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const currentIndexRef = useRef(currentIndex);
    const workoutRef = useRef(workout);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const saveRecentWorkout = async () => {
        if (!user?.id || !workoutId) {
            console.log('Missing user or workoutId — skipping recent workout save.');
            return;
        }
        try {
            // const res = await fetch('/api/content-admin/recent-workouts', {
            const res = await fetch('/api/instructor/recent-workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    workout_id: workoutId,
                }),
            });

            const result = await res.json();
            console.log('Recent workout API response:', result);
        } catch (error) {
            console.log('Error saving recent workout:', error);
        }
    };
    useEffect(() => {
        saveRecentWorkout();
    }, [user?.id, workoutId]);

    const {
        isCastAvailable,
        isConnected,
        isLoading: castLoading,
        deviceName,
        requestCastSession,
    } = useChromecastContext();

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://iframe.videodelivery.net') {
                return;
            }
            try {
                const data = event.data;
                if (data && data.eventName === 'ended') {
                    handleVideoEnd();
                }
            } catch (error) {
                console.error('Error handling iframe message:', error);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [currentIndex, workout]);

    useEffect(() => {
        workoutRef.current = workout;
    }, [workout]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        const elem = videoContainerRef.current;
        if (!elem) return;

        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        if (!workoutId) return;

        const fetchWorkout = async () => {
            try {
                setLoading(true);
                // const res = await fetch(`/api/content-admin/workout/${workoutId}`);
                const res = await fetch(`/api/content-admin/workout/${workoutId}`);
                if (!res.ok) throw new Error('Failed to load workout');
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
                    if (
                        currentWorkout &&
                        currentIdx < currentWorkout.workout_movements.length - 1
                    ) {
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
            setWorkoutComplete(true);
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
        setWorkoutComplete(false);
        if (workout && currentIndex < workout.workout_movements.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const goToPreviousVideo = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsResting(false);
        setRestTimer(0);
        setWorkoutComplete(false);
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
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

    const handleCastClick = async () => {
        console.log(' Cast button clicked');
        await requestCastSession();
    };

    const handleCastDisconnect = () => {
        console.log(' Cast disconnected handler called');
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

    // Render Cast Player when connected
    if (isConnected) {
        console.log(' Rendering CastWorkoutPlayer');
        return (
            <div className="single-workout-container">
                <div className="workout-card">
                    <h1 className="workout-title">{workout.name}</h1>
                    <CastWorkoutPlayer
                        workout={workout}
                        currentIndex={currentIndex}
                        onIndexChange={setCurrentIndex}
                        onComplete={() => setWorkoutComplete(true)}
                        onDisconnect={handleCastDisconnect}
                    />
                    {workoutComplete && (
                        <div
                            style={{
                                marginTop: '20px',
                                padding: '20px',
                                background: 'rgba(0, 2, 2, 0.05)',
                                borderRadius: '8px',
                                textAlign: 'center',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    marginBottom: '8px',
                                }}
                            >
                                Workout Complete!
                            </h3>
                            <p
                                style={{
                                    fontSize: '16px',
                                }}
                            >
                                Great job finishing all {workout.workout_movements.length}{' '}
                                movements!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Regular player when not connected
    console.log(' Rendering regular player');
    const currentMovement = workout.workout_movements[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === workout.workout_movements.length - 1;
    const totalMovements = workout.workout_movements.length;

    const getIframeSrc = (videoId: string) => {
        return `https://iframe.videodelivery.net/${videoId}?autoplay=true&controls=true`;
    };

    return (
        <div className="single-workout-container">
            <div className="workout-card">
                <div style={{ width: '100%', marginBottom: '20px' }}>
                    <h1 className="workout-title">{workout.name}</h1>
                    <div className="workout-meta">
                        <div className="meta-item">
                            <span className="meta-label">Movement:</span>
                            <span className="meta-value">
                                {currentIndex + 1} of {totalMovements}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    ref={videoContainerRef}
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/9',
                        background: '#000',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                >
                    {currentMovement?.movements.video_id ? (
                        <iframe
                            ref={iframeRef}
                            key={currentMovement.movements.video_id}
                            src={getIframeSrc(currentMovement.movements.video_id)}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                            allow="autoplay; encrypted-media;"
                            allowFullScreen={false}
                            title={`Video player for ${currentMovement.movements.name}`}
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <p>No video available</p>
                        </div>
                    )}

                    <button
                        onClick={toggleFullscreen}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            zIndex: 20,
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)')
                        }
                    >
                        {isFullscreen ? '✕ Exit Fullscreen' : 'Fullscreen'}
                    </button>

                    {isResting && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.92)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px',
                                color: 'white',
                                zIndex: 10,
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: isFullscreen ? '48px' : '32px',
                                    fontWeight: '700',
                                    marginBottom: '20px',
                                    textAlign: 'center',
                                }}
                            >
                                Rest Time
                            </h2>
                            <div
                                style={{
                                    fontSize: isFullscreen ? '120px' : '72px',
                                    fontWeight: '700',
                                    marginBottom: '20px',
                                    color: '#b40200',
                                }}
                            >
                                {restTimer}s
                            </div>
                            {currentIndex < totalMovements - 1 && (
                                <p
                                    style={{
                                        fontSize: isFullscreen ? '28px' : '20px',
                                        marginBottom: '30px',
                                        textAlign: 'center',
                                        maxWidth: '80%',
                                    }}
                                >
                                    Next:{' '}
                                    {workout.workout_movements[currentIndex + 1]?.movements.name}
                                </p>
                            )}
                            <button
                                onClick={skipRest}
                                style={{
                                    background: '#b40200',
                                    color: 'white',
                                    padding: isFullscreen ? '16px 48px' : '12px 24px',
                                    borderRadius: '24px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: isFullscreen ? '20px' : '16px',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = 'scale(1.05)')
                                }
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                Skip Rest →
                            </button>
                        </div>
                    )}

                    {workoutComplete && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 2, 2, 0.95)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px',
                                color: 'white',
                                zIndex: 10,
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: isFullscreen ? '48px' : '32px',
                                    fontWeight: '700',
                                    marginBottom: '16px',
                                    textAlign: 'center',
                                }}
                            >
                                Workout Complete!
                            </h3>
                            <p
                                style={{
                                    fontSize: isFullscreen ? '24px' : '18px',
                                    textAlign: 'center',
                                }}
                            >
                                Great job finishing all {totalMovements} movements!
                            </p>
                        </div>
                    )}
                </div>

                {!isFullscreen && (
                    <>
                        <div style={{ width: '100%', marginTop: '16px' }}>
                            <div className="casting-cnt">
                                <h2 className="workout-title">{currentMovement?.movements.name}</h2>
                                {isCastAvailable && (
                                    <button
                                        onClick={handleCastClick}
                                        disabled={castLoading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: castLoading ? 'not-allowed' : 'pointer',
                                            padding: '8px',
                                            opacity: castLoading ? 0.5 : 1,
                                            transition: 'opacity 0.2s',
                                        }}
                                        title="Cast to TV"
                                    >
                                        <img
                                            src="/casting_icon.png"
                                            alt="Cast to TV"
                                            style={{
                                                width: '20px',
                                                height: '16px',
                                                filter: castLoading ? 'grayscale(100%)' : 'none',
                                            }}
                                        />
                                    </button>
                                )}
                            </div>
                            <div className="workout-meta">
                                {currentMovement?.duration > 0 && (
                                    <div className="meta-item">
                                        <span className="meta-label">Duration:</span>
                                        <span className="meta-value">
                                            {currentMovement.duration}s
                                        </span>
                                    </div>
                                )}
                                {currentMovement?.rest_after > 0 && (
                                    <div className="meta-item">
                                        <span className="meta-label">Rest After:</span>
                                        <span className="meta-value">
                                            {currentMovement.rest_after}s
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '24px',
                                gap: '16px',
                            }}
                        >
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
                                    background: isFirst ? '#e0e0e0' : '#b40200',
                                    color: isFirst ? '#999' : 'white',
                                    opacity: isFirst ? 0.6 : 1,
                                }}
                            >
                                ← Previous
                            </button>

                            <div style={{ flex: 1, maxWidth: '300px' }}>
                                <div
                                    style={{
                                        background: '#e0e0e0',
                                        height: '8px',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            background: '#b40200',
                                            height: '100%',
                                            width: `${((currentIndex + 1) / totalMovements) * 100}%`,
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
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
                                    background: isLast ? '#e0e0e0' : '#b40200',
                                    color: isLast ? '#999' : 'white',
                                    opacity: isLast ? 0.6 : 1,
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
                                    background: '#b40200',
                                    color: 'white',
                                }}
                            >
                                Video Finished - Start Rest Period
                            </button>
                        )}

                        {isLast && !workoutComplete && (
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
                                    background: '#b40200',
                                    color: 'white',
                                }}
                            >
                                Complete Workout
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SingleWorkout;

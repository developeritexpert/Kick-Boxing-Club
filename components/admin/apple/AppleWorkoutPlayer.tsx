import React, { useEffect, useState, useRef, useCallback } from 'react';

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

interface AppleWorkoutPlayerProps {
    workout: WorkoutData;
    currentIndex: number;
    onIndexChange: (index: number) => void;
    onComplete: () => void;
}

export const AppleWorkoutPlayer: React.FC<AppleWorkoutPlayerProps> = ({
    workout,
    currentIndex,
    onIndexChange,
    onComplete
}) => {
    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(0);
    const [workoutComplete, setWorkoutComplete] = useState(false);
    const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Check AirPlay availability
    useEffect(() => {
        const video = videoRef.current;
        if (video && 'webkitShowPlaybackTargetPicker' in video) {
            const checkAirPlay = () => {
                if (video.readyState >= 1) {
                    setIsAirPlayAvailable(true);
                } else {
                    const handleMetadata = () => {
                        setIsAirPlayAvailable(true);
                    };
                    video.addEventListener('loadedmetadata', handleMetadata, { once: true });
                    return () => video.removeEventListener('loadedmetadata', handleMetadata);
                }
            };
            checkAirPlay();
        }
    }, [currentIndex]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const goToNextVideo = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        setIsResting(false);
        setRestTimer(0);
        setWorkoutComplete(false);

        if (currentIndex < workout.workout_movements.length - 1) {
            requestAnimationFrame(() => {
                onIndexChange(currentIndex + 1);
            });
        }
    }, [currentIndex, workout.workout_movements.length, onIndexChange]);

    const startRestPeriod = useCallback((restSeconds: number) => {
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
                    
                    requestAnimationFrame(() => {
                        setIsResting(false);
                        
                        if (currentIndex < workout.workout_movements.length - 1) {
                            onIndexChange(currentIndex + 1);
                        }
                    });
                    
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [currentIndex, workout.workout_movements.length, onIndexChange, goToNextVideo]);

    const handleVideoEnd = useCallback(() => {
        const current = workout.workout_movements[currentIndex];
        if (!current) return;

        if (currentIndex >= workout.workout_movements.length - 1) {
            requestAnimationFrame(() => {
                setWorkoutComplete(true);
                onComplete();
            });
            return;
        }

        startRestPeriod(current.rest_after);
    }, [currentIndex, workout.workout_movements, onComplete, startRestPeriod]);

    const goToPreviousVideo = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        setIsResting(false);
        setRestTimer(0);
        setWorkoutComplete(false);

        if (currentIndex > 0) {
            requestAnimationFrame(() => {
                onIndexChange(currentIndex - 1);
            });
        }
    }, [currentIndex, onIndexChange]);

    const skipRest = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        setIsResting(false);
        setRestTimer(0);
        goToNextVideo();
    }, [goToNextVideo]);

    const handleAirPlay = useCallback(() => {
        const video = videoRef.current;
        if (video && 'webkitShowPlaybackTargetPicker' in video) {
            try {
                (video as any).webkitShowPlaybackTargetPicker();
            } catch (error) {
                console.error('AirPlay error:', error);
            }
        }
    }, []);

    const currentMovement = workout.workout_movements[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === workout.workout_movements.length - 1;
    const totalMovements = workout.workout_movements.length;

    // Convert iframe URL to direct video URL
    const getVideoUrl = useCallback((videoUrl: string) => {
        const match = videoUrl.match(/\/([a-f0-9]+)$/);
        if (match) {
            const videoId = match[1];
            return `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
        }
        return videoUrl;
    }, []);

    if (!currentMovement) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>No movement available</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                padding: '24px' 
            }}>
                <div style={{ width: '100%', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
                        {workout.name}
                    </h1>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                        <div>
                            <span style={{ fontWeight: '600' }}>Movement:</span>{' '}
                            <span>{currentIndex + 1} of {totalMovements}</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/9',
                    background: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    {currentMovement?.movements.video_url ? (
                        <video
                            ref={videoRef}
                            key={`${currentMovement.movements.video_url}-${currentIndex}`}
                            src={getVideoUrl(currentMovement.movements.video_url)}
                            autoPlay
                            controls
                            playsInline
                            webkit-playsinline="true"
                            x-webkit-airplay="allow"
                            preload="metadata"
                            onEnded={handleVideoEnd}
                            onError={(e) => {
                                console.error('Video error:', e);
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f0f0f0'
                        }}>
                            <p>No video available</p>
                        </div>
                    )}

                    {/* AirPlay Button */}
                    {isAirPlayAvailable && !isResting && !workoutComplete && (
                        <button
                            onClick={handleAirPlay}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                zIndex: 20,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 22h12l-6-6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                            </svg>
                            AirPlay
                        </button>
                    )}

                    {/* Rest Overlay */}
                    {isResting && (
                        <div style={{
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
                            zIndex: 10
                        }}>
                            <h2 style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                Rest Time
                            </h2>
                            <div style={{
                                fontSize: '72px',
                                fontWeight: '700',
                                marginBottom: '20px',
                                color: '#b40200'
                            }}>
                                {restTimer}s
                            </div>
                            {currentIndex < totalMovements - 1 && (
                                <p style={{
                                    fontSize: '20px',
                                    marginBottom: '30px',
                                    textAlign: 'center',
                                    maxWidth: '80%'
                                }}>
                                    Next: {workout.workout_movements[currentIndex + 1]?.movements.name}
                                </p>
                            )}
                            <button
                                onClick={skipRest}
                                style={{
                                    background: '#b40200',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '24px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Skip Rest →
                            </button>
                        </div>
                    )}

                    {/* Workout Complete Overlay */}
                    {workoutComplete && (
                        <div style={{
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
                            zIndex: 10
                        }}>
                            <h3 style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                marginBottom: '16px',
                                textAlign: 'center'
                            }}>
                                Workout Complete!
                            </h3>
                            <p style={{
                                fontSize: '18px',
                                textAlign: 'center'
                            }}>
                                Great job finishing all {totalMovements} movements!
                            </p>
                        </div>
                    )}
                </div>

                {/* Movement Info */}
                <div style={{ width: '100%', marginTop: '16px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
                        {currentMovement?.movements.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                        {currentMovement?.duration > 0 && (
                            <div>
                                <span style={{ fontWeight: '600' }}>Duration:</span>{' '}
                                <span>{currentMovement.duration}s</span>
                            </div>
                        )}
                        {currentMovement?.rest_after > 0 && (
                            <div>
                                <span style={{ fontWeight: '600' }}>Rest After:</span>{' '}
                                <span>{currentMovement.rest_after}s</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
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
                            background: isFirst ? '#e0e0e0' : '#b40200',
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
                                background: '#b40200',
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
                            background: isLast ? '#e0e0e0' : '#b40200',
                            color: isLast ? '#999' : 'white',
                            opacity: isLast ? 0.6 : 1
                        }}
                    >
                        Next →
                    </button>
                </div>

                {/* Action Buttons */}
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
                            color: 'white'
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
                            color: 'white'
                        }}
                    >
                        Complete Workout
                    </button>
                )}
            </div>
        </div>
    );
};
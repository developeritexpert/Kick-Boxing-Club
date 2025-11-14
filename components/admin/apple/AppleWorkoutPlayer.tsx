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
    onComplete,
}) => {
    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(0);
    const [workoutComplete, setWorkoutComplete] = useState(false);
    const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
    const [isAirPlaying, setIsAirPlaying] = useState(false);
    const [needsPlayInteraction, setNeedsPlayInteraction] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasPlayedRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const videoEndHandledRef = useRef(false);

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
                }
            };
            checkAirPlay();
        }
    }, [currentIndex]);

    // Reset state when video changes
    useEffect(() => {
        videoEndHandledRef.current = false;
        isTransitioningRef.current = false;
        setIsVideoReady(false);
        hasPlayedRef.current = false;
    }, [currentIndex]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    const clearRestTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const goToNextVideo = useCallback(() => {
        if (isTransitioningRef.current) return;

        isTransitioningRef.current = true;
        clearRestTimer();

        setIsResting(false);
        setRestTimer(0);
        setWorkoutComplete(false);
        setNeedsPlayInteraction(false);

        if (currentIndex < workout.workout_movements.length - 1) {
            // Use setTimeout to avoid state update during render
            setTimeout(() => {
                onIndexChange(currentIndex + 1);
                isTransitioningRef.current = false;
            }, 0);
        } else {
            isTransitioningRef.current = false;
        }
    }, [currentIndex, workout.workout_movements.length, onIndexChange, clearRestTimer]);

    const startRestPeriod = useCallback(
        (restSeconds: number) => {
            if (isTransitioningRef.current) return;

            clearRestTimer();

            if (restSeconds <= 0) {
                goToNextVideo();
                return;
            }

            setIsResting(true);
            setRestTimer(restSeconds);
            setNeedsPlayInteraction(isAirPlaying);

            let currentRest = restSeconds;

            timerRef.current = setInterval(() => {
                currentRest -= 1;

                if (currentRest <= 0) {
                    clearRestTimer();
                    setIsResting(false);
                    setRestTimer(0);

                    if (currentIndex < workout.workout_movements.length - 1) {
                        // Use setTimeout to avoid state update during render
                        setTimeout(() => {
                            onIndexChange(currentIndex + 1);
                        }, 0);
                    }
                } else {
                    setRestTimer(currentRest);
                }
            }, 1000);
        },
        [
            currentIndex,
            workout.workout_movements.length,
            onIndexChange,
            isAirPlaying,
            clearRestTimer,
            goToNextVideo,
        ],
    );

    const handleVideoEnd = useCallback(() => {
        // Prevent multiple calls
        if (videoEndHandledRef.current || isTransitioningRef.current) {
            console.log('Video end already handled or transitioning');
            return;
        }

        videoEndHandledRef.current = true;
        const current = workout.workout_movements[currentIndex];
        if (!current) return;

        console.log('Handling video end for index:', currentIndex);

        if (currentIndex >= workout.workout_movements.length - 1) {
            setWorkoutComplete(true);
            setTimeout(() => {
                onComplete();
            }, 0);
            return;
        }

        startRestPeriod(current.rest_after);
    }, [currentIndex, workout.workout_movements, onComplete, startRestPeriod]);

    const goToPreviousVideo = useCallback(() => {
        if (isTransitioningRef.current) return;

        isTransitioningRef.current = true;
        clearRestTimer();

        setIsResting(false);
        setRestTimer(0);
        setWorkoutComplete(false);
        setNeedsPlayInteraction(false);

        if (currentIndex > 0) {
            setTimeout(() => {
                onIndexChange(currentIndex - 1);
                isTransitioningRef.current = false;
            }, 0);
        } else {
            isTransitioningRef.current = false;
        }
    }, [currentIndex, onIndexChange, clearRestTimer]);

    const skipRest = useCallback(() => {
        if (isTransitioningRef.current) return;

        clearRestTimer();
        setIsResting(false);
        setRestTimer(0);
        goToNextVideo();
    }, [goToNextVideo, clearRestTimer]);

    const handlePlayVideo = useCallback(async () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            await video.play();
            setNeedsPlayInteraction(false);
            hasPlayedRef.current = true;
        } catch (error) {
            console.error('Play error:', error);
            setNeedsPlayInteraction(true);
        }
    }, []);

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

    // Detect when AirPlay playback starts or stops
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleWirelessChange = () => {
            const isWireless = (video as any).webkitCurrentPlaybackTargetIsWireless;
            setIsAirPlaying(isWireless);

            // When AirPlay starts, we need user interaction for playback
            if (isWireless && !hasPlayedRef.current) {
                setNeedsPlayInteraction(true);
            }
        };

        video.addEventListener(
            'webkitcurrentplaybacktargetiswirelesschanged',
            handleWirelessChange,
        );

        return () => {
            video.removeEventListener(
                'webkitcurrentplaybacktargetiswirelesschanged',
                handleWirelessChange,
            );
        };
    }, []);

    // Handle video ready state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleCanPlay = () => {
            setIsVideoReady(true);

            // Try to autoplay if not AirPlaying or if already played before
            if (!isAirPlaying || hasPlayedRef.current) {
                video.play().catch(() => {
                    setNeedsPlayInteraction(true);
                });
            } else {
                setNeedsPlayInteraction(true);
            }
        };

        const handleLoadStart = () => {
            setIsVideoReady(false);
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadstart', handleLoadStart);

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadstart', handleLoadStart);
        };
    }, [isAirPlaying, currentIndex]);

    // Detect actual video end with better timing for AirPlay
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isAirPlaying) return;

        let lastTime = 0;
        const NEAR_END_THRESHOLD = 1; // 1 second before end

        const checkEnd = () => {
            if (videoEndHandledRef.current || isTransitioningRef.current) return;

            const currentTime = video.currentTime;
            const duration = video.duration;

            // Only process if we have valid duration and we're progressing
            if (duration > 0 && currentTime > 0 && currentTime > lastTime) {
                lastTime = currentTime;

                // Check if we're near the end
                if (duration - currentTime <= NEAR_END_THRESHOLD) {
                    console.log('AirPlay video ending detected:', { currentTime, duration });
                    handleVideoEnd();
                }
            }
        };

        video.addEventListener('timeupdate', checkEnd);

        return () => {
            video.removeEventListener('timeupdate', checkEnd);
        };
    }, [isAirPlaying, handleVideoEnd]);

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
            <div
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    padding: '24px',
                }}
            >
                <div style={{ width: '100%', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
                        {workout.name}
                    </h1>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                        <div>
                            <span style={{ fontWeight: '600' }}>Movement:</span>{' '}
                            <span>
                                {currentIndex + 1} of {totalMovements}
                            </span>
                        </div>
                        {isAirPlaying && (
                            <div style={{ color: '#b40200', fontWeight: '600' }}>
                                🔗 AirPlay Active
                            </div>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/9',
                        background: '#000',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                >
                    {currentMovement?.movements.video_url ? (
                        <video
                            ref={videoRef}
                            key={`${currentMovement.movements.video_url}-${currentIndex}`}
                            src={getVideoUrl(currentMovement.movements.video_url)}
                            controls
                            playsInline
                            webkit-playsinline="true"
                            x-webkit-airplay="allow"
                            preload="auto"
                            onEnded={() => {
                                if (isAirPlaying) {
                                    console.log("Ignoring 'ended' event — AirPlay active.");
                                    return;
                                }
                                console.log("Normal 'ended' event triggered");
                                handleVideoEnd();
                            }}
                            onError={(e) => {
                                console.error('Video error:', e);
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f0f0f0',
                            }}
                        >
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
                                background: isAirPlaying
                                    ? 'rgba(180, 2, 0, 0.9)'
                                    : 'rgba(0, 0, 0, 0.7)',
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
                                gap: '6px',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 22h12l-6-6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                            </svg>
                            {isAirPlaying ? 'Connected' : 'AirPlay'}
                        </button>
                    )}

                    {/* Play Button Overlay - Shows when user interaction is needed */}
                    {needsPlayInteraction && !isResting && !workoutComplete && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 15,
                            }}
                        >
                            <button
                                onClick={handlePlayVideo}
                                style={{
                                    background: '#b40200',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '80px',
                                    height: '80px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '32px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                }}
                            >
                                ▶
                            </button>
                            <p
                                style={{
                                    color: 'white',
                                    marginTop: '16px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                }}
                            >
                                Tap to play
                            </p>
                        </div>
                    )}

                    {/* Rest Overlay */}
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
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    marginBottom: '20px',
                                    textAlign: 'center',
                                }}
                            >
                                Rest Time
                            </h2>
                            <div
                                style={{
                                    fontSize: '72px',
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
                                        fontSize: '20px',
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
                                    padding: '12px 24px',
                                    borderRadius: '24px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                }}
                            >
                                Skip Rest →
                            </button>
                        </div>
                    )}

                    {/* Workout Complete Overlay */}
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
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    marginBottom: '16px',
                                    textAlign: 'center',
                                }}
                            >
                                Workout Complete!
                            </h3>
                            <p
                                style={{
                                    fontSize: '18px',
                                    textAlign: 'center',
                                }}
                            >
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
            </div>
        </div>
    );
};

// // working on website but not in airplay
// import React, { useEffect, useState, useRef, useCallback } from 'react';

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

// interface AppleWorkoutPlayerProps {
//     workout: WorkoutData;
//     currentIndex: number;
//     onIndexChange: (index: number) => void;
//     onComplete: () => void;
// }

// export const AppleWorkoutPlayer: React.FC<AppleWorkoutPlayerProps> = ({
//     workout,
//     currentIndex,
//     onIndexChange,
//     onComplete
// }) => {
//     const [isResting, setIsResting] = useState(false);
//     const [restTimer, setRestTimer] = useState(0);
//     const [workoutComplete, setWorkoutComplete] = useState(false);
//     const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);

//     const [isAirPlaying, setIsAirPlaying] = useState(false);
//     const handleVideoEndRef = useRef<() => void>(() => { });

//     const videoRef = useRef<HTMLVideoElement>(null);
//     const timerRef = useRef<NodeJS.Timeout | null>(null);

//     // Check AirPlay availability
//     useEffect(() => {
//         const video = videoRef.current;
//         if (video && 'webkitShowPlaybackTargetPicker' in video) {
//             const checkAirPlay = () => {
//                 if (video.readyState >= 1) {
//                     setIsAirPlayAvailable(true);
//                 } else {
//                     const handleMetadata = () => {
//                         setIsAirPlayAvailable(true);
//                     };
//                     video.addEventListener('loadedmetadata', handleMetadata, { once: true });
//                     return () => video.removeEventListener('loadedmetadata', handleMetadata);
//                 }
//             };
//             checkAirPlay();
//         }
//     }, [currentIndex]);

//     // Cleanup timer on unmount
//     useEffect(() => {
//         return () => {
//             if (timerRef.current) {
//                 clearInterval(timerRef.current);
//             }
//         };
//     }, []);

//     const goToNextVideo = useCallback(() => {
//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }

//         setIsResting(false);
//         setRestTimer(0);
//         setWorkoutComplete(false);

//         if (currentIndex < workout.workout_movements.length - 1) {
//             requestAnimationFrame(() => {
//                 onIndexChange(currentIndex + 1);
//             });
//         }
//     }, [currentIndex, workout.workout_movements.length, onIndexChange]);

//     const startRestPeriod = useCallback((restSeconds: number) => {
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
//                         timerRef.current = null;
//                     }

//                     requestAnimationFrame(() => {
//                         setIsResting(false);

//                         if (currentIndex < workout.workout_movements.length - 1) {
//                             onIndexChange(currentIndex + 1);
//                         }
//                     });

//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);
//     }, [currentIndex, workout.workout_movements.length, onIndexChange, goToNextVideo]);

//     const handleVideoEnd = useCallback(() => {
//         const current = workout.workout_movements[currentIndex];
//         if (!current) return;

//         if (currentIndex >= workout.workout_movements.length - 1) {
//             requestAnimationFrame(() => {
//                 setWorkoutComplete(true);
//                 onComplete();
//             });
//             return;
//         }

//         startRestPeriod(current.rest_after);
//     }, [currentIndex, workout.workout_movements, onComplete, startRestPeriod]);

//     const goToPreviousVideo = useCallback(() => {
//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }

//         setIsResting(false);
//         setRestTimer(0);
//         setWorkoutComplete(false);

//         if (currentIndex > 0) {
//             requestAnimationFrame(() => {
//                 onIndexChange(currentIndex - 1);
//             });
//         }
//     }, [currentIndex, onIndexChange]);

//     const skipRest = useCallback(() => {
//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }

//         setIsResting(false);
//         setRestTimer(0);
//         goToNextVideo();
//     }, [goToNextVideo]);

//     const handleAirPlay = useCallback(() => {
//         const video = videoRef.current;
//         if (video && 'webkitShowPlaybackTargetPicker' in video) {
//             try {
//                 (video as any).webkitShowPlaybackTargetPicker();
//             } catch (error) {
//                 console.error('AirPlay error:', error);
//             }
//         }
//     }, []);

//     // Detect when AirPlay playback starts or stops
//     useEffect(() => {
//         const video = videoRef.current;
//         if (!video) return;

//         const handleWirelessChange = () => {
//             const isWireless = (video as any).webkitCurrentPlaybackTargetIsWireless;
//             setIsAirPlaying(isWireless);
//         };

//         video.addEventListener(
//             "webkitcurrentplaybacktargetiswirelesschanged",
//             handleWirelessChange
//         );

//         return () => {
//             video.removeEventListener(
//                 "webkitcurrentplaybacktargetiswirelesschanged",
//                 handleWirelessChange
//             );
//         };
//     }, []);

//     useEffect(() => {
//         handleVideoEndRef.current = handleVideoEnd;
//     }, [handleVideoEnd]);

//     // detect actual video end
//     useEffect(() => {
//         const video = videoRef.current;
//         if (!video) return;

//         const checkEnd = () => {
//             if (isAirPlaying && video.duration > 0) {
//                 if (video.duration - video.currentTime < 0.25) {
//                     console.log("Real AirPlay ending detected.");
//                     handleVideoEndRef.current();
//                 }
//             }
//         };

//         video.addEventListener("timeupdate", checkEnd);

//         return () => {
//             video.removeEventListener("timeupdate", checkEnd);
//         };
//     }, [isAirPlaying]);

//     const currentMovement = workout.workout_movements[currentIndex];
//     const isFirst = currentIndex === 0;
//     const isLast = currentIndex === workout.workout_movements.length - 1;
//     const totalMovements = workout.workout_movements.length;

//     // Convert iframe URL to direct video URL
//     const getVideoUrl = useCallback((videoUrl: string) => {
//         const match = videoUrl.match(/\/([a-f0-9]+)$/);
//         if (match) {
//             const videoId = match[1];
//             return `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
//         }
//         return videoUrl;
//     }, []);

//     if (!currentMovement) {
//         return (
//             <div style={{ padding: '20px', textAlign: 'center' }}>
//                 <p>No movement available</p>
//             </div>
//         );
//     }

//     return (
//         <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
//             <div style={{
//                 background: 'white',
//                 borderRadius: '12px',
//                 boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//                 padding: '24px'
//             }}>
//                 <div style={{ width: '100%', marginBottom: '20px' }}>
//                     <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
//                         {workout.name}
//                     </h1>
//                     <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
//                         <div>
//                             <span style={{ fontWeight: '600' }}>Movement:</span>{' '}
//                             <span>{currentIndex + 1} of {totalMovements}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div style={{
//                     position: 'relative',
//                     width: '100%',
//                     aspectRatio: '16/9',
//                     background: '#000',
//                     borderRadius: '8px',
//                     overflow: 'hidden'
//                 }}>
//                     {currentMovement?.movements.video_url ? (
//                         <video
//                             ref={videoRef}
//                             key={`${currentMovement.movements.video_url}-${currentIndex}`}
//                             src={getVideoUrl(currentMovement.movements.video_url)}
//                             autoPlay
//                             controls
//                             playsInline
//                             webkit-playsinline="true"
//                             x-webkit-airplay="allow"
//                             preload="metadata"
//                             // onEnded={handleVideoEnd}
//                             onEnded={() => {
//                                 if (isAirPlaying) {
//                                     console.log("Ignoring 'ended' — AirPlay active.");
//                                     return;
//                                 }
//                                 handleVideoEnd();
//                             }}
//                             onError={(e) => {
//                                 console.error('Video error:', e);
//                             }}
//                             style={{
//                                 width: '100%',
//                                 height: '100%',
//                                 objectFit: 'contain'
//                             }}
//                         />
//                     ) : (
//                         <div style={{
//                             width: '100%',
//                             height: '100%',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             background: '#f0f0f0'
//                         }}>
//                             <p>No video available</p>
//                         </div>
//                     )}

//                     {/* AirPlay Button */}
//                     {isAirPlayAvailable && !isResting && !workoutComplete && (
//                         <button
//                             onClick={handleAirPlay}
//                             style={{
//                                 position: 'absolute',
//                                 top: '12px',
//                                 right: '12px',
//                                 background: 'rgba(0, 0, 0, 0.7)',
//                                 color: 'white',
//                                 border: 'none',
//                                 borderRadius: '6px',
//                                 padding: '8px 12px',
//                                 cursor: 'pointer',
//                                 fontSize: '14px',
//                                 fontWeight: '600',
//                                 zIndex: 20,
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '6px'
//                             }}
//                         >
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//                                 <path d="M6 22h12l-6-6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
//                             </svg>
//                             AirPlay
//                         </button>
//                     )}

//                     {/* Rest Overlay */}
//                     {isResting && (
//                         <div style={{
//                             position: 'absolute',
//                             top: 0,
//                             left: 0,
//                             right: 0,
//                             bottom: 0,
//                             background: 'rgba(0, 0, 0, 0.92)',
//                             display: 'flex',
//                             flexDirection: 'column',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             padding: '40px',
//                             color: 'white',
//                             zIndex: 10
//                         }}>
//                             <h2 style={{
//                                 fontSize: '32px',
//                                 fontWeight: '700',
//                                 marginBottom: '20px',
//                                 textAlign: 'center'
//                             }}>
//                                 Rest Time
//                             </h2>
//                             <div style={{
//                                 fontSize: '72px',
//                                 fontWeight: '700',
//                                 marginBottom: '20px',
//                                 color: '#b40200'
//                             }}>
//                                 {restTimer}s
//                             </div>
//                             {currentIndex < totalMovements - 1 && (
//                                 <p style={{
//                                     fontSize: '20px',
//                                     marginBottom: '30px',
//                                     textAlign: 'center',
//                                     maxWidth: '80%'
//                                 }}>
//                                     Next: {workout.workout_movements[currentIndex + 1]?.movements.name}
//                                 </p>
//                             )}
//                             <button
//                                 onClick={skipRest}
//                                 style={{
//                                     background: '#b40200',
//                                     color: 'white',
//                                     padding: '12px 24px',
//                                     borderRadius: '24px',
//                                     border: 'none',
//                                     fontWeight: '600',
//                                     cursor: 'pointer',
//                                     fontSize: '16px'
//                                 }}
//                             >
//                                 Skip Rest →
//                             </button>
//                         </div>
//                     )}

//                     {/* Workout Complete Overlay */}
//                     {workoutComplete && (
//                         <div style={{
//                             position: 'absolute',
//                             top: 0,
//                             left: 0,
//                             right: 0,
//                             bottom: 0,
//                             background: 'rgba(0, 2, 2, 0.95)',
//                             display: 'flex',
//                             flexDirection: 'column',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             padding: '40px',
//                             color: 'white',
//                             zIndex: 10
//                         }}>
//                             <h3 style={{
//                                 fontSize: '32px',
//                                 fontWeight: '700',
//                                 marginBottom: '16px',
//                                 textAlign: 'center'
//                             }}>
//                                 Workout Complete!
//                             </h3>
//                             <p style={{
//                                 fontSize: '18px',
//                                 textAlign: 'center'
//                             }}>
//                                 Great job finishing all {totalMovements} movements!
//                             </p>
//                         </div>
//                     )}
//                 </div>

//                 {/* Movement Info */}
//                 <div style={{ width: '100%', marginTop: '16px' }}>
//                     <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
//                         {currentMovement?.movements.name}
//                     </h2>
//                     <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
//                         {currentMovement?.duration > 0 && (
//                             <div>
//                                 <span style={{ fontWeight: '600' }}>Duration:</span>{' '}
//                                 <span>{currentMovement.duration}s</span>
//                             </div>
//                         )}
//                         {currentMovement?.rest_after > 0 && (
//                             <div>
//                                 <span style={{ fontWeight: '600' }}>Rest After:</span>{' '}
//                                 <span>{currentMovement.rest_after}s</span>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Controls */}
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
//                             background: isFirst ? '#e0e0e0' : '#b40200',
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
//                                 background: '#b40200',
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
//                             background: isLast ? '#e0e0e0' : '#b40200',
//                             color: isLast ? '#999' : 'white',
//                             opacity: isLast ? 0.6 : 1
//                         }}
//                     >
//                         Next →
//                     </button>
//                 </div>

//                 {/* Action Buttons */}
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
//                             background: '#b40200',
//                             color: 'white'
//                         }}
//                     >
//                         Video Finished - Start Rest Period
//                     </button>
//                 )}

//                 {isLast && !workoutComplete && (
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
//                             background: '#b40200',
//                             color: 'white'
//                         }}
//                     >
//                         Complete Workout
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };

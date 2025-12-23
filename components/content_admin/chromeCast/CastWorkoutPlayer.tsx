// CastWorkoutPlayer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChromecastContext } from '@/lib/context/ChromecastContext';
import './cast-workout.css';

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

interface CastWorkoutPlayerProps {
    workout: WorkoutData;
    currentIndex: number;
    onIndexChange: (index: number) => void;
    onComplete: () => void;
    onDisconnect: () => void;
}

export const CastWorkoutPlayer: React.FC<CastWorkoutPlayerProps> = ({
    workout,
    currentIndex,
    onIndexChange,
    onComplete,
    onDisconnect,
}) => {
    const {
        isConnected,
        loadMedia,
        stopCasting,
        deviceName,
        playerState,
        currentTime,
        duration,
        togglePlayPause,
        isPlaying,
        pause, // ADDED: Get the pause function from context
    } = useChromecastContext();

    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRef = useRef<any>(null);
    const mediaListenerRef = useRef<any>(null);
    const currentIndexRef = useRef(currentIndex);
    const isLoadingRef = useRef(false);
    const videoEndCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const hasHandledEndRef = useRef(false);
    const lastKnownTimeRef = useRef(0);
    const stuckCountRef = useRef(0);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        if (!isConnected) {
            console.log(' Cast disconnected in CastWorkoutPlayer');
            const timeout = setTimeout(() => {
                if (!isConnected) {
                    console.log(' Confirmed disconnect, calling onDisconnect');
                    onDisconnect();
                }
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [isConnected, onDisconnect]);

    const currentMovement = workout.workout_movements[currentIndex];

    useEffect(() => {
        console.log(' State Update:', {
            isLoading,
            isResting,
            isVideoPlaying,
            playerState,
            currentIndex,
            isLoadingRef: isLoadingRef.current,
            hasHandledEnd: hasHandledEndRef.current,
        });
    }, [isLoading, isResting, isVideoPlaying, playerState, currentIndex]);

    // NEW: Function to pause/stop the current media
    const pauseCurrentMedia = () => {
        try {
            console.log(' Attempting to pause media on receiver');
            console.log(' Current state - isPlaying:', isPlaying, 'playerState:', playerState);
            console.log(' mediaRef.current exists:', !!mediaRef.current);
            
            // Method 1: Use context's pause function (most reliable)
            if (isPlaying || playerState === 'PLAYING') {
                console.log('🎮 Using context pause() - video is playing');
                pause();
            }
            
            // Method 2: Direct media control as backup
            if (mediaRef.current) {
                try {
                    const pauseRequest = new (window as any).chrome.cast.media.PauseRequest();
                    mediaRef.current.pause(pauseRequest);
                    console.log('✅ Direct pause command sent via mediaRef');
                } catch (err) {
                    console.log('⚠️ Direct pause failed:', err);
                }
            }
            
            console.log('✅ Pause command(s) sent to receiver');
        } catch (error) {
            console.error('❌ Error pausing media:', error);
        }
    };

    const handleVideoEnd = () => {
        if (hasHandledEndRef.current) {
            console.log(' handleVideoEnd already called, ignoring duplicate');
            return;
        }

        hasHandledEndRef.current = true;

        const currentIdx = currentIndexRef.current;
        const currentMov = workout.workout_movements[currentIdx];

        console.log('=== handleVideoEnd called ===');
        console.log('Current index:', currentIdx);
        console.log('Current movement:', currentMov?.movements.name);

        if (!currentMov) {
            console.log('No current movement');
            return;
        }

        // ADDED: Pause the video on receiver before starting rest
        pauseCurrentMedia();

        const restSeconds = currentMov.rest_after;
        console.log('Rest seconds:', restSeconds);

        // Check last video
        if (currentIdx >= workout.workout_movements.length - 1) {
            console.log(' Last video completed - calling onComplete');
            onComplete();
            return;
        }

        if (restSeconds <= 0) {
            console.log(' No rest, moving to next immediately');
            onIndexChange(currentIdx + 1);
            return;
        }

        console.log(' Starting rest period:', restSeconds);
        startRestPeriod(restSeconds);
    };

    // to find video end
    const startVideoEndPolling = (media: any, expectedDuration: number) => {
        console.log(' Starting video end polling (duration:', expectedDuration, 's)');

        if (videoEndCheckIntervalRef.current) {
            clearInterval(videoEndCheckIntervalRef.current);
        }

        lastKnownTimeRef.current = 0;
        stuckCountRef.current = 0;
        hasHandledEndRef.current = false;

        videoEndCheckIntervalRef.current = setInterval(() => {
            if (!mediaRef.current || hasHandledEndRef.current) {
                return;
            }

            try {
                const playerState = mediaRef.current.playerState;
                const idleReason = mediaRef.current.idleReason;
                const currentTime = mediaRef.current.getEstimatedTime
                    ? mediaRef.current.getEstimatedTime()
                    : 0;

                console.log(
                    ' Poll check - State:',
                    playerState,
                    'Time:',
                    currentTime.toFixed(1),
                    's/',
                    expectedDuration,
                    's',
                    'Idle:',
                    idleReason,
                );

                if (playerState === 'IDLE' && idleReason === 'FINISHED') {
                    console.log(' Method 1: Detected IDLE + FINISHED');
                    clearInterval(videoEndCheckIntervalRef.current!);
                    videoEndCheckIntervalRef.current = null;
                    handleVideoEnd();
                    return;
                }

                if (expectedDuration > 0 && currentTime >= expectedDuration - 1) {
                    console.log(' Method 2: Video time reached duration');
                    clearInterval(videoEndCheckIntervalRef.current!);
                    videoEndCheckIntervalRef.current = null;
                    handleVideoEnd();
                    return;
                }

                if (currentTime > 0 && Math.abs(currentTime - lastKnownTimeRef.current) < 0.1) {
                    stuckCountRef.current++;
                    console.log(
                        ' Video time stuck at',
                        currentTime.toFixed(1),
                        's - stuck count:',
                        stuckCountRef.current,
                    );

                    if (stuckCountRef.current >= 3 && currentTime >= expectedDuration * 0.9) {
                        console.log(' Method 3: Video stuck near end, considering finished');
                        clearInterval(videoEndCheckIntervalRef.current!);
                        videoEndCheckIntervalRef.current = null;
                        handleVideoEnd();
                        return;
                    }
                } else {
                    stuckCountRef.current = 0;
                }

                lastKnownTimeRef.current = currentTime;
            } catch (e) {
                console.log('Error in polling:', e);
            }
        }, 2000);
    };

    const loadVideo = async (index: number) => {
        const movement = workout.workout_movements[index];
        if (!movement?.movements.video_id || !isConnected) {
            console.log('Cannot load video - invalid movement or not connected');
            return;
        }

        if (isLoadingRef.current) {
            console.log('Already loading a video, skipping');
            return;
        }

        isLoadingRef.current = true;
        setIsLoading(true);
        setIsVideoPlaying(false);
        hasHandledEndRef.current = false;
        stuckCountRef.current = 0;
        lastKnownTimeRef.current = 0;

        const videoId = movement.movements.video_id;

        console.log(' Loading video:', movement.movements.name, 'Index:', index);

        if (mediaListenerRef.current && mediaRef.current) {
            try {
                mediaRef.current.removeUpdateListener(mediaListenerRef.current);
                mediaListenerRef.current = null;
            } catch (e) {
                console.log('Could not remove old listener:', e);
            }
        }

        if (videoEndCheckIntervalRef.current) {
            clearInterval(videoEndCheckIntervalRef.current);
            videoEndCheckIntervalRef.current = null;
        }

        try {
            const media = await loadMedia({
                videoId,
                title: movement.movements.name,
                thumbnailUrl: movement.movements.thumbnail_url,
                duration: movement.duration,
            });

            console.log(' Media loaded successfully');
            mediaRef.current = media;
            setIsVideoPlaying(true);
            setIsLoading(false);
            isLoadingRef.current = false;

            mediaListenerRef.current = (isAlive: boolean) => {
                if (!isAlive || hasHandledEndRef.current) return;

                const playerState = media.playerState;
                const idleReason = media.idleReason;

                console.log(
                    'Media listener fired - State:',
                    playerState,
                    'Idle:',
                    idleReason,
                    'IsAlive:',
                    isAlive,
                );

                if (playerState === 'IDLE' && idleReason === 'FINISHED') {
                    console.log(' Video finished naturally - triggering handleVideoEnd');
                    setTimeout(() => {
                        handleVideoEnd();
                    }, 100);
                } else if (playerState === 'IDLE' && idleReason === 'ERROR') {
                    console.error(' Media playback error');
                    setIsVideoPlaying(false);
                }

                const isPlaying = playerState === 'PLAYING' || playerState === 'BUFFERING';
                setIsVideoPlaying(isPlaying);

                if (isPlaying) {
                    console.log(' Video is playing');
                }
            };

            media.addUpdateListener(mediaListenerRef.current);
            console.log(' Media listener attached successfully');

            startVideoEndPolling(media, movement.duration);
        } catch (error) {
            console.error(' Failed to load media:', error);
            setIsVideoPlaying(false);
            setIsLoading(false);
            isLoadingRef.current = false;
            hasHandledEndRef.current = false;
            alert('Failed to load video. Please try again or skip to next video.');
        }
    };

    useEffect(() => {
        if (!isConnected) return;

        console.log(' Index changed to:', currentIndex);
        loadVideo(currentIndex);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (videoEndCheckIntervalRef.current) {
                clearInterval(videoEndCheckIntervalRef.current);
                videoEndCheckIntervalRef.current = null;
            }
        };
    }, [currentIndex, isConnected]);

    const startRestPeriod = (restSeconds: number) => {
        console.log(' Starting rest period:', restSeconds, 'seconds');
        
        // ADDED: Pause the video first
        pauseCurrentMedia();
        
        // ADDED: Clear video end polling during rest
        if (videoEndCheckIntervalRef.current) {
            clearInterval(videoEndCheckIntervalRef.current);
            videoEndCheckIntervalRef.current = null;
            console.log(' Stopped video end polling during rest');
        }
        
        setIsResting(true);
        setRestTimer(restSeconds);
        setIsVideoPlaying(false); // ADDED: Update video playing state

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        let remaining = restSeconds;

        timerRef.current = setInterval(() => {
            remaining--;
            setRestTimer(remaining);

            if (remaining <= 0) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setIsResting(false);
                const nextIdx = currentIndexRef.current + 1;
                console.log(' Rest complete, moving to index:', nextIdx);
                onIndexChange(nextIdx);
            }
        }, 1000);
    };

    const skipRest = () => {
        console.log(' Skip rest button clicked');

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsResting(false);
        setRestTimer(0);
        setIsLoading(false);
        isLoadingRef.current = false;
        hasHandledEndRef.current = false;
        stuckCountRef.current = 0;
        lastKnownTimeRef.current = 0;

        const nextIdx = currentIndex + 1;
        if (nextIdx < workout.workout_movements.length) {
            console.log(' Skip rest - moving to index:', nextIdx);
            onIndexChange(nextIdx);
        }
    };

    const handleDisconnect = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (videoEndCheckIntervalRef.current) {
            clearInterval(videoEndCheckIntervalRef.current);
            videoEndCheckIntervalRef.current = null;
        }
        if (mediaListenerRef.current && mediaRef.current) {
            try {
                mediaRef.current.removeUpdateListener(mediaListenerRef.current);
            } catch (e) {
                console.log('Error removing listener:', e);
            }
        }
        stopCasting();
    };

    const handleManualNext = () => {
        if (isLoading) {
            console.log('Still loading, cannot navigate');
            return;
        }

        console.log(' Manual next clicked');

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (videoEndCheckIntervalRef.current) {
            clearInterval(videoEndCheckIntervalRef.current);
            videoEndCheckIntervalRef.current = null;
        }

        setIsResting(false);
        setRestTimer(0);
        setIsLoading(false);
        isLoadingRef.current = false;
        hasHandledEndRef.current = false;

        if (currentIndex < workout.workout_movements.length - 1) {
            console.log(' Manual next to:', currentIndex + 1);
            onIndexChange(currentIndex + 1);
        }
    };

    const handleManualPrevious = () => {
        if (isLoading) {
            console.log('Still loading, cannot navigate');
            return;
        }

        console.log(' Manual previous clicked');

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (videoEndCheckIntervalRef.current) {
            clearInterval(videoEndCheckIntervalRef.current);
            videoEndCheckIntervalRef.current = null;
        }

        setIsResting(false);
        setRestTimer(0);
        setIsLoading(false);
        isLoadingRef.current = false;
        hasHandledEndRef.current = false;

        if (currentIndex > 0) {
            console.log(' Manual previous to:', currentIndex - 1);
            onIndexChange(currentIndex - 1);
        }
    };

    if (!isConnected) {
        return null;
    }

    const nextMovement =
        currentIndex < workout.workout_movements.length - 1
            ? workout.workout_movements[currentIndex + 1]
            : null;

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === workout.workout_movements.length - 1;

    return (
        <div className="cast-workout-container">
            {/* Cast Status Display */}
            <div className="cast-status-header">
                <div className="cast-status-info">
                    <div className="cast-status-label">
                        🎥 Casting to {deviceName || 'Chromecast'}
                    </div>
                    <div className="cast-status-title">{currentMovement.movements.name}</div>
                    {isLoading && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            ⏳ Loading...
                        </div>
                    )}
                    {isVideoPlaying && !isLoading && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            ▶️ Playing
                        </div>
                    )}
                </div>
                <button onClick={handleDisconnect} className="cast-disconnect-btn">
                    Disconnect
                </button>
            </div>

            {!isResting && (
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                    }}
                >
                    {/* Progress Bar */}
                    <div
                        style={{
                            marginBottom: '16px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '12px',
                                marginBottom: '8px',
                                color: '#666',
                            }}
                        >
                            <span>
                                {Math.floor(currentTime / 60)}:
                                {Math.floor(currentTime % 60)
                                    .toString()
                                    .padStart(2, '0')}
                            </span>
                            <span>
                                {Math.floor(duration / 60)}:
                                {Math.floor(duration % 60)
                                    .toString()
                                    .padStart(2, '0')}
                            </span>
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: '6px',
                                background: '#e0e0e0',
                                borderRadius: '3px',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width:
                                        duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                                    height: '100%',
                                    background: '#b40200',
                                    borderRadius: '3px',
                                    transition: 'width 0.3s linear',
                                }}
                            />
                        </div>
                    </div>

                    {/* Play/Pause Button */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <button
                            onClick={togglePlayPause}
                            disabled={isLoading}
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: '#b40200',
                                border: 'none',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: 'white',
                                transition: 'transform 0.2s',
                                opacity: isLoading ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) =>
                                !isLoading && (e.currentTarget.style.transform = 'scale(1.1)')
                            }
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {isPlaying ? '⏸' : '▶'}
                        </button>

                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
                            {playerState === 'PLAYING' && '▶️ Playing'}
                            {playerState === 'PAUSED' && '⏸️ Paused'}
                            {playerState === 'BUFFERING' && '⏳ Buffering...'}
                            {playerState === 'IDLE' && '⏹️ Idle'}
                        </div>
                    </div>
                </div>
            )}

            {/* Rest Overlay */}
            {isResting && (
                <div className="cast-rest-overlay">
                    <h2 className="cast-rest-title">Rest Time</h2>
                    <div className="cast-rest-timer">{restTimer}s</div>
                    {nextMovement && (
                        <p className="cast-rest-next">Next: {nextMovement.movements.name}</p>
                    )}
                    <button onClick={skipRest} className="cast-skip-rest-btn">
                        Skip Rest →
                    </button>
                </div>
            )}

            {/* Movement Info */}
            <div className="cast-movement-info">
                <div className="workout-meta">
                    <div className="meta-item">
                        <span className="meta-label">Movement:</span>
                        <span className="meta-value">
                            {currentIndex + 1} of {workout.workout_movements.length}
                        </span>
                    </div>
                    {currentMovement.duration > 0 && (
                        <div className="meta-item">
                            <span className="meta-label">Duration:</span>
                            <span className="meta-value">{currentMovement.duration}s</span>
                        </div>
                    )}
                    {currentMovement.rest_after > 0 && (
                        <div className="meta-item">
                            <span className="meta-label">Rest After:</span>
                            <span className="meta-value">{currentMovement.rest_after}s</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Controls */}
            <div className="cast-controls">
                <button
                    onClick={handleManualPrevious}
                    disabled={isFirst || isLoading}
                    className="cast-control-btn"
                    style={{
                        opacity: isFirst || isLoading ? 0.6 : 1,
                        cursor: isFirst || isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    ← Previous
                </button>

                {!isResting && !isLast && (
                    <button
                        onClick={handleVideoEnd}
                        className="cast-control-btn cast-primary"
                        disabled={isLoading}
                        style={{
                            opacity: isLoading ? 0.6 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Video Finished - Start Rest
                    </button>
                )}

                {!isResting && isLast && (
                    <button onClick={() => onComplete()} className="cast-control-btn cast-primary">
                        Complete Workout
                    </button>
                )}

                <button
                    onClick={handleManualNext}
                    disabled={isLast || isLoading}
                    className="cast-control-btn"
                    style={{
                        opacity: isLast || isLoading ? 0.6 : 1,
                        cursor: isLast || isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    Next →
                </button>
            </div>

            {/* Progress Bar */}
            <div className="cast-progress-container">
                <div className="cast-progress-bar">
                    <div
                        className="cast-progress-fill"
                        style={{
                            width: `${((currentIndex + 1) / workout.workout_movements.length) * 100}%`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};














































// // CastWorkoutPlayer.tsx
// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import { useChromecastContext } from '@/lib/context/ChromecastContext';
// import './cast-workout.css';

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

// interface CastWorkoutPlayerProps {
//     workout: WorkoutData;
//     currentIndex: number;
//     onIndexChange: (index: number) => void;
//     onComplete: () => void;
//     onDisconnect: () => void;
// }

// export const CastWorkoutPlayer: React.FC<CastWorkoutPlayerProps> = ({
//     workout,
//     currentIndex,
//     onIndexChange,
//     onComplete,
//     onDisconnect,
// }) => {
//     const {
//         isConnected,
//         loadMedia,
//         stopCasting,
//         deviceName,
//         playerState,
//         currentTime,
//         duration,
//         togglePlayPause,
//         isPlaying,
//     } = useChromecastContext();

//     const [isResting, setIsResting] = useState(false);
//     const [restTimer, setRestTimer] = useState(0);
//     const [isVideoPlaying, setIsVideoPlaying] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);

//     const timerRef = useRef<NodeJS.Timeout | null>(null);
//     const mediaRef = useRef<any>(null);
//     const mediaListenerRef = useRef<any>(null);
//     const currentIndexRef = useRef(currentIndex);
//     const isLoadingRef = useRef(false);
//     const videoEndCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

//     const hasHandledEndRef = useRef(false);
//     const lastKnownTimeRef = useRef(0);
//     const stuckCountRef = useRef(0);

//     useEffect(() => {
//         currentIndexRef.current = currentIndex;
//     }, [currentIndex]);

//     useEffect(() => {
//         if (!isConnected) {
//             console.log(' Cast disconnected in CastWorkoutPlayer');
//             const timeout = setTimeout(() => {
//                 if (!isConnected) {
//                     console.log(' Confirmed disconnect, calling onDisconnect');
//                     onDisconnect();
//                 }
//             }, 2000);

//             return () => clearTimeout(timeout);
//         }
//     }, [isConnected, onDisconnect]);

//     const currentMovement = workout.workout_movements[currentIndex];

//     useEffect(() => {
//         console.log(' State Update:', {
//             isLoading,
//             isResting,
//             isVideoPlaying,
//             playerState,
//             currentIndex,
//             isLoadingRef: isLoadingRef.current,
//             hasHandledEnd: hasHandledEndRef.current,
//         });
//     }, [isLoading, isResting, isVideoPlaying, playerState, currentIndex]);

//     const handleVideoEnd = () => {
//         if (hasHandledEndRef.current) {
//             console.log(' handleVideoEnd already called, ignoring duplicate');
//             return;
//         }

//         hasHandledEndRef.current = true;

//         const currentIdx = currentIndexRef.current;
//         const currentMov = workout.workout_movements[currentIdx];

//         console.log('=== handleVideoEnd called ===');
//         console.log('Current index:', currentIdx);
//         console.log('Current movement:', currentMov?.movements.name);

//         if (!currentMov) {
//             console.log('No current movement');
//             return;
//         }

//         const restSeconds = currentMov.rest_after;
//         console.log('Rest seconds:', restSeconds);

//         // Check last video
//         if (currentIdx >= workout.workout_movements.length - 1) {
//             console.log(' Last video completed - calling onComplete');
//             onComplete();
//             return;
//         }

//         if (restSeconds <= 0) {
//             console.log(' No rest, moving to next immediately');
//             onIndexChange(currentIdx + 1);
//             return;
//         }

//         console.log(' Starting rest period:', restSeconds);
//         startRestPeriod(restSeconds);
//     };

//     // to find video end
//     const startVideoEndPolling = (media: any, expectedDuration: number) => {
//         console.log(' Starting video end polling (duration:', expectedDuration, 's)');

//         if (videoEndCheckIntervalRef.current) {
//             clearInterval(videoEndCheckIntervalRef.current);
//         }

//         lastKnownTimeRef.current = 0;
//         stuckCountRef.current = 0;
//         hasHandledEndRef.current = false;

//         videoEndCheckIntervalRef.current = setInterval(() => {
//             if (!mediaRef.current || hasHandledEndRef.current) {
//                 return;
//             }

//             try {
//                 const playerState = mediaRef.current.playerState;
//                 const idleReason = mediaRef.current.idleReason;
//                 const currentTime = mediaRef.current.getEstimatedTime
//                     ? mediaRef.current.getEstimatedTime()
//                     : 0;

//                 console.log(
//                     ' Poll check - State:',
//                     playerState,
//                     'Time:',
//                     currentTime.toFixed(1),
//                     's/',
//                     expectedDuration,
//                     's',
//                     'Idle:',
//                     idleReason,
//                 );

//                 if (playerState === 'IDLE' && idleReason === 'FINISHED') {
//                     console.log(' Method 1: Detected IDLE + FINISHED');
//                     clearInterval(videoEndCheckIntervalRef.current!);
//                     videoEndCheckIntervalRef.current = null;
//                     handleVideoEnd();
//                     return;
//                 }

//                 if (expectedDuration > 0 && currentTime >= expectedDuration - 1) {
//                     console.log(' Method 2: Video time reached duration');
//                     clearInterval(videoEndCheckIntervalRef.current!);
//                     videoEndCheckIntervalRef.current = null;
//                     handleVideoEnd();
//                     return;
//                 }

//                 if (currentTime > 0 && Math.abs(currentTime - lastKnownTimeRef.current) < 0.1) {
//                     stuckCountRef.current++;
//                     console.log(
//                         ' Video time stuck at',
//                         currentTime.toFixed(1),
//                         's - stuck count:',
//                         stuckCountRef.current,
//                     );

//                     if (stuckCountRef.current >= 3 && currentTime >= expectedDuration * 0.9) {
//                         console.log(' Method 3: Video stuck near end, considering finished');
//                         clearInterval(videoEndCheckIntervalRef.current!);
//                         videoEndCheckIntervalRef.current = null;
//                         handleVideoEnd();
//                         return;
//                     }
//                 } else {
//                     stuckCountRef.current = 0;
//                 }

//                 lastKnownTimeRef.current = currentTime;
//             } catch (e) {
//                 console.log('Error in polling:', e);
//             }
//         }, 2000);
//     };

//     const loadVideo = async (index: number) => {
//         const movement = workout.workout_movements[index];
//         if (!movement?.movements.video_id || !isConnected) {
//             console.log('Cannot load video - invalid movement or not connected');
//             return;
//         }

//         if (isLoadingRef.current) {
//             console.log('Already loading a video, skipping');
//             return;
//         }

//         isLoadingRef.current = true;
//         setIsLoading(true);
//         setIsVideoPlaying(false);
//         hasHandledEndRef.current = false;
//         stuckCountRef.current = 0;
//         lastKnownTimeRef.current = 0;

//         const videoId = movement.movements.video_id;

//         console.log(' Loading video:', movement.movements.name, 'Index:', index);

//         if (mediaListenerRef.current && mediaRef.current) {
//             try {
//                 mediaRef.current.removeUpdateListener(mediaListenerRef.current);
//                 mediaListenerRef.current = null;
//             } catch (e) {
//                 console.log('Could not remove old listener:', e);
//             }
//         }

//         if (videoEndCheckIntervalRef.current) {
//             clearInterval(videoEndCheckIntervalRef.current);
//             videoEndCheckIntervalRef.current = null;
//         }

//         try {
//             const media = await loadMedia({
//                 videoId,
//                 title: movement.movements.name,
//                 thumbnailUrl: movement.movements.thumbnail_url,
//                 duration: movement.duration,
//             });

//             console.log(' Media loaded successfully');
//             mediaRef.current = media;
//             setIsVideoPlaying(true);
//             setIsLoading(false);
//             isLoadingRef.current = false;

//             mediaListenerRef.current = (isAlive: boolean) => {
//                 if (!isAlive || hasHandledEndRef.current) return;

//                 const playerState = media.playerState;
//                 const idleReason = media.idleReason;

//                 console.log(
//                     'Media listener fired - State:',
//                     playerState,
//                     'Idle:',
//                     idleReason,
//                     'IsAlive:',
//                     isAlive,
//                 );

//                 if (playerState === 'IDLE' && idleReason === 'FINISHED') {
//                     console.log(' Video finished naturally - triggering handleVideoEnd');
//                     setTimeout(() => {
//                         handleVideoEnd();
//                     }, 100);
//                 } else if (playerState === 'IDLE' && idleReason === 'ERROR') {
//                     console.error(' Media playback error');
//                     setIsVideoPlaying(false);
//                 }

//                 const isPlaying = playerState === 'PLAYING' || playerState === 'BUFFERING';
//                 setIsVideoPlaying(isPlaying);

//                 if (isPlaying) {
//                     console.log(' Video is playing');
//                 }
//             };

//             media.addUpdateListener(mediaListenerRef.current);
//             console.log(' Media listener attached successfully');

//             startVideoEndPolling(media, movement.duration);
//         } catch (error) {
//             console.error(' Failed to load media:', error);
//             setIsVideoPlaying(false);
//             setIsLoading(false);
//             isLoadingRef.current = false;
//             hasHandledEndRef.current = false;
//             alert('Failed to load video. Please try again or skip to next video.');
//         }
//     };

//     useEffect(() => {
//         if (!isConnected) return;

//         console.log(' Index changed to:', currentIndex);
//         loadVideo(currentIndex);

//         return () => {
//             if (timerRef.current) {
//                 clearInterval(timerRef.current);
//                 timerRef.current = null;
//             }
//             if (videoEndCheckIntervalRef.current) {
//                 clearInterval(videoEndCheckIntervalRef.current);
//                 videoEndCheckIntervalRef.current = null;
//             }
//         };
//     }, [currentIndex, isConnected]);

//     const startRestPeriod = (restSeconds: number) => {
//         setIsResting(true);
//         setRestTimer(restSeconds);

//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//         }

//         let remaining = restSeconds;

//         timerRef.current = setInterval(() => {
//             remaining--;
//             setRestTimer(remaining);

//             if (remaining <= 0) {
//                 if (timerRef.current) {
//                     clearInterval(timerRef.current);
//                     timerRef.current = null;
//                 }
//                 setIsResting(false);
//                 const nextIdx = currentIndexRef.current + 1;
//                 console.log(' Rest complete, moving to index:', nextIdx);
//                 onIndexChange(nextIdx);
//             }
//         }, 1000);
//     };

//     const skipRest = () => {
//         console.log(' Skip rest button clicked');

//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }

//         setIsResting(false);
//         setRestTimer(0);
//         setIsLoading(false);
//         isLoadingRef.current = false;
//         hasHandledEndRef.current = false;
//         stuckCountRef.current = 0;
//         lastKnownTimeRef.current = 0;

//         const nextIdx = currentIndex + 1;
//         if (nextIdx < workout.workout_movements.length) {
//             console.log(' Skip rest - moving to index:', nextIdx);
//             onIndexChange(nextIdx);
//         }
//     };

//     const handleDisconnect = () => {
//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }
//         if (videoEndCheckIntervalRef.current) {
//             clearInterval(videoEndCheckIntervalRef.current);
//             videoEndCheckIntervalRef.current = null;
//         }
//         if (mediaListenerRef.current && mediaRef.current) {
//             try {
//                 mediaRef.current.removeUpdateListener(mediaListenerRef.current);
//             } catch (e) {
//                 console.log('Error removing listener:', e);
//             }
//         }
//         stopCasting();
//     };

//     const handleManualNext = () => {
//         if (isLoading) {
//             console.log('Still loading, cannot navigate');
//             return;
//         }

//         console.log(' Manual next clicked');

//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }
//         if (videoEndCheckIntervalRef.current) {
//             clearInterval(videoEndCheckIntervalRef.current);
//             videoEndCheckIntervalRef.current = null;
//         }

//         setIsResting(false);
//         setRestTimer(0);
//         setIsLoading(false);
//         isLoadingRef.current = false;
//         hasHandledEndRef.current = false;

//         if (currentIndex < workout.workout_movements.length - 1) {
//             console.log(' Manual next to:', currentIndex + 1);
//             onIndexChange(currentIndex + 1);
//         }
//     };

//     const handleManualPrevious = () => {
//         if (isLoading) {
//             console.log('Still loading, cannot navigate');
//             return;
//         }

//         console.log(' Manual previous clicked');

//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }
//         if (videoEndCheckIntervalRef.current) {
//             clearInterval(videoEndCheckIntervalRef.current);
//             videoEndCheckIntervalRef.current = null;
//         }

//         setIsResting(false);
//         setRestTimer(0);
//         setIsLoading(false);
//         isLoadingRef.current = false;
//         hasHandledEndRef.current = false;

//         if (currentIndex > 0) {
//             console.log(' Manual previous to:', currentIndex - 1);
//             onIndexChange(currentIndex - 1);
//         }
//     };

//     if (!isConnected) {
//         return null;
//     }

//     const nextMovement =
//         currentIndex < workout.workout_movements.length - 1
//             ? workout.workout_movements[currentIndex + 1]
//             : null;

//     const isFirst = currentIndex === 0;
//     const isLast = currentIndex === workout.workout_movements.length - 1;

//     return (
//         <div className="cast-workout-container">
//             {/* Cast Status Display */}
//             <div className="cast-status-header">
//                 <div className="cast-status-info">
//                     <div className="cast-status-label">
//                         🎥 Casting to {deviceName || 'Chromecast'}
//                     </div>
//                     <div className="cast-status-title">{currentMovement.movements.name}</div>
//                     {isLoading && (
//                         <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
//                             ⏳ Loading...
//                         </div>
//                     )}
//                     {isVideoPlaying && !isLoading && (
//                         <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
//                             ▶️ Playing
//                         </div>
//                     )}
//                 </div>
//                 <button onClick={handleDisconnect} className="cast-disconnect-btn">
//                     Disconnect
//                 </button>
//             </div>

//             {!isResting && (
//                 <div
//                     style={{
//                         background: 'rgba(255, 255, 255, 0.1)',
//                         borderRadius: '12px',
//                         padding: '20px',
//                         marginBottom: '20px',
//                     }}
//                 >
//                     {/* Progress Bar */}
//                     <div
//                         style={{
//                             marginBottom: '16px',
//                         }}
//                     >
//                         <div
//                             style={{
//                                 display: 'flex',
//                                 justifyContent: 'space-between',
//                                 fontSize: '12px',
//                                 marginBottom: '8px',
//                                 color: '#666',
//                             }}
//                         >
//                             <span>
//                                 {Math.floor(currentTime / 60)}:
//                                 {Math.floor(currentTime % 60)
//                                     .toString()
//                                     .padStart(2, '0')}
//                             </span>
//                             <span>
//                                 {Math.floor(duration / 60)}:
//                                 {Math.floor(duration % 60)
//                                     .toString()
//                                     .padStart(2, '0')}
//                             </span>
//                         </div>
//                         <div
//                             style={{
//                                 width: '100%',
//                                 height: '6px',
//                                 background: '#e0e0e0',
//                                 borderRadius: '3px',
//                                 overflow: 'hidden',
//                             }}
//                         >
//                             <div
//                                 style={{
//                                     width:
//                                         duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
//                                     height: '100%',
//                                     background: '#b40200',
//                                     borderRadius: '3px',
//                                     transition: 'width 0.3s linear',
//                                 }}
//                             />
//                         </div>
//                     </div>

//                     {/* Play/Pause Button */}
//                     <div
//                         style={{
//                             display: 'flex',
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             gap: '16px',
//                         }}
//                     >
//                         <button
//                             onClick={togglePlayPause}
//                             disabled={isLoading}
//                             style={{
//                                 width: '56px',
//                                 height: '56px',
//                                 borderRadius: '50%',
//                                 background: '#b40200',
//                                 border: 'none',
//                                 cursor: isLoading ? 'not-allowed' : 'pointer',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 fontSize: '24px',
//                                 color: 'white',
//                                 transition: 'transform 0.2s',
//                                 opacity: isLoading ? 0.5 : 1,
//                             }}
//                             onMouseEnter={(e) =>
//                                 !isLoading && (e.currentTarget.style.transform = 'scale(1.1)')
//                             }
//                             onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
//                         >
//                             {isPlaying ? '⏸' : '▶'}
//                         </button>

//                         <div style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
//                             {playerState === 'PLAYING' && '▶️ Playing'}
//                             {playerState === 'PAUSED' && '⏸️ Paused'}
//                             {playerState === 'BUFFERING' && '⏳ Buffering...'}
//                             {playerState === 'IDLE' && '⏹️ Idle'}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Rest Overlay */}
//             {isResting && (
//                 <div className="cast-rest-overlay">
//                     <h2 className="cast-rest-title">Rest Time</h2>
//                     <div className="cast-rest-timer">{restTimer}s</div>
//                     {nextMovement && (
//                         <p className="cast-rest-next">Next: {nextMovement.movements.name}</p>
//                     )}
//                     <button onClick={skipRest} className="cast-skip-rest-btn">
//                         Skip Rest →
//                     </button>
//                 </div>
//             )}

//             {/* Movement Info */}
//             <div className="cast-movement-info">
//                 <div className="workout-meta">
//                     <div className="meta-item">
//                         <span className="meta-label">Movement:</span>
//                         <span className="meta-value">
//                             {currentIndex + 1} of {workout.workout_movements.length}
//                         </span>
//                     </div>
//                     {currentMovement.duration > 0 && (
//                         <div className="meta-item">
//                             <span className="meta-label">Duration:</span>
//                             <span className="meta-value">{currentMovement.duration}s</span>
//                         </div>
//                     )}
//                     {currentMovement.rest_after > 0 && (
//                         <div className="meta-item">
//                             <span className="meta-label">Rest After:</span>
//                             <span className="meta-value">{currentMovement.rest_after}s</span>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Manual Controls */}
//             <div className="cast-controls">
//                 <button
//                     onClick={handleManualPrevious}
//                     disabled={isFirst || isLoading}
//                     className="cast-control-btn"
//                     style={{
//                         opacity: isFirst || isLoading ? 0.6 : 1,
//                         cursor: isFirst || isLoading ? 'not-allowed' : 'pointer',
//                     }}
//                 >
//                     ← Previous
//                 </button>

//                 {!isResting && !isLast && (
//                     <button
//                         onClick={handleVideoEnd}
//                         className="cast-control-btn cast-primary"
//                         disabled={isLoading}
//                         style={{
//                             opacity: isLoading ? 0.6 : 1,
//                             cursor: isLoading ? 'not-allowed' : 'pointer',
//                         }}
//                     >
//                         Video Finished - Start Rest
//                     </button>
//                 )}

//                 {!isResting && isLast && (
//                     <button onClick={() => onComplete()} className="cast-control-btn cast-primary">
//                         Complete Workout
//                     </button>
//                 )}

//                 <button
//                     onClick={handleManualNext}
//                     disabled={isLast || isLoading}
//                     className="cast-control-btn"
//                     style={{
//                         opacity: isLast || isLoading ? 0.6 : 1,
//                         cursor: isLast || isLoading ? 'not-allowed' : 'pointer',
//                     }}
//                 >
//                     Next →
//                 </button>
//             </div>

//             {/* Progress Bar */}
//             <div className="cast-progress-container">
//                 <div className="cast-progress-bar">
//                     <div
//                         className="cast-progress-fill"
//                         style={{
//                             width: `${((currentIndex + 1) / workout.workout_movements.length) * 100}%`,
//                         }}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

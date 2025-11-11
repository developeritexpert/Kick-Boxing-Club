import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
    interface Window {
        chrome: any;
        __onGCastApiAvailable: (isAvailable: boolean) => void;
    }
}

interface CastMedia {
    videoId: string;
    title: string;
    thumbnailUrl?: string;
    duration?: number;
}

interface CastMediaObject {
    playerState?: string;
    idleReason?: string;
    currentTime?: number;
    media?: {
        duration?: number;
    };
    addUpdateListener: (listener: (alive: boolean) => void) => void;
    removeUpdateListener: (listener: (alive: boolean) => void) => void;
    play: (request?: any) => void;
    pause: (request?: any) => void;
    seek: (request?: any) => void;
    getEstimatedTime: () => number;
}

export const useChromecast = () => {
    const [isCastAvailable, setIsCastAvailable] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deviceName, setDeviceName] = useState<string>('');
    const [playerState, setPlayerState] = useState<string>('IDLE');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const castSessionRef = useRef<any>(null);
    const mediaRef = useRef<any>(null);
    const sessionListenerRef = useRef<any>(null);
    const mediaListenerRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const isConnectingRef = useRef(false);
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const initializeCastApi = () => {
            if (isInitializedRef.current) {
                console.log('Cast API already initialized');
                return;
            }

            const cast = window.chrome?.cast;
            if (!cast) {
                console.log('Cast API not yet available');
                return;
            }

            console.log('Initializing Cast API...');

            const sessionRequest = new cast.SessionRequest(
                cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            );

            const apiConfig = new cast.ApiConfig(
                sessionRequest,
                (session: any) => {
                    console.log(' Cast session started via listener');
                    handleSessionConnected(session);
                },
                (status: string) => {
                    console.log(' Cast receiver status changed:', status);

                    if (
                        (status === 'disconnected' || status === 'stopped') &&
                        !isConnectingRef.current
                    ) {
                        console.log('Session disconnected via status');
                        handleSessionDisconnected();
                    }
                },
            );

            try {
                cast.initialize(
                    apiConfig,
                    () => {
                        console.log(' Cast API initialized successfully');
                        isInitializedRef.current = true;
                        setIsCastAvailable(true);

                        try {
                            const existingSession =
                                cast.framework?.CastContext?.getInstance()?.getCurrentSession();
                            if (existingSession) {
                                const sessionState = existingSession.getSessionState?.();
                                console.log('Found existing session, state:', sessionState);

                                if (
                                    sessionState === 'SESSION_STARTED' ||
                                    sessionState === cast.SessionState?.SESSION_STARTED
                                ) {
                                    console.log('Restoring existing session');
                                    handleSessionConnected(existingSession);
                                }
                            }
                        } catch (e) {
                            console.log('No existing session found');
                        }
                    },
                    (error: any) => {
                        console.error(' Cast API initialization error:', error);
                        setIsCastAvailable(false);
                    },
                );
            } catch (e) {
                console.error(' Exception during Cast initialization:', e);
            }
        };

        const attemptInit = () => {
            if (window.chrome?.cast?.isAvailable) {
                initializeCastApi();
            }
        };

        attemptInit();

        window.__onGCastApiAvailable = (isAvailable) => {
            console.log('Cast API availability callback:', isAvailable);
            if (isAvailable) {
                setTimeout(initializeCastApi, 100);
            }
        };

        const timeout1 = setTimeout(attemptInit, 1000);
        const timeout2 = setTimeout(attemptInit, 3000);

        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
            }
            cleanupListeners();
        };
    }, []);

    const cleanupListeners = () => {
        if (timeUpdateIntervalRef.current) {
            clearInterval(timeUpdateIntervalRef.current);
            timeUpdateIntervalRef.current = null;
        }

        if (mediaListenerRef.current && mediaRef.current) {
            try {
                mediaRef.current.removeUpdateListener(mediaListenerRef.current);
            } catch (e) {
                console.log('Cleanup media listener error:', e);
            }
        }

        if (sessionListenerRef.current && castSessionRef.current) {
            try {
                castSessionRef.current.removeUpdateListener(sessionListenerRef.current);
            } catch (e) {
                console.log('Cleanup session listener error:', e);
            }
        }
    };

    const handleSessionConnected = (session: any) => {
        if (!session) {
            console.log(' No session provided');
            isConnectingRef.current = false;
            return;
        }

        isConnectingRef.current = true;
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
        }

        let friendlyName = 'Chromecast Device';

        try {
            friendlyName =
                session.receiver?.friendlyName ||
                session.getCastDevice?.()?.friendlyName ||
                session.receiver?.volume?.name ||
                session.getSessionObj?.()?.receiver?.friendlyName ||
                'Chromecast Device';

            console.log(' Device name extracted:', friendlyName);
        } catch (e) {
            console.log('Could not extract device name:', e);
        }

        console.log(' Connecting to session:', friendlyName);
        castSessionRef.current = session;
        setDeviceName(friendlyName);

        if (sessionListenerRef.current) {
            try {
                session.removeUpdateListener(sessionListenerRef.current);
            } catch (e) {
                console.log('Could not remove old session listener:', e);
            }
        }

        sessionListenerRef.current = (isAlive: boolean) => {
            console.log(' Session update - isAlive:', isAlive);

            if (!isAlive && !isConnectingRef.current) {
                console.log('Session died, disconnecting');
                handleSessionDisconnected();
            }
        };

        try {
            session.addUpdateListener(sessionListenerRef.current);
            console.log(' Session listener attached');
        } catch (e) {
            console.log('Could not add session listener:', e);
        }

        try {
            const media = session.getMediaSession?.();
            if (media) {
                console.log('Found existing media in session');
                setupMediaListeners(media);
            }
        } catch (e) {
            console.log('No existing media');
        }

        connectionTimeoutRef.current = setTimeout(() => {
            console.log(' Session stable, setting isConnected = true');
            setIsConnected(true);
            isConnectingRef.current = false;
        }, 500);
    };

    const handleSessionDisconnected = () => {
        console.log(' Session disconnected, cleaning up');

        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
        }

        isConnectingRef.current = false;
        cleanupListeners();

        setIsConnected(false);
        setDeviceName('');
        setPlayerState('IDLE');
        setCurrentTime(0);
        setDuration(0);

        castSessionRef.current = null;
        mediaRef.current = null;
        sessionListenerRef.current = null;
        mediaListenerRef.current = null;
    };

    const setupMediaListeners = (media: CastMediaObject) => {
        mediaRef.current = media;

        if (mediaListenerRef.current) {
            try {
                media.removeUpdateListener(mediaListenerRef.current);
            } catch (e) {}
        }

        mediaListenerRef.current = (isAlive: boolean) => {
            if (!isAlive) return;

            const state = media.playerState || 'IDLE';
            const idleReason = media.idleReason;

            console.log(' Media state update:', state, 'Idle reason:', idleReason);
            setPlayerState(state);

            if (state === 'IDLE' && idleReason === 'FINISHED') {
                console.log(' Video finished');
            } else if (state === 'IDLE' && idleReason === 'ERROR') {
                console.error(' Media playback error');
            }

            if (media.media?.duration) {
                setDuration(media.media.duration);
            }
        };

        media.addUpdateListener(mediaListenerRef.current);

        if (timeUpdateIntervalRef.current) {
            clearInterval(timeUpdateIntervalRef.current);
        }

        timeUpdateIntervalRef.current = setInterval(() => {
            if (mediaRef.current?.getEstimatedTime) {
                const time = mediaRef.current.getEstimatedTime();
                setCurrentTime(time);
            }
        }, 1000);
    };

    const requestCastSession = useCallback(async () => {
        if (!window.chrome?.cast) {
            console.error(' Cast API not available');
            alert(
                'Chromecast is not available. Please use Chrome browser and ensure the Cast extension is enabled.',
            );
            return false;
        }

        if (castSessionRef.current) {
            console.log('Already connected to a session');
            return true;
        }

        try {
            setIsLoading(true);
            isConnectingRef.current = true;
            console.log(' Requesting cast session...');

            await window.chrome.cast.requestSession(
                (session: any) => {
                    console.log(' Session created:', session);
                    handleSessionConnected(session);
                    setIsLoading(false);
                },
                (error: any) => {
                    console.log(' Error requesting session:', error);
                    setIsLoading(false);
                    isConnectingRef.current = false;

                    if (error.code === 'cancel') {
                        console.log('User cancelled cast request');
                    } else {
                        alert(
                            'Could not connect to Chromecast. Make sure:\n1. Your device is on the same network\n2. Chrome browser is up to date\n3. Chromecast is powered on',
                        );
                    }
                },
            );
            return true;
        } catch (error) {
            console.error(' Request session exception:', error);
            setIsLoading(false);
            isConnectingRef.current = false;
            return false;
        }
    }, []);

    const loadMedia = useCallback((media: CastMedia): Promise<CastMediaObject> => {
        return new Promise((resolve, reject) => {
            const session = castSessionRef.current;
            if (!session) {
                console.error(' No active cast session');
                reject(new Error('No active session'));
                return;
            }

            console.log(' Loading media:', media.title);

            const dashUrl = `https://videodelivery.net/${media.videoId}/manifest/video.mpd`;
            console.log(' DASH URL:', dashUrl);

            const mediaInfo = new window.chrome.cast.media.MediaInfo(
                dashUrl,
                'application/dash+xml',
            );

            mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
            mediaInfo.metadata.title = media.title;
            mediaInfo.metadata.subtitle = `Duration: ${media.duration || 0}s`;

            if (media.thumbnailUrl) {
                mediaInfo.metadata.images = [new window.chrome.cast.Image(media.thumbnailUrl)];
            }

            mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;

            const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
            request.autoplay = true;
            request.currentTime = 0;

            session.loadMedia(
                request,
                (mediaObj: CastMediaObject) => {
                    console.log(' Media loaded successfully');
                    setupMediaListeners(mediaObj);
                    resolve(mediaObj);
                },
                (error: any) => {
                    console.error('Error loading media:', error);
                    console.error('Error code:', error.code);
                    console.error('Error description:', error.description);
                    reject(error);
                },
            );
        });
    }, []);

    const stopCasting = useCallback(() => {
        const session = castSessionRef.current;
        if (!session) {
            console.log('No session to stop');
            handleSessionDisconnected();
            return;
        }

        console.log('Stopping cast session...');

        try {
            session.stop(
                () => {
                    console.log('Session stopped successfully');
                    handleSessionDisconnected();
                },
                (error: any) => {
                    console.log('Session stop error (forcing cleanup):', error);
                    handleSessionDisconnected();
                },
            );
        } catch (e) {
            console.log('Exception stopping session:', e);
            handleSessionDisconnected();
        }
    }, []);

    const play = useCallback(() => {
        const media = mediaRef.current;
        if (!media) {
            console.log('No media to play');
            return;
        }

        try {
            media.play(new window.chrome.cast.media.PlayRequest());
            console.log('Playing');
        } catch (e) {
            console.error('Error playing:', e);
        }
    }, []);

    const pause = useCallback(() => {
        const media = mediaRef.current;
        if (!media) {
            console.log('No media to pause');
            return;
        }

        try {
            media.pause(new window.chrome.cast.media.PauseRequest());
            console.log('Paused');
        } catch (e) {
            console.error('Error pausing:', e);
        }
    }, []);

    const togglePlayPause = useCallback(() => {
        if (playerState === 'PLAYING') {
            pause();
        } else {
            play();
        }
    }, [playerState, play, pause]);

    const seek = useCallback((timeInSeconds: number) => {
        const media = mediaRef.current;
        if (!media) {
            console.log('No media to seek');
            return;
        }

        try {
            const request = new window.chrome.cast.media.SeekRequest();
            request.currentTime = timeInSeconds;
            media.seek(request);
            console.log(` Seeked to ${timeInSeconds}s`);
        } catch (e) {
            console.error('Error seeking:', e);
        }
    }, []);

    return {
        isCastAvailable,
        isConnected,
        isLoading,
        deviceName,
        playerState,
        currentTime,
        duration,
        requestCastSession,
        loadMedia,
        stopCasting,
        play,
        pause,
        togglePlayPause,
        seek,
        currentMedia: mediaRef.current,
        isPlaying: playerState === 'PLAYING',
        isPaused: playerState === 'PAUSED',
        isBuffering: playerState === 'BUFFERING',
    };
};

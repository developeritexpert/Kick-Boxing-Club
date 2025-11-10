// lib/context/ChromecastContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useChromecast } from '@/lib/hooks/useChromecast';

interface CastMedia {
    videoId: string;
    title: string;
    thumbnailUrl?: string;
    duration?: number;
}

interface ChromecastContextType {
    isCastAvailable: boolean;
    isConnected: boolean;
    isLoading: boolean;
    deviceName: string;
    playerState: string;
    currentTime: number;
    duration: number;
    requestCastSession: () => Promise<boolean>;
    loadMedia: (media: CastMedia) => Promise<any>;
    stopCasting: () => void;
    play: () => void;
    pause: () => void;
    togglePlayPause: () => void;
    seek: (timeInSeconds: number) => void;
    currentMedia: any;
    isPlaying: boolean;
    isPaused: boolean;
    isBuffering: boolean;
}

const ChromecastContext = createContext<ChromecastContextType | undefined>(undefined);

interface ChromecastProviderProps {
    children: ReactNode;
}

export const ChromecastProvider: React.FC<ChromecastProviderProps> = ({ children }) => {
    const chromecastHook = useChromecast();

    return (
        <ChromecastContext.Provider value={chromecastHook}>{children}</ChromecastContext.Provider>
    );
};

export const useChromecastContext = (): ChromecastContextType => {
    const context = useContext(ChromecastContext);
    if (context === undefined) {
        throw new Error('useChromecastContext must be used within a ChromecastProvider');
    }
    return context;
};

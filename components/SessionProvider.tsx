// components/SessionProvider.tsx
'use client';

import { useSessionRestore } from '@/lib/hooks/useSessionRestore';

export function SessionProvider({ children }: { children: React.ReactNode }) {
    useSessionRestore();
    
    return <>{children}</>;
}
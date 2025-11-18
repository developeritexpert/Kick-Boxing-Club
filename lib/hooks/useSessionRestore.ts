// hooks/useSessionRestore.ts
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabaseClient } from '@/lib/supabaseClient';

export function useSessionRestore() {
    const setUser = useAuthStore((state) => state.setUser);
    const clearUser = useAuthStore((state) => state.clearUser);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                // Get current session from Supabase
                const { data: { session } } = await supabaseClient.auth.getSession();
                
                if (session) {
                    // Verify the session is still valid
                    const { data: { user }, error } = await supabaseClient.auth.getUser();
                    
                    if (user && !error) {
                        // Fetch user metadata
                        const response = await fetch('/api/auth/me');
                        if (response.ok) {
                            const userData = await response.json();
                            setUser(userData.user);
                            console.log(`use session restore userData.user`);
                            console.log(userData.user);
                            
                        }
                    } else {
                        // Session invalid, clear everything
                        clearUser();
                        await supabaseClient.auth.signOut();
                    }
                } else {
                    // No session found
                    clearUser();
                }
            } catch (error) {
                console.error('Error restoring session:', error);
                clearUser();
            }
        };

        restoreSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    clearUser();
                } else if (event === 'SIGNED_IN' && session) {
                    // Fetch fresh user data
                    const response = await fetch('/api/auth/me');
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData.user);
                    }
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    // Update token but keep user data
                    console.log('Token refreshed');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, clearUser]);
}
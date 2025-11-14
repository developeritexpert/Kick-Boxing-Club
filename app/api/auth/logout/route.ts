// logout api
import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabaseClient';

export async function POST() {
    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
        }

        const res = NextResponse.json({ success: true });

        res.cookies.set('sb-access-token', '', {
            httpOnly: true,
            path: '/',
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
        });

        res.cookies.set('sb-refresh-token', '', {
            httpOnly: true,
            path: '/',
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
        });

        res.cookies.set('user-role', '', {
            httpOnly: true,
            path: '/',
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
        });

        // console.log('logout api');

        return res;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}

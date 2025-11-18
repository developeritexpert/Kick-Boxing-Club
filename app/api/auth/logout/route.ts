import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabaseClient';

export async function POST() {
    try {
        // Sign out from Supabase
        await supabaseClient.auth.signOut();

        const res = NextResponse.json({ status: 'ok', message: 'Logged out successfully' });

        // Clear all auth cookies
        res.cookies.delete('sb-access-token');
        res.cookies.delete('sb-refresh-token');
        res.cookies.delete('user-role');
        res.cookies.delete('remember-me');

        return res;
    } catch (err) {
        return NextResponse.json(
            { status: 'error', message: err instanceof Error ? err.message : String(err) },
            { status: 500 },
        );
    }
}











// // logout api (original)
// import { NextResponse } from 'next/server';
// import { supabaseClient } from '@/lib/supabaseClient';

// export async function POST() {
//     try {
//         const { error } = await supabaseClient.auth.signOut();

//         if (error) {
//             console.error('Logout error:', error);
//         }

//         const res = NextResponse.json({ success: true });

//         res.cookies.set('sb-access-token', '', {
//             httpOnly: true,
//             path: '/',
//             maxAge: 0,
//             secure: process.env.NODE_ENV === 'production',
//         });

//         res.cookies.set('sb-refresh-token', '', {
//             httpOnly: true,
//             path: '/',
//             maxAge: 0,
//             secure: process.env.NODE_ENV === 'production',
//         });

//         res.cookies.set('user-role', '', {
//             httpOnly: true,
//             path: '/',
//             maxAge: 0,
//             secure: process.env.NODE_ENV === 'production',
//         });

//         // console.log('logout api');

//         return res;
//     } catch (error) {
//         console.error('Logout error:', error);
//         return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
//     }
// }

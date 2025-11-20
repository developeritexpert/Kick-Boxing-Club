// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseClient } from '@/lib/supabaseClient';

export async function POST() {
    try {
        // Sign out from Supabase
        await supabaseClient.auth.signOut();

        const response = NextResponse.json({ status: 'ok' });

        const cookieStore = await cookies();

        // Clear all auth-related cookies
        const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'user-role', 'remember-me'];

        cookiesToClear.forEach((cookieName) => {
            if (cookieStore.has(cookieName)) {
                response.cookies.delete(cookieName);
            }
        });

        return response;
    } catch (err) {
        return NextResponse.json(
            { status: 'error', message: err instanceof Error ? err.message : String(err) },
            { status: 500 },
        );
    }
}

// user null after one day
// import { NextResponse } from 'next/server';
// import { supabaseClient } from '@/lib/supabaseClient';

// export async function POST() {
//     try {
//         // Sign out from Supabase
//         await supabaseClient.auth.signOut();

//         const res = NextResponse.json({ status: 'ok', message: 'Logged out successfully' });

//         // Clear all auth cookies
//         res.cookies.delete('sb-access-token');
//         res.cookies.delete('sb-refresh-token');
//         res.cookies.delete('user-role');
//         res.cookies.delete('remember-me');

//         return res;
//     } catch (err) {
//         return NextResponse.json(
//             { status: 'error', message: err instanceof Error ? err.message : String(err) },
//             { status: 500 },
//         );
//     }
// }

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

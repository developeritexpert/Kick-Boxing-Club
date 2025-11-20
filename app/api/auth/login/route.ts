// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, rememberMe } = body;

        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 401 });
        }

        const user = authData.user;

        if (!user) {
            return NextResponse.json({ error: 'Login failed' }, { status: 500 });
        }

        const { data: metaData, error: metaError } = await supabaseAdmin
            .from('user_meta')
            .select('first_name, last_name, role, phone')
            .eq('user_id', user.id)
            .single();

        if (metaError) {
            console.error('Error fetching user_meta:', metaError);
            return NextResponse.json({ error: 'Failed to load user profile.' }, { status: 500 });
        }

        const access_token = authData.session?.access_token || null;
        const refresh_token = authData.session?.refresh_token || null;

        const res = NextResponse.json({
            status: 'ok',
            user: {
                id: user.id,
                email: user.email,
                first_name: metaData.first_name || null,
                last_name: metaData.last_name || null,
                phone: metaData.phone || null,
                role: metaData.role || null,
            },
            access_token,
            refresh_token,
        });

        // Cookie expiration for access token (short-lived)
        const accessTokenOptions = {
            httpOnly: true,
            path: '/',
            sameSite: 'lax' as const,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60, // 1 hour (match token expiry)
        };

        // Cookie expiration for refresh token (long-lived if rememberMe)
        const refreshTokenOptions = {
            httpOnly: true,
            path: '/',
            sameSite: 'lax' as const,
            secure: process.env.NODE_ENV === 'production',
            ...(rememberMe ? { maxAge: 7 * 24 * 60 * 60 } : { maxAge: 60 * 60 }), // 7 days or 1 hour
        };

        // Cookie for remember-me flag (long-lived)
        const rememberMeOptions = {
            httpOnly: true,
            path: '/',
            sameSite: 'lax' as const,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60, // Always 7 days
        };

        if (authData.session?.access_token) {
            res.cookies.set('sb-access-token', authData.session.access_token, accessTokenOptions);
        }

        if (authData.session?.refresh_token) {
            res.cookies.set(
                'sb-refresh-token',
                authData.session.refresh_token,
                refreshTokenOptions,
            );
        }

        // Set role cookie with same expiration as refresh token
        res.cookies.set('user-role', metaData.role, refreshTokenOptions);

        // Set rememberMe flag
        res.cookies.set('remember-me', rememberMe ? 'true' : 'false', rememberMeOptions);

        return res;
    } catch (err) {
        return NextResponse.json(
            { status: 'error', message: err instanceof Error ? err.message : String(err) },
            { status: 500 },
        );
    }
}

// user null after 1 day

// // login api route
// import { NextResponse } from 'next/server';
// import { supabaseClient } from '@/lib/supabaseClient';
// import { supabaseAdmin } from '@/lib/supabaseAdmin';

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const { email, password, rememberMe } = body;

//         const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
//             email,
//             password,
//         });

//         if (authError) {
//             return NextResponse.json({ error: authError.message }, { status: 401 });
//         }

//         const user = authData.user;

//         if (!user) {
//             return NextResponse.json({ error: 'Login failed' }, { status: 500 });
//         }

//         const { data: metaData, error: metaError } = await supabaseAdmin
//             .from('user_meta')
//             .select('first_name, last_name, role, phone')
//             .eq('user_id', user.id)
//             .single();

//         if (metaError) {
//             console.error('Error fetching user_meta:', metaError);
//             return NextResponse.json({ error: 'Failed to load user profile.' }, { status: 500 });
//         }

//         const access_token = authData.session?.access_token || null;
//         const refresh_token = authData.session?.refresh_token || null;

//         const res = NextResponse.json({
//             status: 'ok',
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 first_name: metaData.first_name || null,
//                 last_name: metaData.last_name || null,
//                 phone: metaData.phone || null,
//                 role: metaData.role || null,
//             },
//             access_token,
//             refresh_token,
//         });

//         // Set cookie expiration based on rememberMe flag
//         const cookieOptions = {
//             httpOnly: true,
//             path: '/',
//             sameSite: 'lax' as const,
//             secure: process.env.NODE_ENV === 'production',
//             ...(rememberMe ? { maxAge: 7 * 24 * 60 * 60 } : {}), // 7 days if rememberMe, session cookie otherwise
//         };

//         if (authData.session?.access_token) {
//             res.cookies.set('sb-access-token', authData.session.access_token, cookieOptions);

//             // Add role cookie with same expiration
//             res.cookies.set('user-role', metaData.role, cookieOptions);

//             // Add rememberMe flag cookie
//             res.cookies.set('remember-me', rememberMe ? 'true' : 'false', cookieOptions);
//         }

//         return res;
//     } catch (err) {
//         return NextResponse.json(
//             { status: 'error', message: err instanceof Error ? err.message : String(err) },
//             { status: 500 },
//         );
//     }
// }

// // login api route (original)
// import { NextResponse } from 'next/server';
// import { supabaseClient } from '@/lib/supabaseClient';
// import { supabaseAdmin } from '@/lib/supabaseAdmin';

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const { email, password } = body;

//         const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
//             email,
//             password,
//         });

//         if (authError) {
//             return NextResponse.json({ error: authError.message }, { status: 401 });
//         }

//         const user = authData.user;

//         // await supabaseClient.auth.setSession({
//         //   access_token: authData.session.access_token,
//         //   refresh_token: authData.session.refresh_token,
//         // });

//         if (!user) {
//             return NextResponse.json({ error: 'Login failed' }, { status: 500 });
//         }

//         const { data: metaData, error: metaError } = await supabaseAdmin
//             .from('user_meta')
//             .select('first_name, last_name, role, phone')
//             .eq('user_id', user.id)
//             .single();

//         if (metaError) {
//             console.error('Error fetching user_meta:', metaError);
//             return NextResponse.json({ error: 'Failed to load user profile.' }, { status: 500 });
//         }

//         const access_token = authData.session?.access_token || null;
//         const refresh_token = authData.session?.refresh_token || null;

//         const res = NextResponse.json({
//             status: 'ok',
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 first_name: metaData.first_name || null,
//                 last_name: metaData.last_name || null,
//                 phone: metaData.phone || null,
//                 role: metaData.role || null,
//             },
//             access_token,
//             refresh_token,
//         });

//         // if (authData.session?.access_token) {
//         //     res.cookies.set('sb-access-token', authData.session.access_token, {
//         //         httpOnly: true,
//         //         path: '/',
//         //         sameSite: 'lax',
//         //         secure: process.env.NODE_ENV === 'production',
//         //     });
//         // }

//         if (authData.session?.access_token) {
//             res.cookies.set('sb-access-token', authData.session.access_token, {
//                 httpOnly: true,
//                 path: '/',
//                 sameSite: 'lax',
//                 secure: process.env.NODE_ENV === 'production',
//             });

//             // Add this cookie for role-based access control
//             res.cookies.set('user-role', metaData.role, {
//                 httpOnly: true,
//                 path: '/',
//                 sameSite: 'lax',
//                 secure: process.env.NODE_ENV === 'production',
//             });
//         }

//         return res;
//     } catch (err) {
//         return NextResponse.json(
//             { status: 'error', message: err instanceof Error ? err.message : String(err) },
//             { status: 500 },
//         );
//     }
// }

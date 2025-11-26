// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabaseClient } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        let accessToken = cookieStore.get('sb-access-token')?.value;
        const refreshToken = cookieStore.get('sb-refresh-token')?.value;

        // If no access token but have refresh token, try to refresh
        if (!accessToken && refreshToken) {
            const { data, error } = await supabaseClient.auth.refreshSession({
                refresh_token: refreshToken,
            });

            if (error || !data.session) {
                // console.log('error refreshSession');
                // console.log(error);

                // console.log('data.session refreshSession');
                // console.log(data.session);

                return NextResponse.json({ error: 'Session expired' }, { status: 401 });
            }

            // console.log(`data.session.access_token`);
            // console.log(data.session.access_token);

            accessToken = data.session.access_token;

            // Update cookies with new tokens
            const res = await getUserData(accessToken);

            if (res.ok) {
                const rememberMe = cookieStore.get('remember-me')?.value === 'true';

                res.cookies.set('sb-access-token', data.session.access_token, {
                    httpOnly: true,
                    path: '/',
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60, // 1 hour
                });

                if (data.session.refresh_token) {
                    res.cookies.set('sb-refresh-token', data.session.refresh_token, {
                        httpOnly: true,
                        path: '/',
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: rememberMe ? 7 * 24 * 60 * 60 : 60 * 60,
                    });
                }
            }

            return res;
        }

        if (!accessToken) {
            console.log(`no access token`);

            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        return await getUserData(accessToken);
    } catch (err) {
        return NextResponse.json(
            { status: 'error', message: err instanceof Error ? err.message : String(err) },
            { status: 500 },
        );
    }
}

async function getUserData(accessToken: string) {
    // console.log(`getUserData accessToken`);
    // console.log(accessToken);

    // Verify the token and get user from Supabase
    const {
        data: { user },
        error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    // console.log('error getUserData');
    // console.log(authError);

    // console.log('data getUserData');
    // console.log(user);

    if (authError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user metadata
    const { data: metaData, error: metaError } = await supabaseAdmin
        .from('user_meta')
        .select('first_name, last_name, role, phone, profile_image_url')
        .eq('user_id', user.id)
        .single();

    if (metaError) {
        console.error('Error fetching user_meta:', metaError);
        return NextResponse.json({ error: 'Failed to load user profile.' }, { status: 500 });
    }

    return NextResponse.json({
        status: 'ok',
        user: {
            id: user.id,
            email: user.email,
            first_name: metaData.first_name || null,
            last_name: metaData.last_name || null,
            phone: metaData.phone || null,
            role: metaData.role || null,
            profile_image_url: metaData.profile_image_url || null,
        },
    });
}

// user null after 1 day
// // app/api/auth/me/route.ts
// import { NextResponse } from 'next/server';
// import { supabaseAdmin } from '@/lib/supabaseAdmin';
// import { cookies } from 'next/headers';

// export async function GET() {
//     try {
//         const cookieStore = await cookies();
//         const accessToken = cookieStore.get('sb-access-token')?.value;

//         if (!accessToken) {
//             return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//         }

//         // Verify the token and get user from Supabase
//         const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

//         if (authError || !user) {
//             return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//         }

//         // Fetch user metadata
//         const { data: metaData, error: metaError } = await supabaseAdmin
//             .from('user_meta')
//             .select('first_name, last_name, role, phone')
//             .eq('user_id', user.id)
//             .single();

//         if (metaError) {
//             console.error('Error fetching user_meta:', metaError);
//             return NextResponse.json({ error: 'Failed to load user profile.' }, { status: 500 });
//         }

//         return NextResponse.json({
//             status: 'ok',
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 first_name: metaData.first_name || null,
//                 last_name: metaData.last_name || null,
//                 phone: metaData.phone || null,
//                 role: metaData.role || null,
//             },
//         });
//     } catch (err) {
//         return NextResponse.json(
//             { status: 'error', message: err instanceof Error ? err.message : String(err) },
//             { status: 500 },
//         );
//     }
// }

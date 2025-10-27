// register via admin no email confermation needed
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, first_name, last_name, phone, role } = body;

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name,
                last_name,
                phone,
                role: role || 'user',
            },
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
        }

        const { error: metaError } = await supabaseAdmin.from('user_meta').insert({
            user_id: authData.user.id,
            first_name,
            last_name,
            email,
            phone,
            role: role || 'user',
        });

        if (metaError) {
            return NextResponse.json({ error: metaError.message }, { status: 500 });
        }

        return NextResponse.json({
            status: 'ok',
            message: 'User registered successfully (no email confirmation required)',
            user: authData.user,
        });
    } catch (err) {
        return NextResponse.json(
            { status: 'error', message: err instanceof Error ? err.message : String(err) },
            { status: 500 },
        );
    }
}

// register via rest api (email verification)

// import { NextResponse } from 'next/server'
// import { supabaseClient } from '@/lib/supabaseClient'
// import { supabaseAdmin } from '@/lib/supabaseAdmin'

// export async function POST(req: Request) {
//   try {
//     const body = await req.json()
//     const { email, password, first_name, last_name, phone } = body

//     const { data: authData, error: authError } = await supabaseClient.auth.signUp({
//       email,
//       password,
//     })

//     if (authError) {
//       return NextResponse.json({ error: authError.message }, { status: 400 })
//     }

//     if (!authData.user) {
//       return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
//     }

//     const { error: metaError } = await supabaseAdmin
//       .from('user_meta')
//       .insert({
//         user_id: authData.user.id,
//         first_name,
//         last_name,
//         email,
//         phone,
//         role: body.role || "user"
//       })

//     if (metaError) {
//       return NextResponse.json({ error: metaError.message }, { status: 500 })
//     }

//     return NextResponse.json({ status: 'ok', message: 'User registered successfully' })
//   } catch (err) {
//     return NextResponse.json(
//       { status: 'error', message: err instanceof Error ? err.message : String(err) },
//       { status: 500 }
//     )
//   }
// }

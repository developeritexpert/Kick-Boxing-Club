// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify the token and get user from Supabase
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Fetch user metadata
        const { data: metaData, error: metaError } = await supabaseAdmin
            .from('user_meta')
            .select('first_name, last_name, role, phone')
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
            },
        });
    } catch (err) {
        return NextResponse.json(
            { status: 'error', message: err instanceof Error ? err.message : String(err) },
            { status: 500 },
        );
    }
}
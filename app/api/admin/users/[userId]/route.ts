import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET user by ID
export async function GET(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
    const { userId } = await context.params;

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    try {
        const { data, error } = await supabaseAdmin
            .from('user_meta')
            .select('user_id, first_name, last_name, role, email, phone')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return NextResponse.json({ user: data }, { status: 200 });
    } catch (error) {
        // return NextResponse.json({ error: err.message }, { status: 500 });
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

// PUT (update) user by ID
export async function PUT(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
    const { userId } = await context.params;
    const body = await req.json();

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    try {
        const { data, error } = await supabaseAdmin
            .from('user_meta')
            .update(body)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ user: data }, { status: 200 });
    } catch (error) {
        // return NextResponse.json({ error: err.message }, { status: 500 });
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

// DELETE user by ID
export async function DELETE(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
    const { userId } = await context.params;

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    try {
        // Delete user metadata
        const { error: metaError } = await supabaseAdmin
            .from('user_meta')
            .delete()
            .eq('user_id', userId);

        if (metaError) throw metaError;

        // Delete Supabase auth user
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) console.error('Error deleting auth user:', authError);

        return NextResponse.json(
            { status: 'ok', message: 'User deleted successfully' },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

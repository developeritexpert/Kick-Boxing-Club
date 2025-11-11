import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const { user_id, workout_id } = await req.json();

        if (!user_id || !workout_id) {
            return NextResponse.json(
                { success: false, error: 'Missing user_id or workout_id' },
                { status: 400 },
            );
        }

        const { error } = await supabaseAdmin.from('recent_workouts').upsert(
            {
                user_id,
                workout_id,
                last_accessed_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,workout_id' },
        );

        if (error) {
            console.error('Error upserting recent workout:', error);
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Recent workout added/updated' });
    } catch (error: any) {
        console.error('Error adding/updating recent workout:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { user_id, workout_id } = await req.json();

        if (!user_id || !workout_id) {
            return NextResponse.json(
                { success: false, error: 'Missing user_id or workout_id' },
                { status: 400 },
            );
        }

        const { error } = await supabaseAdmin
            .from('recent_workouts')
            .delete()
            .eq('user_id', user_id)
            .eq('workout_id', workout_id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Removed from recent workouts' });
    } catch (error: any) {
        console.error('Error deleting recent workout:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

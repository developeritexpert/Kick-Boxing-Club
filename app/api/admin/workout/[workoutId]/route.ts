// app/api/admin/workout/[workoutId]/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request, { params }) {
    try {
        const { workoutId } = await params;

        if (!workoutId) {
            return NextResponse.json(
                { error: 'Workout ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('workouts')
            .select(`
                id,
                name,
                workout_movements (
                    id,
                    sequence_order,
                    duration,
                    rest_after,
                    movements (
                    id,
                    name,
                    video_id,
                    video_url,
                    thumbnail_url
                    )
                )
            `)
            .eq('id', workoutId)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Workout not found' },
                { status: 404 }
            );
        }

        const sortedMovements = (data.workout_movements || []).sort(
            (a, b) => a.sequence_order - b.sequence_order
        );

        return NextResponse.json({
            ...data,
            workout_movements: sortedMovements,
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
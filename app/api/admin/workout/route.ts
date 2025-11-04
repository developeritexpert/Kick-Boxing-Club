// get all workouts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('workouts')
            .select(
                `
                id,
                name,
                total_duration,
                status,
                created_by,
                created_at,
                workout_movements (
                    sequence_order,
                    duration,
                    rest_after,
                    movements (
                        id,
                        name,
                        thumbnail_url,
                        category_id,
                        categories (
                            id,
                            name
                        )
                    )
                )
            `,
            )
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[GET /workouts] Supabase error:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch workouts', error: error.message },
                { status: 500 },
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { success: true, data: [], message: 'No workouts found' },
                { status: 200 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                count: data.length,
                data,
            },
            { status: 200 },
        );
    } catch (error: unknown) {
        console.error('[GET /workouts] Unexpected error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred while fetching workouts',
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}

// app/api/content-admin/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);

        if (!body || !body.userId) {
            return NextResponse.json(
                { success: false, message: 'User ID is required' },
                { status: 400 },
            );
        }

        const { userId } = body as { userId: string };

        // 1) movement count
        const { count: movementCount, error: movementError } = await supabaseAdmin
            .from('movements')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', userId);

        if (movementError) {
            console.error('Error fetching movement count:', movementError);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to fetch movement count',
                    details: movementError.message,
                },
                { status: 500 },
            );
        }

        // 2) workout count
        const { count: workoutCount, error: workoutError } = await supabaseAdmin
            .from('workouts')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', userId);

        if (workoutError) {
            console.error('Error fetching workout count:', workoutError);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to fetch workout count',
                    details: workoutError.message,
                },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Dashboard stats fetched successfully',
                data: {
                    movementCount: movementCount ?? 0,
                    workoutCount: workoutCount ?? 0,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Unexpected error in dashboard stats API:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}

// app/api/content-admin/dashboard/recent/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId' },
                { status: 400 }
            );
        }

        const { data: recents, error: recentError } = await supabaseAdmin
            .from('recent_workouts')
            .select('workout_id, last_accessed_at')
            .eq('user_id', userId)
            .order('last_accessed_at', { ascending: false })
            .limit(3); // Only get 3 latest

        if (recentError) throw recentError;
        if (!recents?.length) {
            return NextResponse.json({ success: true, data: [] });
        }

        const workoutIds = recents.map((r) => r.workout_id);

        const { data: workouts, error: workoutError } = await supabaseAdmin
            .from('workouts')
            .select('id, name, class_id, created_by, status')
            .in('id', workoutIds);

        if (workoutError) throw workoutError;

        const classIds = [...new Set(workouts.map((w) => w.class_id).filter(Boolean))];
        const { data: classes } = await supabaseAdmin
            .from('classes')
            .select('id, name')
            .in('id', classIds);

        const result = recents
            .map((recent) => {
                const w = workouts.find((workout) => workout.id === recent.workout_id);
                if (!w) return null;

                const classObj = classes?.find((c) => c.id === w.class_id);

                return {
                    workout_id: w.id,
                    workout_name: w.name,
                    class_name: classObj ? classObj.name : 'Uncategorized',
                    status: w.status || 'Draft', // status from workouts table
                    last_accessed_at: recent.last_accessed_at,
                };
            })
            .filter(Boolean);

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error fetching recent workouts:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
// api to fetch all recent workouts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const { user_id } = await req.json();

        if (!user_id) {
            return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 });
        }

        const { data: recents, error: recentError } = await supabaseAdmin
            .from('recent_workouts')
            .select('workout_id, last_accessed_at')
            .eq('user_id', user_id)
            .order('last_accessed_at', { ascending: false });

        if (recentError) throw recentError;
        if (!recents?.length) {
            return NextResponse.json({ success: true, data: [] });
        }

        const workoutIds = recents.map((r) => r.workout_id);

        const { data: workouts, error: workoutError } = await supabaseAdmin
            .from('workouts')
            .select('id, name, class_id, created_by')
            .in('id', workoutIds);
        if (workoutError) throw workoutError;

        const classIds = [...new Set(workouts.map((w) => w.class_id).filter(Boolean))];
        const { data: classes } = await supabaseAdmin
            .from('classes')
            .select('id, name')
            .in('id', classIds);

        const creatorIds = [...new Set(workouts.map((w) => w.created_by).filter(Boolean))];
        const { data: creators } = await supabaseAdmin
            .from('user_meta')
            .select('user_id, first_name, last_name')
            .in('user_id', creatorIds);

        const result = recents
            .map((recent) => {
                const w = workouts.find((workout) => workout.id === recent.workout_id);
                if (!w) return null;

                const classObj = classes?.find((c) => c.id === w.class_id);
                const creator = creators?.find((c) => c.user_id === w.created_by);

                return {
                    workout_id: w.id,
                    workout_name: w.name,
                    class_name: classObj ? classObj.name : null,
                    created_by: creator ? `${creator.first_name} ${creator.last_name}` : null,
                    last_accessed_at: recent.last_accessed_at,
                };
            })
            .filter(Boolean); // Remove any null entries

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error fetching recent workouts:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

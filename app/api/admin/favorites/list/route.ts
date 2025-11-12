import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const { user_id } = await req.json();

        if (!user_id) {
            return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 });
        }

        const { data: favorites, error: favError } = await supabaseAdmin
            .from('workout_favorites')
            .select('workout_id')
            .eq('user_id', user_id);

        if (favError) throw favError;
        if (!favorites?.length) {
            return NextResponse.json({ success: true, data: [] });
        }

        const workoutIds = favorites.map((f) => f.workout_id);

        const { data: workouts, error: workoutError } = await supabaseAdmin
            .from('workouts')
            .select('id, name, class_id, created_by')
            .in('id', workoutIds);

        if (workoutError) throw workoutError;

        const classIds = [...new Set(workouts.map((w) => w.class_id).filter(Boolean))];
        const { data: classes, error: classError } = await supabaseAdmin
            .from('classes')
            .select('id, name')
            .in('id', classIds);

        if (classError) throw classError;

        const creatorIds = [...new Set(workouts.map((w) => w.created_by).filter(Boolean))];
        const { data: creators, error: creatorError } = await supabaseAdmin
            .from('user_meta')
            .select('user_id, first_name, last_name')
            .in('user_id', creatorIds);

        if (creatorError) throw creatorError;

        const result = workouts.map((w) => {
            const classObj = classes.find((c) => c.id === w.class_id);
            const creator = creators.find((c) => c.user_id === w.created_by);
            return {
                workout_id: w.id,
                workout_name: w.name,
                class_name: classObj ? classObj.name : null,
                created_by: creator ? `${creator.first_name} ${creator.last_name}` : null,
            };
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error fetching favorite workouts:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { user_id, workout_id } = await req.json();

        console.log(`user_id`);
        console.log(user_id);
        console.log(`workout_id`);
        console.log(workout_id);

        if (!user_id || !workout_id) {
            return NextResponse.json(
                { success: false, error: 'Missing user_id or workout_id' },
                { status: 400 },
            );
        }
        const { error } = await supabaseAdmin
            .from('workout_favorites')
            .delete()
            .match({ user_id, workout_id });

        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Removed from favorites' });
    } catch (error: any) {
        console.error('Error deleting favorite workout:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

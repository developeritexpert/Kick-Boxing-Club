import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type MovementInput = {
    id: string;
    order: number;
    duration: number; // Enforce number, matching Admin API
    rest_after?: number;
};

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const { name, locationId, classId, focus, movements, created_by } = data;
        console.log(focus);
        
        if (!Array.isArray(movements) || movements.length === 0) {
            return NextResponse.json(
                { error: 'At least one movement is required' },
                { status: 400 }
            );
        }

        // This is critical because the frontend allows custom durations
        for (const m of movements) {
            if (!m.duration || m.duration <= 0) {
                return NextResponse.json(
                    { error: 'All movements must have a valid duration greater than 0' },
                    { status: 400 }
                );
            }
        }

        const total_duration = movements.reduce(
            (acc: number, m: MovementInput) => acc + m.duration + (m.rest_after || 0),
            0,
        );

        const { data: workout, error: workoutError } = await supabaseAdmin
            .from('workouts')
            .insert([
                {
                    name,
                    total_duration,
                    location_id: locationId,
                    class_id: classId,
                    created_by,
                },
            ])
            .select()
            .single();

        if (workoutError) {
            console.error('Workout creation error:', workoutError);
            throw workoutError;
        }

        const workoutMovements = movements.map((m: MovementInput) => ({
            workout_id: workout.id,
            movement_id: m.id,
            sequence_order: m.order,
            duration: m.duration, // Saves the specific custom duration
            rest_after: m.rest_after || 0,
        }));

        const { error: movementError } = await supabaseAdmin
            .from('workout_movements')
            .insert(workoutMovements);

        // If movement insertion fails delete 
        if (movementError) {
            console.error('Workout movements insertion error:', movementError);
            await supabaseAdmin.from('workouts').delete().eq('id', workout.id);
            throw movementError;
        }

        return NextResponse.json(
            {
                message: 'Workout created successfully',
                workout_id: workout.id,
                total_duration,
                movements_count: movements.length,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Error creating Workout:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}































// import { NextResponse } from 'next/server';
// import { supabaseAdmin } from '@/lib/supabaseAdmin';

// type MovementInput = {
//     id: string;
//     order: number;
//     duration?: number;
//     rest_after?: number;
// };

// export async function POST(req: Request) {
//     try {
//         const data = await req.json();

//         const { name, locationId, classId, focus, movements, created_by } = data;
//         console.log(focus);

//         const total_duration = movements.reduce(
//             (acc: number, m: MovementInput) => acc + (m.duration || 0) + Number(m.rest_after || 0),
//             0,
//         );

//         const { data: workout, error: workoutError } = await supabaseAdmin
//             .from('workouts')
//             .insert([
//                 {
//                     name,
//                     total_duration,
//                     location_id: locationId,
//                     class_id: classId,
//                     created_by,
//                     // created_by: 'ed14d193-b06a-4961-a84e-d8341490abc0',
//                 },
//             ])
//             .select()
//             .single();

//         if (workoutError) throw workoutError;

//         const workoutMovements = movements.map((m: MovementInput) => ({
//             workout_id: workout.id,
//             movement_id: m.id,
//             sequence_order: m.order,
//             duration: m.duration,
//             rest_after: m.rest_after,
//         }));

//         const { error: movementError } = await supabaseAdmin
//             .from('workout_movements')
//             .insert(workoutMovements);

//         if (movementError) throw movementError;

//         return NextResponse.json(
//             {
//                 message: 'Workout created successfully',
//                 workout_id: workout.id,
//             },
//             { status: 200 },
//         );
//     } catch (error) {
//         console.error('Error creating Workout:', error);
//         return NextResponse.json(
//             { error: error instanceof Error ? error.message : String(error) },
//             { status: 500 },
//         );
//     }
// }

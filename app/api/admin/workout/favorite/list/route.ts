import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
    try {
        const { user_id } = await req.json()

        if (!user_id) {
            return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('workout_favorites')
            .select('workout_id')
            .eq('user_id', user_id)

        if (error) throw error

        const favoriteWorkoutIds = data.map((item) => item.workout_id)

        return NextResponse.json({ success: true, data: favoriteWorkoutIds })
    } catch (error: any) {
        console.error('Error fetching favorites:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

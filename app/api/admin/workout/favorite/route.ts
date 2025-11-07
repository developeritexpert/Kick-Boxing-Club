import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
    try {
        const { workout_id, user_id } = await req.json()

        if (!user_id || !workout_id) {
            return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 })
        }

        const { data: existing, error: existingError } = await supabaseAdmin
            .from('workout_favorites')
            .select('*')
            .eq('workout_id', workout_id)
            .eq('user_id', user_id)
            .maybeSingle()

        if (existingError) throw existingError

        if (existing) {
            const { error: deleteError } = await supabaseAdmin
                .from('workout_favorites')
                .delete()
                .eq('workout_id', workout_id)
                .eq('user_id', user_id)

            if (deleteError) throw deleteError

            return NextResponse.json({ success: true, message: 'Removed from favorites' })
        }

        const { error: insertError } = await supabaseAdmin
            .from('workout_favorites')
            .insert({ workout_id, user_id })

        if (insertError) throw insertError

        return NextResponse.json({ success: true, message: 'Added to favorites' })
    } catch (error: any) {
        console.error('Error in favorite API:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

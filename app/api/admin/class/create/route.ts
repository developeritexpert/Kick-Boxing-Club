import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('classes')
            .insert([{ name, is_active: true }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

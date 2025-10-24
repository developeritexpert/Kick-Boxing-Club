import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
//   const { id } = await context.params;

//   if (!id) return NextResponse.json({ error: 'Movement ID required' }, { status: 400 });

//   try {
//     const { data, error } = await supabaseAdmin
//       .from('movements')
//       .select('id, name, category, created_by, video_url, video_provider')
//       .eq('id', id)
//       .single();

//     if (error) throw error;

//     return NextResponse.json({ movement: data }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : String(error) },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const body = await req.json();

    if (!id) return NextResponse.json({ error: 'Movement ID required' }, { status: 400 });

    try {
        const { data, error } = await supabaseAdmin
            .from('movements')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ movement: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    if (!id) return NextResponse.json({ error: 'Movement ID required' }, { status: 400 });

    try {
        const { error } = await supabaseAdmin.from('movements').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json(
            { status: 'ok', message: 'Movement deleted successfully' },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

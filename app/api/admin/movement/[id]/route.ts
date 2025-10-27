import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    if (!id) {
        return NextResponse.json({ error: 'Movement ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('movements')
            .select(
                `
                    id,
                    name,
                    sub_category,
                    video_url,
                    video_provider,
                    category:category_id ( id, name )
                `,
            )
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            return NextResponse.json({ error: 'Movement not found' }, { status: 404 });
        }

        return NextResponse.json({ movement: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    interface MovementUpdate {
        name?: string;
        sub_category?: string;
        category_id?: string;
        description?: string;
        video_provider?: string;
        video_id?: string;
        video_url?: string;
        created_by?: string;
    }
    const { id } = await context.params;

    if (!id) return NextResponse.json({ error: 'Movement ID required' }, { status: 400 });

    try {
        const formData = await req.formData();

        const name = formData.get('name') as string;
        const category_id = formData.get('category') as string;
        const sub_category = formData.get('sub_category') as string;
        // const media = formData.get('media') as File | null;
        const description = 'test';
        const video_provider = 'cloudflare';
        const video_id = 'test';
        const video_url = 'test';
        const created_by = '4f1a65e9-4bd8-4426-b4a8-bc2aae9784cc';

        const updateData: MovementUpdate = {
            name,
            sub_category,
            category_id,
            description,
            video_provider,
            video_id,
            video_url,
            created_by,
        };

        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined || updateData[key] === null) {
                delete updateData[key];
            }
        });

        const { data, error } = await supabaseAdmin
            .from('movements')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ movement: data }, { status: 200 });
    } catch (error) {
        console.error('PUT /api/admin/movement error:', error);

        const message =
            error instanceof Error
                ? error.message
                : typeof error === 'object'
                  ? JSON.stringify(error)
                  : String(error);

        return NextResponse.json({ error: message }, { status: 500 });

        // return NextResponse.json(
        //     { error: error instanceof Error ? error.message : String(error) },
        //     { status: 500 },
        // );
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

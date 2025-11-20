import { NextRequest, NextResponse } from 'next/server';
import { CLOUDFLARE } from '@/lib/cloudflare';
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
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Movement ID required' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const wantsUploadURL = searchParams.get('upload') === 'true';

    try {
        if (wantsUploadURL) {
            const cfReservedContainer = await CLOUDFLARE.createDirectUpload(600);
            const { uploadURL, uid: video_uid } = cfReservedContainer;

            return NextResponse.json({
                uploadURL,
                video_uid,
            });
        }

        const body = await req.json();

        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('movements')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existing) throw new Error('Movement not found');

        const updateData = {
            name: body.name ?? existing.name,
            sub_category: body.subCategory ?? existing.sub_category,
            category_id: body.category ?? existing.category_id,
            video_id: body.video_id ?? existing.video_id,
            video_url: body.video_url ?? existing.video_url,
            thumbnail_url: body.thumbnail_url ?? existing.thumbnail_url,
        };

        Object.keys(updateData).forEach((key) => {
            if (updateData[key as keyof typeof updateData] == null)
                delete updateData[key as keyof typeof updateData];
        });

        if (body.video_id && existing.video_id && body.video_id !== existing.video_id) {
            await CLOUDFLARE.deleteVideoFromCloudflare(existing.video_id);
        }

        const { data, error } = await supabaseAdmin
            .from('movements')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Movement updated successfully',
            movement: data,
        });
    } catch (error) {
        console.error('PUT /api/admin/movement error:', error);
        const message =
            error instanceof Error
                ? error.message
                : typeof error === 'object'
                  ? JSON.stringify(error)
                  : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    if (!id) return NextResponse.json({ error: 'Movement ID required' }, { status: 400 });

    try {
        // movement alredy in use
        const { data: usage, error: usageError } = await supabaseAdmin
            .from('workout_movements')
            .select('id')
            .eq('movement_id', id)
            .limit(1);

        if (usageError) {
            console.error('Error checking movement usage:', usageError);
            return NextResponse.json(
                { error: 'Failed to check if movement is in use.' },
                { status: 500 },
            );
        }

        if (usage && usage.length > 0) {
            return NextResponse.json(
                {
                    error: 'This movement is already used in a workout and cannot be deleted.',
                    code: 'MOVEMENT_IN_USE',
                },
                { status: 409 },
            );
        }

        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('movements')
            .select('id, video_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing)
            return NextResponse.json(
                { error: fetchError?.message || 'Movement not found' },
                { status: 404 },
            );

        if (existing.video_id) {
            try {
                await CLOUDFLARE.deleteVideoFromCloudflare(existing.video_id);
            } catch (error) {
                console.error('Cloudflare video delete failed:', error);
            }
        }

        const { error: deleteError } = await supabaseAdmin.from('movements').delete().eq('id', id);

        if (deleteError) throw deleteError;

        return NextResponse.json(
            { status: true, message: 'Movement deleted successfully' },
            { status: 200 },
        );
    } catch (error) {
        console.error('Movement delete error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

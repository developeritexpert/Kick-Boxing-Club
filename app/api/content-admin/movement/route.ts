import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'User ID is required' },
                { status: 400 },
            );
        }

        const { data, error } = await supabaseAdmin
            .from('movements')
            .select(
                `
                    id,
                    name,
                    description,
                    created_by,
                    category:category_id ( id, name ),
                    video_id,
                    thumbnail_url,
                    video_duration
                `,
            )
            .eq('created_by', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { success: true, message: 'No movements found', data: [] },
                { status: 200 },
            );
        }

        type MovementRow = {
            id: string;
            name: string;
            description: string | null;
            category: { id: string; name: string } | { id: string; name: string }[];
            created_by: string;
            video_id: string | null;
            thumbnail_url: string | null;
            video_duration: number | null;
        };

        const formattedData = data.map((m: MovementRow) => {
            const category =
                Array.isArray(m.category) && m.category.length > 0
                    ? m.category[0].name
                    : (m.category as { id: string; name: string })?.name || 'Uncategorized';

            return {
                id: m.id,
                name: m.name,
                description: m.description,
                category,
                video_id: m.video_id ?? null,
                thumbnail_url: m.thumbnail_url ?? null,
                duration: m.video_duration ?? null,
            };
        });

        return NextResponse.json(
            {
                success: true,
                message: 'User movements fetched successfully',
                data: formattedData,
            },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

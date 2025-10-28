// store a movement in database

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { CLOUDFLARE } from '@/lib/cloudflare';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const movementName = formData.get('movementName') as string;
        const category_id = formData.get('category') as string;
        const created_by = 'ed14d193-b06a-4961-a84e-d8341490abc0';
        const video_provider = 'cloudflare';
        const description = 'cloudFlare upload test';

        const cfReservedContainer = await CLOUDFLARE.createDirectUpload(600);
        const video_uid = cfReservedContainer.uid;
        const upload_url = cfReservedContainer.uploadURL;

        // video view url 
        const video_url = `https://iframe.videodelivery.net/${video_uid}`;

        const { data, error } = await supabaseAdmin.from("movements").insert([
            {
                name: movementName,
                description,
                video_provider,
                video_id: video_uid,
                video_url,
                created_by,
                category_id,
                thumbnail_url: `https://videodelivery.net/${video_uid}/thumbnails/thumbnail.jpg`
            },
        ]);

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Movement created successfully',
                uploadURL: upload_url,
                video_uid,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Error creating movement:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}

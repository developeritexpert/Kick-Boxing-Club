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

// interface MovementUpdate {
//     name?: string;
//     sub_category?: string;
//     category_id?: string;
//     description?: string;
//     video_provider?: string;
//     video_id?: string;
//     video_url?: string;
//     created_by?: string;
//     thumbnail_url?: string;
// }

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
            error instanceof Error ? error.message : typeof error === 'object' ? JSON.stringify(error) : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


// server side video upload
// export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
//     const { id } = await context.params;
//     if (!id) return NextResponse.json({ error: 'Movement ID required' }, { status: 400 });
//     try {
//         const formData = await req.formData();
//         const name = formData.get('name') as string;
//         const category_id = formData.get('category') as string;
//         const sub_category = formData.get('sub_category') as string;
//         const media = formData.get('media') as File | null;
//         // get movement data which need to be updated 
//         const { data: existing, error: fetchError } = await supabaseAdmin
//             .from("movements")
//             .select("*")
//             .eq("id", id)
//             .single();

//         if (fetchError || !existing) {
//             throw new Error("Movement not found");
//         }
//         let video_id = existing.video_id;
//         let video_url = existing.video_url;
//         let thumbnail_url = existing.thumbnail_url;

//         if (media) {
//             console.log("New media uploaded — creating Cloudflare direct upload URL");
//             const cfReservedContainer = await CLOUDFLARE.createDirectUpload(600);
//             const newVideoUID = cfReservedContainer.uid;
//             const uploadURL = cfReservedContainer.uploadURL;
//             const uploadForm = new FormData();
//             uploadForm.append("file", media);
//             const uploadRes = await fetch(uploadURL, {
//                 method: "POST",
//                 body: uploadForm,
//             });
//             if (!uploadRes.ok) {
//                 const text = await uploadRes.text();
//                 console.error("Cloudflare upload failed:", text);
//                 throw new Error(`Cloudflare upload failed: ${text}`);
//             }
//             video_id = newVideoUID;
//             video_url = `https://iframe.videodelivery.net/${newVideoUID}`;
//             thumbnail_url = `https://videodelivery.net/${newVideoUID}/thumbnails/thumbnail.jpg`;
//             // delete old video (need better error management but that task is for later)
//             if (existing.video_id) {
//                 await CLOUDFLARE.deleteVideoFromCloudflare(existing.video_id);
//             }
//         }
//         const updateData: MovementUpdate = {
//             name: name ?? existing.name,
//             sub_category: sub_category ?? existing.sub_category,
//             category_id: category_id ?? existing.category_id,
//             video_id,
//             video_url,
//             thumbnail_url,
//         };
//         Object.keys(updateData).forEach((key) => {
//             if (updateData[key as keyof MovementUpdate] == null) {
//                 delete updateData[key as keyof MovementUpdate];
//             }
//         });
//         const { data, error } = await supabaseAdmin
//             .from('movements')
//             .update(updateData)
//             .eq('id', id)
//             .select()
//             .single();

//         if (error) throw error;
//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Movement updated successfully",
//                 movement: data,
//             },
//             { status: 200 }
//         );
//         // return NextResponse.json({ movement: data }, { status: 200 });
//     } catch (error) {
//         console.error('PUT /api/admin/movement error:', error);
//         const message =
//             error instanceof Error
//                 ? error.message
//                 : typeof error === 'object'
//                     ? JSON.stringify(error)
//                     : String(error);
//         return NextResponse.json({ error: message }, { status: 500 });
//     }
// }

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    if (!id) return NextResponse.json({ error: 'Movement ID required' }, { status: 400 });

    // try {
    //     const { error } = await supabaseAdmin.from('movements').delete().eq('id', id);

    //     if (error) throw error;

    //     return NextResponse.json(
    //         { status: 'ok', message: 'Movement deleted successfully' },
    //         { status: 200 },
    //     );
    // } catch (error) {
    //     return NextResponse.json(
    //         { error: error instanceof Error ? error.message : String(error) },
    //         { status: 500 },
    //     );
    // }


    try {
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('movements')
            .select('id, video_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing)
            return NextResponse.json(
                { error: fetchError?.message || 'Movement not found' },
                { status: 404 }
            );

        if (existing.video_id) {
            try {
                await CLOUDFLARE.deleteVideoFromCloudflare(existing.video_id);
            } catch (error) {
                console.error('Cloudflare video delete failed:', error);
            }
        }

        const { error: deleteError } = await supabaseAdmin
            .from('movements')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        return NextResponse.json(
            { status: 'ok', message: 'Movement deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Movement delete error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';

function verifyWebhookSignature(
    body: string,
    timestamp: string,
    signature: string,
    secret: string,
): boolean {
    try {
        const payload = `${timestamp}.${body}`;
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        const signatureBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (signatureBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);

        // const signature = req.headers.get("webhook-signature");
        // const timestamp = req.headers.get("webhook-timestamp");
        const signature =
            req.headers.get('Webhook-Signature') || req.headers.get('webhook-signature');
        const timestamp =
            req.headers.get('Webhook-Timestamp') || req.headers.get('webhook-timestamp');

        const secret = process.env.CLOUDFLARE_WEBHOOK_SECRET;

        if (secret && signature && timestamp) {
            const isValid = verifyWebhookSignature(rawBody, timestamp, signature, secret);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        console.log('Cloudflare webhook received:', JSON.stringify(body, null, 2));

        const eventType = body?.event?.type || body?.type;
        const video = body?.video || body?.data || body;

        if (!video?.uid) {
            console.warn('Unexpected webhook payload:', body);
            return NextResponse.json({ message: 'No video UID found' }, { status: 200 });
        }

        if (eventType !== 'video.ready' && video?.status?.state !== 'ready') {
            return NextResponse.json(
                {
                    message: 'Video not ready, skipping',
                    received: true,
                },
                { status: 200 },
            );
        }

        const video_uid = video.uid || video.id;
        // const duration = video.duration;
        const duration = Math.round(video.duration || 0);
        const thumbnail_url =
            video.thumbnail || `https://videodelivery.net/${video_uid}/thumbnails/thumbnail.jpg`;

        console.log('Updating Supabase:', { video_uid, duration, thumbnail_url });

        if (!video_uid) {
            console.error('Missing video UID in webhook payload');
            return NextResponse.json(
                {
                    error: 'Missing video UID',
                    received: true,
                },
                { status: 400 },
            );
        }

        const { error: updateError } = await supabaseAdmin
            .from('movements')
            .update({
                video_duration: duration,
                thumbnail_url: thumbnail_url,
                status: 'approved',
            })
            .eq('video_id', video_uid);

        if (updateError) {
            console.error('Error updating Supabase:', updateError);
            return NextResponse.json(
                {
                    error: updateError.message,
                    received: true,
                },
                { status: 500 },
            );
        }

        console.log(`Successfully updated video ${video_uid}`);
        return NextResponse.json(
            {
                success: true,
                message: 'Movement updated successfully',
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Cloudflare webhook error:', error);
        return NextResponse.json(
            {
                error: (error as Error).message || 'Internal server error',
                received: true,
            },
            { status: 500 },
        );
    }
}

// import { NextRequest, NextResponse } from "next/server";
// import { supabaseAdmin } from "@/lib/supabaseAdmin";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     console.log(" Cloudflare webhook received:", JSON.stringify(body, null, 2));

//     const eventType = body?.event?.type || body?.type;
//     const video = body?.data?.video || body?.video || body?.data || body;

//     if (eventType !== "video.ready" && video?.status?.state !== "ready") {
//       return NextResponse.json({ message: "Video not ready, skipping" }, { status: 200 });
//     }

//     const video_uid = video.uid || video.id;
//     const duration = video.duration;
//     const thumbnail_url =
//       video.thumbnail || `https://videodelivery.net/${video_uid}/thumbnails/thumbnail.jpg`;

//     if (!video_uid) {
//       console.error(" Missing video UID in webhook payload");
//       return NextResponse.json({ error: "Missing video UID" }, { status: 400 });
//     }

//     const { error: updateError } = await supabaseAdmin
//       .from("movements")
//       .update({
//         video_duration: duration,
//         thumbnail_url,
//         status: "approved",
//       })
//       .eq("video_id", video_uid);

//     if (updateError) {
//       console.error(" Error updating Supabase:", updateError);
//       return NextResponse.json({ error: updateError.message }, { status: 500 });
//     }

//     console.log(` Successfully updated video ${video_uid}`);
//     return NextResponse.json({ success: true, message: "Movement updated successfully" }, { status: 200 });
//   } catch (error) {
//     console.error(" Cloudflare webhook error:", error);
//     return NextResponse.json(
//       { error: (error as Error).message || "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// store a movement in database


import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const movementName = formData.get("movementName") as string;
    // const category = formData.get("category") as string;
    // const videoFile = formData.get("video") as File | null;

    const description = "test";
    const video_provider = "cloudflare";
    const video_id = "test";
    const video_url = "test";
    const created_by = "4f1a65e9-4bd8-4426-b4a8-bc2aae9784cc";

    
    // CLOUDFLARE
    // if (videoFile) {
    //   try {
    //     const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    //     const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN!;
    //
    //     // Create a direct upload URL
    //     const directUploadRes = await fetch(
    //       `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/stream/direct_upload`,
    //       {
    //         method: "POST",
    //         headers: {
    //           Authorization: `Bearer ${cloudflareToken}`,
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //           maxDurationSeconds: 600, // optional
    //           meta: { name: movementName },
    //         }),
    //       }
    //     );
    //
    //     const directUploadData = await directUploadRes.json();
    //     const uploadURL = directUploadData.result.uploadURL;
    //
    //     //Upload the file to that URL
    //     const uploadRes = await fetch(uploadURL, {
    //       method: "PUT",
    //       body: videoFile,
    //     });
    //
    //     if (!uploadRes.ok) {
    //       throw new Error("Cloudflare upload failed");
    //     }
    //
    //     //Save the Cloudflare video UID and URL
    //     video_id = directUploadData.result.uid;
    //     video_url = `https://videodelivery.net/${video_id}/manifest/video.m3u8`;
    //
    //   } catch (cloudflareError: any) {
    //     console.error("Cloudflare upload failed:", cloudflareError);
    //     return NextResponse.json(
    //       { error: "Failed to upload to Cloudflare Stream" },
    //       { status: 500 }
    //     );
    //   }
    // }


    const { data, error } = await supabaseAdmin.from("movements").insert([
      {
        name: movementName,
        description,
        video_provider,
        video_id,
        video_url,
        created_by,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Movement created successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating movement:", error);
    // return NextResponse.json({ error: err.message }, { status: 500 });
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });

  }
}

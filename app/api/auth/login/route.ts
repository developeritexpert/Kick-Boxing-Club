import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    const userMetadata = authData.user.user_metadata || {};    

    const res = NextResponse.json({
      status: "ok",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        first_name: userMetadata.first_name || null,
        last_name: userMetadata.last_name || null,
        phone: userMetadata.phone || null,
        role: userMetadata.role || "user",
      },
      access_token: authData.session?.access_token || null, // optional if you need JWT
    });

    if (authData.session?.access_token) {
      res.cookies.set("sb-access-token", authData.session.access_token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return res;

    // code without jwt cookie set
    // const { data: metaData, error: metaError } = await supabaseAdmin
    //   .from("user_meta")
    //   .select("first_name, last_name, phone, role, email")
    //   .eq("user_id", authData.user.id)
    //   .single();

    // if (metaError) {
    //   return NextResponse.json({ error: metaError.message }, { status: 500 });
    // }

    // return NextResponse.json({
    //   status: "ok",
    //   user: {
    //     id: authData.user.id,
    //     email: authData.user.email,
    //     first_name: metaData?.first_name || null,
    //     last_name: metaData?.last_name || null,
    //     phone: metaData?.phone || null,
    //     role: metaData?.role || "user",
    //   },
    // });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

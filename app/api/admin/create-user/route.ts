import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.json();
  const { first_name, last_name, email, password, role } = body;

  if (!first_name || !last_name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {

    const { data: userResponse, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        first_name,
        last_name,
      },
    });

    if (createError || !userResponse?.user?.id) {
      return NextResponse.json({ error: createError?.message || 'Failed to create user.' }, { status: 500 });
    }

    const user_id = userResponse.user.id;

    const { error: insertError } = await supabaseAdmin.from('user_meta').insert([
      {
        user_id,
        first_name,
        last_name,
        email,
        role,
      },
    ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User created successfully.' }, { status: 200 });
  } catch (err) {
    console.error('User creation failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

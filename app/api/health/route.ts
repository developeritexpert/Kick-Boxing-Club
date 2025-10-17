import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase client not initialized')
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Server is healthy and Supabase client is ready',
    })
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Server health check failed',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}

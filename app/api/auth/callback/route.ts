import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const origin = new URL(req.url).origin

  if (code) {
    // Exchange the code — for OAuth flows
    // For now we use email/password so this is a placeholder
  }

  return NextResponse.redirect(`${origin}/chat`)
}

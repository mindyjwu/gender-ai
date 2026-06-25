import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  const db = serverClient()
  const { data, error } = await db
    .from('conversations')
    .select('id, title, total_picks, pinned, created_at, updated_at')
    .eq('user_id', userId)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversations: data })
}

export async function PATCH(req: NextRequest) {
  const { conversation_id, user_id, pinned } = await req.json() as {
    conversation_id: string
    user_id: string
    pinned: boolean
  }

  if (!conversation_id || !user_id) {
    return NextResponse.json({ error: 'Missing conversation_id or user_id' }, { status: 400 })
  }

  const db = serverClient()
  const { error } = await db
    .from('conversations')
    .update({ pinned })
    .eq('id', conversation_id)
    .eq('user_id', user_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { conversation_id, user_id } = await req.json() as {
    conversation_id: string
    user_id: string
  }

  if (!conversation_id || !user_id) {
    return NextResponse.json({ error: 'Missing conversation_id or user_id' }, { status: 400 })
  }

  const db = serverClient()
  const { error } = await db
    .from('conversations')
    .delete()
    .eq('id', conversation_id)
    .eq('user_id', user_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

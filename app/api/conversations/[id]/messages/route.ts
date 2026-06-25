import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase-server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const db = serverClient()

  const { data, error } = await db
    .from('messages')
    .select('id, turn_number, user_prompt, male_response, female_response, user_pick')
    .eq('conversation_id', id)
    .order('turn_number', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages: data })
}

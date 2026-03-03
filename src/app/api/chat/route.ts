import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const badWords = ['плохое', 'ужасное', 'отстой', ' garbage ', 'damn', 'shit']

function filterMessage(message: string): string {
  let filtered = message
  badWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '***')
  })
  return filtered
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')
  const limit = parseInt(searchParams.get('limit') || '50')

  if (!roomId) {
    return NextResponse.json({ error: 'roomId required' }, { status: 400 })
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ messages: [] })
  }

  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*, profiles(username, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Chat GET error:', error)
    return NextResponse.json({ messages: [] })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { roomId, userId, message } = body

  if (!roomId || !userId || !message?.trim()) {
    return NextResponse.json({ error: 'roomId, userId and message required' }, { status: 400 })
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    const filteredMessage = filterMessage(message.trim())

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: roomId,
        user_id: userId,
        message: filteredMessage
      }])
      .select('*, profiles(username, avatar_url)')
      .single()

    if (error) throw error

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error('Chat POST error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

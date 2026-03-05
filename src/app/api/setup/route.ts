import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function POST() {
  if (!serviceKey) {
    return NextResponse.json({ error: 'No service key' }, { status: 500 })
  }

  try {
    // Создаем таблицы
    const tables = [
      `CREATE TABLE IF NOT EXISTS playback_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        played_at TIMESTAMP DEFAULT NOW(),
        duration_played INTEGER DEFAULT 0
      )`,
      
      `CREATE TABLE IF NOT EXISTS favorite_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, room_id)
      )`,
      
      `ALTER TABLE playback_history ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE favorite_rooms ENABLE ROW LEVEL SECURITY`,
      
      `CREATE POLICY "playback_history_select" ON playback_history FOR SELECT USING (true)`,
      `CREATE POLICY "playback_history_insert" ON playback_history FOR INSERT WITH CHECK (true)`,
      `CREATE POLICY "favorite_rooms_select" ON favorite_rooms FOR SELECT USING (true)`,
      `CREATE POLICY "favorite_rooms_insert" ON favorite_rooms FOR INSERT WITH CHECK (true)`,
      `CREATE POLICY "favorite_rooms_delete" ON favorite_rooms FOR DELETE USING (true)`
    ]

    for (const sql of tables) {
      const { error } = await supabase.rpc('exec_sql', { sql_text: sql })
      if (error) {
        console.log('SQL result:', sql.substring(0, 50), error.message || 'ok')
      }
    }

    return NextResponse.json({ success: true, message: 'Tables created' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    url: supabaseUrl, 
    hasKey: !!serviceKey,
    keyPrefix: serviceKey.substring(0, 20) + '...'
  })
}

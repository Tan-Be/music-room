-- Таблица истории прослушиваний
CREATE TABLE IF NOT EXISTS playback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  played_at TIMESTAMP DEFAULT NOW(),
  duration_played INTEGER DEFAULT 0
);

-- Таблица избранных комнат
CREATE TABLE IF NOT EXISTS favorite_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

-- RLS политики для playback_history
ALTER TABLE playback_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playback history"
ON playback_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert playback history"
ON playback_history FOR INSERT
WITH CHECK (true);

-- RLS политики для favorite_rooms
ALTER TABLE favorite_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their favorite rooms"
ON favorite_rooms FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorite rooms"
ON favorite_rooms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorite rooms"
ON favorite_rooms FOR DELETE
USING (auth.uid() = user_id);

-- Включить Realtime для chat_messages (если ещё не включено)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Треки для общей очереди комнаты
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  artist VARCHAR NOT NULL,
  duration INTEGER,
  spotify_id VARCHAR,
  youtube_id VARCHAR,
  thumbnail_url TEXT,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Общая очередь комнаты
CREATE TABLE IF NOT EXISTS room_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracks"
ON tracks FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add tracks"
ON tracks FOR INSERT
WITH CHECK (auth.uid() = added_by OR added_by IS NULL);

CREATE POLICY "Anyone can view room queue"
ON room_queue FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add room queue items"
ON room_queue FOR INSERT
WITH CHECK (auth.uid() = added_by OR added_by IS NULL);

CREATE POLICY "Participants can remove room queue items"
ON room_queue FOR DELETE
USING (true);

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
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;

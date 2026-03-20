CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Треки для общей очереди комнаты
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  artist VARCHAR NOT NULL,
  duration INTEGER,
  spotify_id VARCHAR,
  youtube_id VARCHAR,
  thumbnail_url TEXT,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Общая очередь комнаты
CREATE TABLE IF NOT EXISTS public.room_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
  votes_up INTEGER NOT NULL DEFAULT 0,
  votes_down INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Поля текущего воспроизведения в rooms используются клиентом для синхронизации.
ALTER TABLE IF EXISTS public.rooms
  ADD COLUMN IF NOT EXISTS current_track_id UUID,
  ADD COLUMN IF NOT EXISTS is_playing BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rooms_current_track_id_fkey'
  ) THEN
    ALTER TABLE public.rooms
      ADD CONSTRAINT rooms_current_track_id_fkey
      FOREIGN KEY (current_track_id)
      REFERENCES public.tracks(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Комментарии к трекам внутри комнаты
CREATE TABLE IF NOT EXISTS public.track_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_track_comments_room_track_created
  ON public.track_comments (room_id, track_id, created_at);

ALTER TABLE public.track_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'track_comments'
      AND policyname = 'Anyone can view track comments'
  ) THEN
    CREATE POLICY "Anyone can view track comments"
      ON public.track_comments
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'track_comments'
      AND policyname = 'Anyone can add track comments'
  ) THEN
    CREATE POLICY "Anyone can add track comments"
      ON public.track_comments
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_room_queue_room_position
  ON public.room_queue (room_id, position);

CREATE INDEX IF NOT EXISTS idx_room_queue_track_id
  ON public.room_queue (track_id);

CREATE INDEX IF NOT EXISTS idx_tracks_youtube_id
  ON public.tracks (youtube_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_room_queue_room_position_unique
  ON public.room_queue (room_id, position);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_queue ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tracks'
      AND policyname = 'Anyone can view tracks'
  ) THEN
    CREATE POLICY "Anyone can view tracks"
      ON public.tracks
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tracks'
      AND policyname = 'Authenticated users can add tracks'
  ) THEN
    CREATE POLICY "Authenticated users can add tracks"
      ON public.tracks
      FOR INSERT
      WITH CHECK (auth.uid() = added_by OR added_by IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'room_queue'
      AND policyname = 'Anyone can view room queue'
  ) THEN
    CREATE POLICY "Anyone can view room queue"
      ON public.room_queue
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'room_queue'
      AND policyname = 'Authenticated users can add room queue items'
  ) THEN
    CREATE POLICY "Authenticated users can add room queue items"
      ON public.room_queue
      FOR INSERT
      WITH CHECK (auth.uid() = added_by OR added_by IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'room_queue'
      AND policyname = 'Participants can remove room queue items'
  ) THEN
    CREATE POLICY "Participants can remove room queue items"
      ON public.room_queue
      FOR DELETE
      USING (true);
  END IF;
END $$;

-- Таблица истории прослушиваний
CREATE TABLE IF NOT EXISTS public.playback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_played INTEGER NOT NULL DEFAULT 0
);

-- Таблица избранных комнат
CREATE TABLE IF NOT EXISTS public.favorite_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

ALTER TABLE public.playback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_rooms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'playback_history'
      AND policyname = 'Users can view their own playback history'
  ) THEN
    CREATE POLICY "Users can view their own playback history"
      ON public.playback_history
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'playback_history'
      AND policyname = 'Anyone can insert playback history'
  ) THEN
    CREATE POLICY "Anyone can insert playback history"
      ON public.playback_history
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'favorite_rooms'
      AND policyname = 'Users can view their favorite rooms'
  ) THEN
    CREATE POLICY "Users can view their favorite rooms"
      ON public.favorite_rooms
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'favorite_rooms'
      AND policyname = 'Users can add favorite rooms'
  ) THEN
    CREATE POLICY "Users can add favorite rooms"
      ON public.favorite_rooms
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'favorite_rooms'
      AND policyname = 'Users can remove favorite rooms'
  ) THEN
    CREATE POLICY "Users can remove favorite rooms"
      ON public.favorite_rooms
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'room_queue'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_queue;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'room_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'track_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.track_comments;
  END IF;
END $$;

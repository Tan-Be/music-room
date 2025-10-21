-- Пользователи (расширение auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  avatar_url TEXT,
  spotify_id VARCHAR,
  tracks_added_today INTEGER DEFAULT 0,
  last_track_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Функция для создания профиля пользователя
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id UUID, user_name VARCHAR)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (id, username, tracks_added_today, last_track_date)
  VALUES (user_id, user_name, 0, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комнаты
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  password_hash VARCHAR,
  max_participants INTEGER DEFAULT 10,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  current_track_id UUID,
  is_playing BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Участники комнат
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Треки (моковые данные)
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  artist VARCHAR NOT NULL,
  duration INTEGER NOT NULL, -- в секундах (макс 360 = 6 минут)
  thumbnail_url TEXT,
  spotify_id VARCHAR,
  youtube_id VARCHAR,
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Очередь треков в комнате
CREATE TABLE room_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  added_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Сообщения чата
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
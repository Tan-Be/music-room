-- SQL скрипт для автоматического создания профиля при регистрации пользователя
-- Выполните этот скрипт в SQL Editor вашего проекта Supabase

-- 1. Создаём функцию для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, spotify_id, tracks_added_today, last_track_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || substring(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'spotify_id',
    0,
    CURRENT_DATE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Создаём триггер, который вызывает функцию при создании нового пользователя
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Включаем Row Level Security (RLS) для таблицы profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Создаём политики доступа для profiles
-- Пользователи могут читать все профили
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Пользователи могут обновлять только свой профиль
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Пользователи могут вставлять только свой профиль
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Создаём индекс для быстрого поиска по username
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- 6. Проверяем, что всё работает
SELECT 'Profile trigger and policies created successfully!' as status;

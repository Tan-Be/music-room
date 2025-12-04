-- ============================================
-- Настройка Storage для аватаров пользователей
-- ============================================

-- 1. Создать bucket 'avatars' через UI:
-- https://supabase.com/dashboard/project/syxjqxfoycmttcmrasgq/storage/buckets
-- Name: avatars
-- Public bucket: ✅ (включить)

-- 2. Применить политики доступа:

-- Политика: Пользователи могут загружать свои аватары
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика: Пользователи могут обновлять свои аватары
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика: Пользователи могут удалять свои аватары
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика: Все могут просматривать аватары (публичный доступ)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- Проверка политик
-- ============================================

-- Посмотреть все политики для storage.objects:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- Тестирование
-- ============================================

-- После применения политик:
-- 1. Авторизоваться в приложении
-- 2. Открыть /profile
-- 3. Загрузить аватар
-- 4. Проверить что файл появился в Storage
-- 5. Проверить что аватар отображается

-- ============================================
-- Структура хранения
-- ============================================

-- Файлы хранятся в формате:
-- avatars/
--   {user_id}/
--     {timestamp}.{ext}
--
-- Например:
-- avatars/
--   550e8400-e29b-41d4-a716-446655440000/
--     1701532800000.jpg
--     1701619200000.png

-- ============================================
-- Очистка старых аватаров (опционально)
-- ============================================

-- Функция для удаления старых аватаров пользователя
CREATE OR REPLACE FUNCTION delete_old_avatars()
RETURNS TRIGGER AS $$
BEGIN
  -- Удаляем старый аватар если URL изменился
  IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
    -- Извлекаем путь из URL
    DECLARE
      old_path TEXT;
    BEGIN
      old_path := substring(OLD.avatar_url from 'avatars/.*');
      IF old_path IS NOT NULL THEN
        -- Удаляем файл из Storage
        PERFORM storage.delete_object('avatars', old_path);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического удаления старых аватаров
CREATE TRIGGER on_avatar_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.avatar_url IS DISTINCT FROM NEW.avatar_url)
  EXECUTE FUNCTION delete_old_avatars();

-- ============================================
-- Примечания
-- ============================================

-- 1. Bucket должен быть публичным для отображения аватаров
-- 2. Политики ограничивают загрузку/удаление только своими файлами
-- 3. Максимальный размер файла настраивается в приложении (2MB)
-- 4. Поддерживаемые форматы: JPG, PNG, GIF
-- 5. Старые аватары автоматически удаляются при загрузке новых

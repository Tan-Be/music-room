-- RLS (Row Level Security) политики для Music Room

-- Включаем RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы profiles (профили пользователей)
-- Пользователи могут читать свои собственные профили
CREATE POLICY "Пользователи могут просматривать свои профили" 
ON profiles FOR SELECT 
USING (id = auth.uid());

-- Пользователи могут обновлять свои собственные профили
CREATE POLICY "Пользователи могут обновлять свои профили" 
ON profiles FOR UPDATE 
USING (id = auth.uid());

-- Пользователи могут создавать только свои собственные профили (через функцию)
CREATE POLICY "Пользователи могут создавать свои профили" 
ON profiles FOR INSERT 
WITH CHECK (id = auth.uid());

-- Политики для таблицы rooms (комнаты)
-- Все пользователи могут просматривать публичные комнаты
CREATE POLICY "Пользователи могут просматривать публичные комнаты" 
ON rooms FOR SELECT 
USING (is_public = true);

-- Владельцы комнат могут просматривать свои приватные комнаты
CREATE POLICY "Владельцы могут просматривать свои комнаты" 
ON rooms FOR SELECT 
USING (owner_id = auth.uid());

-- Участники комнат могут просматривать комнаты, в которых они состоят
CREATE POLICY "Участники могут просматривать свои комнаты" 
ON rooms FOR SELECT 
USING (id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid()));

-- Аутентифицированные пользователи могут создавать комнаты
CREATE POLICY "Пользователи могут создавать комнаты" 
ON rooms FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Владельцы могут обновлять свои комнаты
CREATE POLICY "Владельцы могут обновлять свои комнаты" 
ON rooms FOR UPDATE 
USING (owner_id = auth.uid());

-- Владельцы могут удалять свои комнаты
CREATE POLICY "Владельцы могут удалять свои комнаты" 
ON rooms FOR DELETE 
USING (owner_id = auth.uid());

-- Политики для таблицы room_participants (участники комнат)
-- Пользователи могут просматривать участников комнат, в которых они состоят
CREATE POLICY "Участники могут просматривать участников своих комнат" 
ON room_participants FOR SELECT 
USING (room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid() 
                   OR id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())));

-- Пользователи могут добавлять себя в комнаты (если имеют доступ)
CREATE POLICY "Пользователи могут присоединяться к комнатам" 
ON room_participants FOR INSERT 
WITH CHECK (user_id = auth.uid() AND 
            (room_id IN (SELECT id FROM rooms WHERE is_public = true) OR
             room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid())));

-- Пользователи могут покидать комнаты
CREATE POLICY "Пользователи могут покидать комнаты" 
ON room_participants FOR DELETE 
USING (user_id = auth.uid());

-- Владельцы комнат могут удалять участников
CREATE POLICY "Владельцы могут удалять участников" 
ON room_participants FOR DELETE 
USING (room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

-- Политики для таблицы tracks (треки)
-- Все пользователи могут просматривать треки
CREATE POLICY "Пользователи могут просматривать треки" 
ON tracks FOR SELECT 
USING (true);

-- Аутентифицированные пользователи могут добавлять треки
CREATE POLICY "Пользователи могут добавлять треки" 
ON tracks FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND added_by = auth.uid());

-- Пользователи могут обновлять свои треки
CREATE POLICY "Пользователи могут обновлять свои треки" 
ON tracks FOR UPDATE 
USING (added_by = auth.uid());

-- Пользователи могут удалять свои треки
CREATE POLICY "Пользователи могут удалять свои треки" 
ON tracks FOR DELETE 
USING (added_by = auth.uid());

-- Политики для таблицы room_queue (очередь треков)
-- Участники комнат могут просматривать очередь треков
CREATE POLICY "Участники могут просматривать очередь треков" 
ON room_queue FOR SELECT 
USING (room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid()) OR
       room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

-- Участники комнат могут добавлять треки в очередь
CREATE POLICY "Участники могут добавлять треки в очередь" 
ON room_queue FOR INSERT 
WITH CHECK (added_by = auth.uid() AND 
            (room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid()) OR
             room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid())));

-- Владельцы комнат и модераторы могут удалять треки из очереди
CREATE POLICY "Модераторы могут удалять треки из очереди" 
ON room_queue FOR DELETE 
USING (room_id IN (SELECT r.id FROM rooms r 
                   JOIN room_participants rp ON r.id = rp.room_id 
                   WHERE rp.user_id = auth.uid() AND rp.role IN ('owner', 'moderator')) OR
       room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

-- Политики для таблицы chat_messages (сообщения чата)
-- Участники комнат могут просматривать сообщения чата
CREATE POLICY "Участники могут просматривать сообщения чата" 
ON chat_messages FOR SELECT 
USING (room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid()) OR
       room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

-- Участники комнат могут отправлять сообщения
CREATE POLICY "Участники могут отправлять сообщения" 
ON chat_messages FOR INSERT 
WITH CHECK (user_id = auth.uid() AND 
            (room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid()) OR
             room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid())));

-- Пользователи могут удалять свои сообщения
CREATE POLICY "Пользователи могут удалять свои сообщения" 
ON chat_messages FOR DELETE 
USING (user_id = auth.uid());

-- Владельцы комнат и модераторы могут удалять любые сообщения
CREATE POLICY "Модераторы могут удалять сообщения" 
ON chat_messages FOR DELETE 
USING (room_id IN (SELECT r.id FROM rooms r 
                   JOIN room_participants rp ON r.id = rp.room_id 
                   WHERE rp.user_id = auth.uid() AND rp.role IN ('owner', 'moderator')) OR
       room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));
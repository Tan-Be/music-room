# System Patterns - Music Room

## Архитектурный срез
- Frontend: Next.js App Router, почти все пользовательские экраны рендерятся как client components.
- Auth: NextAuth с GitHub provider, а server-side мост в `src/lib/supabase-admin.ts` синхронизирует OAuth-пользователя с `profiles` в Supabase.
- Data layer: Supabase client на фронтенде и в route handlers.
- Fallback layer: localStorage для демо-режима, если Supabase отсутствует или недоступен.

## Основные паттерны

### 1. Client-first страницы
- Маршруты в `src/app` используют `useState`, `useEffect`, `useSession`.
- Это упрощает работу с сессией, localStorage и браузерными API, но повышает зависимость от клиентского окружения.

### 2. API wrappers вокруг Supabase
- В `src/lib/supabase.ts` собраны `roomsApi`, `queueApi` и `profilesApi`.
- Страницы используют эти обертки вместо повторения запросов в каждом компоненте.

### 2a. Deterministic profile bridge
- `src/app/api/auth/[...nextauth]/route.ts` больше не кладёт GitHub numeric id напрямую в `session.user.id`.
- Для GitHub-аккаунта вычисляется детерминированный UUID, совместимый с `profiles.id`, и при входе через service role создаётся или обновляется запись профиля в Supabase.
- Это устраняет падение создания комнаты, когда `rooms.owner_id` ожидал UUID, а сессия несла GitHub provider id.

### 3. Realtime room state
- Общая очередь комнаты хранится в `room_queue`, метаданные треков - в `tracks`.
- Текущий трек и флаг воспроизведения хранятся в `rooms.current_track_id` и `rooms.is_playing`.
- `src/components/music-player.tsx` подписывается на `room_queue` и `rooms` через Supabase Realtime и обновляет локальный UI по серверному состоянию.

### 4. Realtime chat
- `src/app/api/chat/route.ts` остается thin backend для загрузки истории и отправки сообщений.
- `src/components/chat.tsx` использует Realtime-подписку на `chat_messages` для мгновенного обновления UI.

### 5. Server-backed track comments
- `src/app/api/track-comments/route.ts` выступает thin backend для чтения и записи комментариев к трекам.
- `src/components/music-player.tsx` подписывается на `track_comments` через Supabase Realtime и группирует комментарии по `track_id`.
- В demo-режиме комментарии остаются локальными внутри `localStorage` вместе с демо-очередью.

### 6. Graceful degradation
- Если `isSupabaseConfigured()` возвращает `false`, сценарии комнаты переходят в локальный режим.
- В демо-режиме очередь и комментарии к трекам живут в `localStorage`.
- Даже при включённом Supabase проект пока не использует полноценный Supabase Auth на клиенте, поэтому вставки треков пишут `added_by = null`, чтобы не конфликтовать с текущими RLS-условиями по `auth.uid()`.
- По этой же причине чтение и запись комнат зависят от явных permissive RLS-политик на `rooms` и `room_participants`; при их отсутствии UI ошибочно сваливается в demo fallback.

## Карта модулей
- `src/app/page.tsx`: главная страница, навигационные карточки, рекомендации и быстрый OAuth-вход.
- `src/app/rooms/page.tsx`: список комнат, голосование, создание, удаление, демо-режим.
- `src/app/room/[id]/page.tsx`: страница комнаты, участие, QR-код, чат, список участников, Realtime-подписки на комнату.
- `src/components/music-player.tsx`: общая очередь, комментарии к трекам, выбор текущего трека, fallback-логика демо-режима.
- `src/components/chat.tsx`: Realtime-чат комнаты.
- `src/lib/supabase.ts`: типы Supabase и клиентские API для комнат, очереди и профилей.
- `src/lib/supabase-admin.ts`: server-side синхронизация NextAuth-пользователя с Supabase `profiles`.
- `src/app/api/track-comments/route.ts`: загрузка и отправка комментариев к трекам.

## Известные архитектурные ограничения
- YouTube `iframe` не позволяет точно синхронизировать прогресс воспроизведения между участниками на уровне таймкода.
- Часть продукта использует mixed strategy: база данных для комнаты и чата, localStorage для части второстепенных сценариев демо-режима.

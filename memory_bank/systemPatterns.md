# System Patterns - Music Room

## Архитектурный срез
- Frontend: Next.js App Router, почти все пользовательские экраны рендерятся как client components.
- Auth: NextAuth с GitHub provider и пользовательской сессией на клиенте.
- Data layer: Supabase client на фронтенде и в route handlers.
- Fallback layer: localStorage для демо-режима, если Supabase отсутствует или недоступен.

## Основные паттерны

### 1. Client-first страницы
- Маршруты в `src/app` используют `useState`, `useEffect`, `useSession`.
- Это упрощает работу с сессией, localStorage и браузерными API, но повышает зависимость от клиентского окружения.

### 2. API wrappers вокруг Supabase
- В `src/lib/supabase.ts` собраны `roomsApi`, `queueApi` и `profilesApi`.
- Страницы используют эти обертки вместо повторения запросов в каждом компоненте.

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

## Карта модулей
- `src/app/page.tsx`: главная страница, навигационные карточки, рекомендации и быстрый OAuth-вход.
- `src/app/rooms/page.tsx`: список комнат, голосование, создание, удаление, демо-режим.
- `src/app/room/[id]/page.tsx`: страница комнаты, участие, QR-код, чат, список участников, Realtime-подписки на комнату.
- `src/components/music-player.tsx`: общая очередь, комментарии к трекам, выбор текущего трека, fallback-логика демо-режима.
- `src/components/chat.tsx`: Realtime-чат комнаты.
- `src/lib/supabase.ts`: типы Supabase и клиентские API для комнат, очереди и профилей.
- `src/app/api/track-comments/route.ts`: загрузка и отправка комментариев к трекам.

## Известные архитектурные ограничения
- YouTube `iframe` не позволяет точно синхронизировать прогресс воспроизведения между участниками на уровне таймкода.
- Часть продукта использует mixed strategy: база данных для комнаты и чата, localStorage для части второстепенных сценариев демо-режима.

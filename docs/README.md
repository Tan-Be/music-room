# Music Room Architecture

## Назначение
`Music Room` - клиентское веб-приложение на Next.js для музыкальных комнат с GitHub-аутентификацией, общей очередью треков, realtime-чатом и fallback-режимом без Supabase.

## Архитектура
- `src/app` содержит маршруты App Router и API route handlers.
- `src/components` содержит основные UI-виджеты: чат, плеер, рекомендации, фон, OAuth-кнопки.
- `src/lib/supabase.ts` инкапсулирует клиент Supabase и базовые операции с комнатами, очередью и профилями.
- `src/lib/auth-context.tsx` хранит клиентскую сессию Supabase Auth, запускает GitHub OAuth и предоставляет текущего пользователя UI-компонентам.
- Route handler `src/app/api/recommendations/route.ts` отдает рекомендации комнат по истории пользователя.
- `localStorage` используется как fallback-хранилище для демо-режима и комментариев к трекам только вне Supabase-режима.

## Основные маршруты
- `/` - главная страница с переходами к комнатам, рейтингу, регистрации, профилю и рекомендациям.
- `/rooms` - список комнат, создание, голосование и удаление.
- `/room/[id]` - комната с общим плеером, QR-приглашением, списком участников и чатом.
- `/profile` - профиль пользователя, история и избранное.
- `/rating` - рейтинг комнат.
- `/register`, `/auth/signin`, `/auth/callback`, `/auth/error` - сценарии входа, OAuth callback и регистрации.

## Серверные маршруты
- `api/recommendations` - рекомендации комнат по истории пользователя.
- `api/setup` - технический setup-роут проекта.

## Ключевые решения
- UI в основном реализован через client components и inline styles.
- При отсутствии корректных env-переменных Supabase интерфейс переходит в demo-режим.
- GitHub OAuth выполняется через Supabase Auth; `auth.users.id` напрямую используется как `profiles.id`, `rooms.owner_id`, `room_participants.user_id`, `chat_messages.user_id`, `tracks.added_by`, `room_queue.added_by` и `track_comments.user_id`.
- Профиль пользователя создается автоматически триггером `on_auth_user_created` и дополнительно гарантируется клиентским `profilesApi.ensureProfile()` на странице `/profile`.
- Состояние комнаты разделено на два слоя:
  - `rooms.current_track_id` и `rooms.is_playing` хранят текущее состояние воспроизведения.
  - `room_queue` + `tracks` хранят общую очередь комнаты.
- `src/components/music-player.tsx` подписывается на `room_queue` и `rooms` через Supabase Realtime.
- Модель трека в `tracks` поддерживает несколько источников воспроизведения: YouTube через `youtube_id` и прямые аудио-ссылки через `audio_url` + `source_type`.
- Комментарии к трекам хранятся в `track_comments`, записываются клиентом через Supabase Auth/RLS и обновляются через Supabase Realtime.
- `src/components/chat.tsx` использует Supabase Realtime для мгновенного обновления чата вместо polling; отправка сообщений идет напрямую в Supabase с пользовательским JWT.
- `src/app/room/[id]/page.tsx` подписывается на изменения `room_participants` и `rooms`, чтобы состав комнаты и состояние комнаты обновлялись без ручной перезагрузки.
- Клиент работает с полноценным Supabase Auth-токеном, поэтому RLS-политики используют `(select auth.uid())` для операций пользователя.

## Текущие ограничения
- YouTube воспроизводится через `iframe`, поэтому синхронизация текущего трека и запуска общая, но точный таймкод между участниками ещё не синхронизируется.
- Прямые аудио-ссылки должны указывать на публично доступный файл (`.mp3`, `.ogg`, `.wav`, `.m4a`, `.aac`, `.flac`); страницы SoundCloud/Spotify/Bandcamp этим режимом не поддерживаются.
- Для полной работы синхронизации в Supabase должны существовать таблицы `tracks`, `room_queue`, `track_comments` и публикации Realtime для `rooms`, `room_queue`, `room_participants`, `chat_messages`, `track_comments`.
- Текущий клиентский слой читает и создаёт комнаты напрямую через Supabase JS, поэтому в схеме также обязательны RLS-политики для `rooms` и `room_participants`; без них UI может ошибочно скатиться в demo fallback.
- Для GitHub OAuth в Supabase Dashboard должен быть включен GitHub provider, а redirect URL приложения должен вести на `/auth/callback`.

## Связанные документы
- [PRD](./PRD.md)
- [План развития](./development_plan.md)
- [Настройка базы](./database-setup.sql)
- [Исправление сохранения комнат](./room-persistence-fix.md)
- [Настройка GitHub OAuth](./github-oauth-complete-setup.md)

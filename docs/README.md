# Music Room Architecture

## Назначение
`Music Room` - клиентское веб-приложение на Next.js для музыкальных комнат с GitHub-аутентификацией, общей очередью треков, realtime-чатом и fallback-режимом без Supabase.

## Архитектура
- `src/app` содержит маршруты App Router и API route handlers.
- `src/components` содержит основные UI-виджеты: чат, плеер, рекомендации, фон, OAuth-кнопки.
- `src/lib/supabase.ts` инкапсулирует клиент Supabase и базовые операции с комнатами, очередью и профилями.
- `src/lib/supabase-admin.ts` синхронизирует GitHub-пользователя NextAuth с записью `profiles` в Supabase через server-side service role client.
- Route handlers `src/app/api/chat/route.ts` и `src/app/api/track-comments/route.ts` работают как тонкий серверный слой для сообщений комнаты и комментариев к трекам.
- `localStorage` используется как fallback-хранилище для демо-режима и комментариев к трекам только вне Supabase-режима.

## Основные маршруты
- `/` - главная страница с переходами к комнатам, рейтингу, регистрации, профилю и рекомендациям.
- `/rooms` - список комнат, создание, голосование и удаление.
- `/room/[id]` - комната с общим плеером, QR-приглашением, списком участников и чатом.
- `/profile` - профиль пользователя, история и избранное.
- `/rating` - рейтинг комнат.
- `/register`, `/auth/signin`, `/auth/error` - сценарии входа и регистрации.

## Серверные маршруты
- `api/auth/[...nextauth]` - конфигурация NextAuth и GitHub OAuth с синхронизацией deterministic UUID профиля в Supabase.
- `api/chat` - чтение истории и отправка сообщений комнаты.
- `api/recommendations` - рекомендации комнат по истории пользователя.
- `api/track-comments` - загрузка и отправка комментариев к трекам комнаты.
- `api/setup` - технический setup-роут проекта.

## Ключевые решения
- UI в основном реализован через client components и inline styles.
- При отсутствии корректных env-переменных Supabase интерфейс переходит в demo-режим.
- NextAuth хранит в сессии не GitHub numeric id, а детерминированный UUID профиля Supabase, чтобы комнаты, участники и комментарии ссылались на совместимый `profiles.id`.
- Состояние комнаты разделено на два слоя:
  - `rooms.current_track_id` и `rooms.is_playing` хранят текущее состояние воспроизведения.
  - `room_queue` + `tracks` хранят общую очередь комнаты.
- `src/components/music-player.tsx` подписывается на `room_queue` и `rooms` через Supabase Realtime.
- Модель трека в `tracks` поддерживает несколько источников воспроизведения: YouTube через `youtube_id` и прямые аудио-ссылки через `audio_url` + `source_type`.
- Комментарии к трекам хранятся в `track_comments`, загружаются через `api/track-comments` и обновляются через Supabase Realtime.
- `src/components/chat.tsx` использует Supabase Realtime для мгновенного обновления чата вместо polling.
- `src/app/room/[id]/page.tsx` подписывается на изменения `room_participants` и `rooms`, чтобы состав комнаты и состояние комнаты обновлялись без ручной перезагрузки.
- Пока проект остаётся на NextAuth без полноценного Supabase Auth-токена на клиенте, `tracks.added_by` и `room_queue.added_by` при клиентской вставке остаются `null`, чтобы не ломать текущие RLS-политики.

## Текущие ограничения
- YouTube воспроизводится через `iframe`, поэтому синхронизация текущего трека и запуска общая, но точный таймкод между участниками ещё не синхронизируется.
- Прямые аудио-ссылки должны указывать на публично доступный файл (`.mp3`, `.ogg`, `.wav`, `.m4a`, `.aac`, `.flac`); страницы SoundCloud/Spotify/Bandcamp этим режимом не поддерживаются.
- Для полной работы синхронизации в Supabase должны существовать таблицы `tracks`, `room_queue`, `track_comments` и публикации Realtime для `rooms`, `room_queue`, `room_participants`, `chat_messages`, `track_comments`.
- Текущий клиентский слой читает и создаёт комнаты напрямую через Supabase JS, поэтому в схеме также обязательны RLS-политики для `rooms` и `room_participants`; без них UI может ошибочно скатиться в demo fallback.
- Server-side синхронизация профиля требует `SUPABASE_SERVICE_ROLE_KEY` наряду с публичными `NEXT_PUBLIC_SUPABASE_*` переменными.

## Связанные документы
- [PRD](./PRD.md)
- [План развития](./development_plan.md)
- [Настройка базы](./database-setup.sql)
- [Исправление сохранения комнат](./room-persistence-fix.md)
- [Настройка GitHub OAuth](./github-oauth-complete-setup.md)

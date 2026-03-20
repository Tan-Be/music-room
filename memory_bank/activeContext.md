# Active Context - Music Room

**Дата последнего обновления**: 2026-03-20

## Текущий фокус
- Реальная синхронизация комнаты между участниками запущена через серверное состояние и Supabase Realtime.
- Общая очередь комнаты и текущий трек вынесены из локального состояния браузера в общую модель комнаты.
- Память проекта и архитектурная документация синхронизированы с новым устройством комнаты.

## Что проверено в этой сессии
- Комната в [page.tsx](C:/Users/Admin/Documents/Веркин/music-room/src/app/room/[id]/page.tsx) теперь подписывается на изменения `room_participants` и `rooms`.
- Плеер в [music-player.tsx](C:/Users/Admin/Documents/Веркин/music-room/src/components/music-player.tsx) использует `room_queue`, `tracks` и `rooms.current_track_id`.
- Чат в [chat.tsx](C:/Users/Admin/Documents/Веркин/music-room/src/components/chat.tsx) переведен на Supabase Realtime.
- Проверка `bun run type-check` прошла успешно.
- Проверка `bunx @biomejs/biome check --write` по измененным не-Markdown-файлам прошла успешно.

## Актуальная картина системы
- Приложение построено на Next.js App Router и использует маршруты `/`, `/rooms`, `/room/[id]`, `/rating`, `/profile`, `/register`, `/auth/signin`, `/auth/error`.
- Серверные route handlers находятся в `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/chat/route.ts`, `src/app/api/recommendations/route.ts`.
- Доступ к данным Supabase и обертки для работы с комнатами, очередью и профилями сосредоточены в `src/lib/supabase.ts`.
- Основное состояние комнаты теперь синхронизируется через Supabase, а `localStorage` остается fallback-слоем для demo-режима и локальных комментариев.

## Активные решения
- Реальная синхронизация комнаты строится на `tracks`, `room_queue`, `rooms.current_track_id` и `rooms.is_playing`.
- Demo-режим сохраняется как fallback, но основная логика комнаты должна работать через Supabase.
- Realtime используется для комнаты и чата, а не только для уведомлений.

## Открытые вопросы и риски
- В `package.json` указан `packageManager: pnpm`, хотя репозиторное правило требует использовать `bun`.
- YouTube `iframe` ограничивает точную синхронизацию таймкода между участниками.
- Комментарии к трекам пока не имеют серверной модели и остаются локальными.
- Для полной работы новой логики в Supabase должны существовать таблицы `tracks`, `room_queue` и публикации Realtime.

## Следующее действие
- Завершить SQL-инициализацию `tracks` и `room_queue` в среде Supabase.
- Следующим шагом выбрать между серверной моделью комментариев к трекам и точной синхронизацией playback state.

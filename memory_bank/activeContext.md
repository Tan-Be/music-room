# Active Context - Music Room

**Дата последнего обновления**: 2026-03-24

## Текущий фокус
- Реальная синхронизация комнаты между участниками запущена через серверное состояние и Supabase Realtime.
- Общая очередь комнаты и текущий трек вынесены из локального состояния браузера в общую модель комнаты.
- Комментарии к трекам переведены на серверную модель для Supabase-режима, а память проекта и архитектурная документация синхронизируются с этим изменением.
- В работе устранение расхождения между NextAuth GitHub session id и UUID-профилями Supabase, из-за которого новые комнаты откатывались в demo fallback.

## Что проверено в этой сессии
- Комната в [page.tsx](C:/Users/Admin/Documents/Веркин/music-room/src/app/room/[id]/page.tsx) теперь подписывается на изменения `room_participants` и `rooms`.
- Страница комнаты больше не отправляет не-UUID demo-id в Supabase: старые локальные комнаты корректно открываются через `localStorage` fallback вместо ошибки `invalid input syntax for type uuid`.
- После создания комнаты маршрут сохраняет локальную ownership-метку, а страница комнаты скрывает кнопку `Присоединиться` для создателя даже при расхождении данных Supabase и сессии.
- `api/auth/[...nextauth]` теперь синхронизирует GitHub-пользователя с `profiles` через детерминированный UUID и server-side Supabase client.
- В `docs/database-setup.sql` добавлены недостающие RLS-политики для `rooms` и `room_participants`, потому что без них клиентские запросы списка комнат и присоединения уходят в demo fallback.
- Плеер в [music-player.tsx](C:/Users/Admin/Documents/Веркин/music-room/src/components/music-player.tsx) использует `room_queue`, `tracks` и `rooms.current_track_id`.
- Чат в [chat.tsx](C:/Users/Admin/Documents/Веркин/music-room/src/components/chat.tsx) переведен на Supabase Realtime.
- Скрипт [database-setup.sql](C:/Users/Admin/Documents/Веркин/music-room/docs/database-setup.sql) приведен к актуальной модели комнаты: добавлены `rooms.current_track_id`, `rooms.is_playing`, индексы и безопасное повторное создание политик/Realtime-публикаций.
- Добавлен route handler [route.ts](C:/Users/Admin/Documents/Веркин/music-room/src/app/api/track-comments/route.ts) для чтения и записи комментариев к трекам.
- Плеер теперь подписывается на `track_comments` и показывает общие комментарии к трекам в Supabase-режиме.
- Проверка `bun run type-check` прошла успешно.
- Проверка `bunx @biomejs/biome check --write` по измененным TypeScript-файлам прошла успешно.
- Проверка `bunx @biomejs/biome check --write` для измененного SQL-файла не дала исправлений: файл не обрабатывается Biome как поддерживаемый формат.

## Актуальная картина системы
- Приложение построено на Next.js App Router и использует маршруты `/`, `/rooms`, `/room/[id]`, `/rating`, `/profile`, `/register`, `/auth/signin`, `/auth/error`.
- Серверные route handlers находятся в `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/chat/route.ts`, `src/app/api/recommendations/route.ts`.
- Доступ к данным Supabase и обертки для работы с комнатами, очередью и профилями сосредоточены в `src/lib/supabase.ts`, а server-side синхронизация профиля вынесена в `src/lib/supabase-admin.ts`.
- Основное состояние комнаты теперь синхронизируется через Supabase, а `localStorage` остается fallback-слоем для demo-режима и локальных комментариев.

## Активные решения
- Реальная синхронизация комнаты строится на `tracks`, `room_queue`, `rooms.current_track_id` и `rooms.is_playing`.
- Комментарии к трекам в Supabase-режиме хранятся в `track_comments` и загружаются через `api/track-comments`, а в demo-режиме остаются локальными.
- Страница комнаты различает серверные UUID-комнаты и старые локальные demo-комнаты с числовыми id.
- Для newly created room ownership используется дополнительная локальная метка `ownedRoomIds`, чтобы не показывать владельцу лишнее действие присоединения.
- Demo-режим сохраняется как fallback, но основная логика комнаты должна работать через Supabase.
- Realtime используется для комнаты и чата, а не только для уведомлений.
- Сессия NextAuth должна нести UUID из `profiles.id`, а не GitHub numeric id, иначе создание серверной комнаты падает на UUID/FK-проверках.
- Пока клиентский слой не переведен на Supabase Auth, вставки в `tracks` и `room_queue` остаются совместимыми с RLS за счет `added_by = null`.

## Открытые вопросы и риски
- В `package.json` указан `packageManager: pnpm`, хотя репозиторное правило требует использовать `bun`.
- YouTube `iframe` ограничивает точную синхронизацию таймкода между участниками.
- Обновленный SQL-скрипт нужно применить в среде Supabase, иначе серверные комментарии к трекам и синхронизация комнаты останутся зависимыми от ручной настройки базы.
- У комментариев к трекам пока нет сценариев редактирования и удаления.
- Исторически GitHub OAuth через NextAuth не создавал совместимый UUID-профиль в Supabase, поэтому создание комнаты могло тихо падать и уходить в demo-режим.
- До добавления политик для `rooms` и `room_participants` баннер demo-режима мог ошибочно сообщать, что Supabase не подключен, хотя реальной причиной была ошибка доступа к таблицам.

## Следующее действие
- Применить обновленный [database-setup.sql](C:/Users/Admin/Documents/Веркин/music-room/docs/database-setup.sql) в проекте Supabase и проверить создание `tracks`, `room_queue`, `track_comments`, полей playback state и Realtime-публикаций.
- Повторно войти через GitHub и проверить, что новые комнаты теперь создаются как серверные UUID-комнаты, а не demo fallback.
- Применить обновленный SQL для `rooms` и `room_participants`, затем проверить, что список комнат больше не скатывается в demo из-за ошибки доступа.
- После этого проверить поведение комментариев в живой комнате и затем перейти к технической синхронизации `packageManager` на `bun`.

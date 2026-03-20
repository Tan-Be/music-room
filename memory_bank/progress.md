# Progress - Music Room

## Статус
- Текущая фаза: активный продукт с частично незавершенным room experience.
- Канонический процент готовности: 80%.
- Источник процента: `memory_bank/projectbrief.md` -> `## Project Deliverables`.

## Контроль изменений
- last_checked_commit: `585c4bc4260cb2ea7a06285dbb9fe80f002f0b90`
- last_checked_date: `2026-03-20`
- status: synchronized with repository snapshot after SQL setup documentation refresh

## Что подтверждено
- В комнате добавлена серверная очередь через `room_queue` и `tracks`, а текущий трек синхронизируется через `rooms.current_track_id`.
- Чат переведен на Supabase Realtime и больше не зависит от polling в клиенте.
- Комментарии к трекам в Supabase-режиме переведены на серверную модель через `track_comments` и `api/track-comments`.
- Страница комнаты подписывается на изменения `room_participants` и `rooms`, поэтому состав комнаты обновляется без ручной перезагрузки.
- `docs/README.md` обновлен под текущую модель комнаты и снова соответствует коду.
- `docs/database-setup.sql` теперь идемпотентно создает `tracks`, `room_queue`, `track_comments`, добавляет `rooms.current_track_id` и `rooms.is_playing`, а также безопасно включает нужные Realtime-публикации.

## Known Issues
- YouTube-плеер синхронизирует общий выбранный трек, но не дает точной синхронизации таймкода между участниками.
- Обновленный SQL-скрипт еще нужно применить в самой среде Supabase, иначе `track_comments` и связанные realtime-обновления не появятся в базе.
- Для комментариев к трекам пока не реализованы редактирование и удаление.
- В рабочем дереве присутствует неотслеживаемый файл `nul`.
- В `package.json` зафиксирован `packageManager: pnpm`, что расходится с репозиторным правилом использовать `bun`.

## Changelog
### 2026-03-20
- Реализована общая очередь комнаты через `room_queue` и `tracks` в клиентском слое Supabase.
- Переведен чат на Supabase Realtime.
- Добавлены realtime-подписки для состава комнаты и состояния воспроизведения.
- Добавлены серверные комментарии к трекам через `track_comments`, `api/track-comments` и realtime-подписку в `music-player`.
- Обновлен `docs/database-setup.sql`: SQL-инициализация комнаты теперь соответствует текущей модели playback state и серверным комментариям и безопасна для повторного запуска.
- Обновлены `docs/README.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`.

### 2026-03-19
- Проверена структура `memory_bank` и подтверждено наличие обязательных базовых файлов.
- Сверена git-история относительно `last_checked_commit`, найдено значительное расхождение между документацией и кодом.
- Переписаны `projectbrief.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`.
- Добавлен `docs/README.md` как архитектурный источник правды.
- Добавлены записи `memory_bank/ui_extension/pages/*` для публичных маршрутов приложения.

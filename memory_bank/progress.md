# Progress - Music Room

## Статус
- Текущая фаза: активный продукт с частично незавершенным room experience.
- Канонический процент готовности: 80%.
- Источник процента: `memory_bank/projectbrief.md` -> `## Project Deliverables`.

## Контроль изменений
- last_checked_commit: `4c419714f360f0a42d44342c2e7b7a5fd4ffca34`
- last_checked_date: `2026-03-20`
- status: synchronized with repository snapshot before current commit session

## Что подтверждено
- В комнате добавлена серверная очередь через `room_queue` и `tracks`, а текущий трек синхронизируется через `rooms.current_track_id`.
- Чат переведен на Supabase Realtime и больше не зависит от polling в клиенте.
- Страница комнаты подписывается на изменения `room_participants` и `rooms`, поэтому состав комнаты обновляется без ручной перезагрузки.
- `docs/README.md` обновлен под текущую модель комнаты и снова соответствует коду.

## Known Issues
- YouTube-плеер синхронизирует общий выбранный трек, но не дает точной синхронизации таймкода между участниками.
- Комментарии к трекам по-прежнему не имеют серверной модели и остаются локальными.
- Для полной работы новой логики в Supabase должны существовать таблицы `tracks` и `room_queue`, а также включенные Realtime-публикации.
- В рабочем дереве присутствует неотслеживаемый файл `nul`.
- В `package.json` зафиксирован `packageManager: pnpm`, что расходится с репозиторным правилом использовать `bun`.

## Changelog
### 2026-03-20
- Реализована общая очередь комнаты через `room_queue` и `tracks` в клиентском слое Supabase.
- Переведен чат на Supabase Realtime.
- Добавлены realtime-подписки для состава комнаты и состояния воспроизведения.
- Обновлены `docs/README.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`.

### 2026-03-19
- Проверена структура `memory_bank` и подтверждено наличие обязательных базовых файлов.
- Сверена git-история относительно `last_checked_commit`, найдено значительное расхождение между документацией и кодом.
- Переписаны `projectbrief.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`.
- Добавлен `docs/README.md` как архитектурный источник правды.
- Добавлены записи `memory_bank/ui_extension/pages/*` для публичных маршрутов приложения.

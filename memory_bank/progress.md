# Progress - Music Room

## Статус
- Текущая фаза: активный продукт с частично незавершенным room experience.
- Канонический процент готовности: 80%.
- Источник процента: `memory_bank/projectbrief.md` -> `## Project Deliverables`.

## Контроль изменений
- last_checked_commit: `75ebf0f7200e8d84d66a8d96b5f4888fb0d53b2d`
- last_checked_date: `2026-03-24`
- status: synchronized with repository snapshot after owner-button fix and before NextAuth/Supabase profile bridge patch

## Что подтверждено
- В комнате добавлена серверная очередь через `room_queue` и `tracks`, а текущий трек синхронизируется через `rooms.current_track_id`.
- Чат переведен на Supabase Realtime и больше не зависит от polling в клиенте.
- Комментарии к трекам в Supabase-режиме переведены на серверную модель через `track_comments` и `api/track-comments`.
- Страница комнаты подписывается на изменения `room_participants` и `rooms`, поэтому состав комнаты обновляется без ручной перезагрузки.
- Страница комнаты корректно открывает старые demo-комнаты с не-UUID id через локальный fallback и больше не ломает загрузку запросом в Supabase.
- Для создателя комнаты добавлена локальная ownership-метка, поэтому кнопка `Присоединиться` может быть скрыта даже если текущая сессия и профиль владельца не совпадают по id.
- GitHub OAuth через NextAuth теперь может быть синхронизирован с `profiles.id` в Supabase через server-side deterministic UUID bridge вместо provider numeric id.
- `docs/database-setup.sql` теперь также покрывает RLS-политики для `rooms` и `room_participants`, которые нужны текущему клиентскому слою Supabase.
- `docs/README.md` обновлен под текущую модель комнаты и снова соответствует коду.
- `docs/database-setup.sql` теперь идемпотентно создает `tracks`, `room_queue`, `track_comments`, добавляет `rooms.current_track_id` и `rooms.is_playing`, а также безопасно включает нужные Realtime-публикации.

## Known Issues
- YouTube-плеер синхронизирует общий выбранный трек, но не дает точной синхронизации таймкода между участниками.
- Обновленный SQL-скрипт еще нужно применить в самой среде Supabase, иначе `track_comments` и связанные realtime-обновления не появятся в базе.
- Для комментариев к трекам пока не реализованы редактирование и удаление.
- В рабочем дереве присутствует неотслеживаемый файл `nul`.
- В `package.json` зафиксирован `packageManager: pnpm`, что расходится с репозиторным правилом использовать `bun`.
- Пока клиент не аутентифицируется в Supabase напрямую, `tracks.added_by` и `room_queue.added_by` остаются пустыми при клиентской вставке для совместимости с текущими RLS-политиками.
- Если в реальной базе не применены политики для `rooms` и `room_participants`, UI может уйти в demo fallback даже при корректных env-переменных Supabase.

## Changelog
### 2026-03-24
- Начата и реализована правка auth/data-интеграции: `api/auth/[...nextauth]` теперь вычисляет совместимый UUID профиля Supabase для GitHub-пользователя и создает/обновляет `profiles` через server-side service role client, чтобы новые комнаты больше не уходили в demo fallback из-за GitHub numeric id.
- Для клиентского добавления треков временно зафиксирована совместимость с текущими RLS: `tracks.added_by` и `room_queue.added_by` записываются как `null`.
- Исправлен вводящий в заблуждение demo-баннер на странице комнат: теперь он показывает реальную причину fallback, а SQL-документация дополняет обязательные политики для `rooms` и `room_participants`.
- Исправлено поведение кнопки `Присоединиться` для владельца комнаты: после создания комнаты ownership сохраняется локально, а страница комнаты использует эту метку при рендере действий.

### 2026-03-20
- Реализована общая очередь комнаты через `room_queue` и `tracks` в клиентском слое Supabase.
- Переведен чат на Supabase Realtime.
- Добавлены realtime-подписки для состава комнаты и состояния воспроизведения.
- Добавлены серверные комментарии к трекам через `track_comments`, `api/track-comments` и realtime-подписку в `music-player`.
- Исправлено открытие старых demo-комнат: не-UUID room id больше не отправляются в Supabase как UUID.
- Обновлен `docs/database-setup.sql`: SQL-инициализация комнаты теперь соответствует текущей модели playback state и серверным комментариям и безопасна для повторного запуска.
- Обновлены `docs/README.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`.

### 2026-03-19
- Проверена структура `memory_bank` и подтверждено наличие обязательных базовых файлов.
- Сверена git-история относительно `last_checked_commit`, найдено значительное расхождение между документацией и кодом.
- Переписаны `projectbrief.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`.
- Добавлен `docs/README.md` как архитектурный источник правды.
- Добавлены записи `memory_bank/ui_extension/pages/*` для публичных маршрутов приложения.

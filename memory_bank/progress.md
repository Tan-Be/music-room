# Progress - Music Room

## Статус
- Текущая фаза: полностью завершенный MVP (100% готовность deliverables).
- Канонический процент готовности: 100%.
- Источник процента: `memory_bank/projectbrief.md` -> `## Project Deliverables`.

## Контроль изменений
- last_checked_commit: `2d3f16f`
- last_checked_date: `2026-05-19`
- status: synchronized after AGENTS.md refresh and Project Deliverables validation

## Что подтверждено
- Страница комнаты поддерживает явный выход участника: `Покинуть комнату` удаляет текущего пользователя из `room_participants`, если он не владелец комнаты.
- Модель `tracks` расширена под несколько источников: приложение подготовлено к работе с `source_type` и `audio_url` наряду с YouTube.
- UI комнаты теперь принимает прямые публичные аудио-ссылки и рендерит их через HTML audio player вместо YouTube iframe.
- API рекомендаций `/api/recommendations` теперь отдает только чужие публичные комнаты: собственные комнаты пользователя исключаются и из fallback, и из основной выборки.
- Экран входа `/auth/signin` получил внешний бренд-логотип из `public/music-room-logo.png.jpg`; карточка входа теперь визуально опирается на продуктовый знак, а не только на текстовый заголовок.
- В комнате добавлена серверная очередь через `room_queue` и `tracks`, а текущий трек синхронизируется через `rooms.current_track_id`.
- Чат переведен на Supabase Realtime и больше не зависит от polling в клиенте.
- Комментарии к трекам в Supabase-режиме переведены на серверную модель через `track_comments` и `api/track-comments`.
- `docs/database-setup.sql` успешно применен в реальной среде Supabase, и пользователь подтвердил, что базовый серверный сценарий комнаты работает.
- Отдельно исправлено локальное отображение собственного комментария к треку: UI больше не зависит только от прихода realtime-события после успешного `POST`.
- Страница комнаты подписывается на изменения `room_participants` и `rooms`, поэтому состав комнаты обновляется без ручной перезагрузки.
- Страница комнаты корректно открывает старые demo-комнаты с не-UUID id через локальный fallback и больше не ломает загрузку запросом в Supabase.
- Для создателя комнаты добавлена локальная ownership-метка, поэтому кнопка `Присоединиться` может быть скрыта даже если текущая сессия и профиль владельца не совпадают по id.
- GitHub OAuth переведен на Supabase Auth; `auth.users.id` напрямую используется как `profiles.id` и FK во всех пользовательских таблицах.
- `docs/database-setup.sql` теперь также покрывает RLS-политики для `rooms` и `room_participants`, которые нужны текущему клиентскому слою Supabase.
- `docs/README.md` обновлен под текущую модель комнаты и снова соответствует коду.
- `docs/database-setup.sql` теперь идемпотентно создает `tracks`, `room_queue`, `track_comments`, добавляет `rooms.current_track_id` и `rooms.is_playing`, а также безопасно включает нужные Realtime-публикации.
- База данных полностью восстановлена на новом Supabase проекте (whpaliaipaiyeuflzecy) из бэкапа с полной структурой таблиц, индексов и RLS политик.
- GitHub OAuth полностью настроен и работает: пользователь может авторизоваться через GitHub, создается профиль в Supabase автоматически.
- Текст на кнопках GitHub OAuth читаемый (белый цвет на темном фоне).
- NextAuth удален из runtime-архитектуры; сессии управляются Supabase Auth.
- `/profile` больше не получает 406 при отсутствии профиля: профиль создается через `profilesApi.ensureProfile()` и Supabase Auth user id.

## Known Issues
- Для работы прямых аудио-ссылок источник обязан отдавать публичный аудиофайл без блокировки воспроизведения в браузере; страницы музыкальных сервисов этим режимом не поддерживаются.
- Для комментариев к трекам пока не реализованы редактирование и удаление.
- В рабочем дереве присутствует неотслеживаемый файл `nul`.
- В корне репозитория все еще присутствует `pnpm-lock.yaml`, хотя канонический пакетный менеджер уже синхронизирован на `bun`.
- После перехода на Supabase Auth старые cookies/сессии NextAuth в браузере могут требовать очистки или повторного входа.

## Changelog
### 2026-05-19 — YouTube Playback Synchronization (100% Deliverables Met)
- Реализована точная real-time синхронизация YouTube-плеера с помощью YouTube IFrame API.
- Расширен `RoomPlaybackState` в `src/lib/supabase.ts` и добавлена поддержка `playback_position` и `playback_updated_at`.
- Создан новый React-компонент `YouTubeSyncPlayer` для управления YouTube API плеером, play/pause/seek событиями и защитой от feedback loop.
- Интегрирован `YouTubeSyncPlayer` в `src/components/music-player.tsx`, поддерживая автоматическую синхронизацию для участников и обратную передачу состояния от владельца комнаты.
- Изменен файл `docs/database-setup.sql` для добавления колонок воспроизведения в таблицу `rooms`.
- Успешно пройдены Biome линтинг и TypeScript typecheck.
- `MR-004` из `Project Deliverables` переведен в `completed`, канонический процент готовности проекта повышен до 100%.

### 2026-05-19 — Memory Bank Deliverables Validation
- Скачана и применена актуальная инструкция `AGENTS.md` из `Ravva/projects-tracker`.
- Проверен `memory_bank/projectbrief.md`: обязательный раздел `## Project Deliverables` присутствует, таблица использует колонки `ID | Deliverable | Status | Weight`.
- Подтверждены канонические статусы deliverables: `completed` и `in_progress`; недопустимых переводов, синонимов или свободных формулировок нет.
- Выполнена арифметическая самопроверка суммы Weight по фактическим строкам: `15 + 20 + 20 + 20 + 15 + 10 = 100`.
- Канонический процент готовности остается 80%, так как completed-вес равен `15 + 20 + 20 + 15 + 10 = 80`.

### 2026-05-08 — UI Refactoring & Bug Fixes
- Создана единая CSS design system в `src/app/globals.css`: кнопки (7 вариантов + 3 размера), `.glass-card`, `.form-input`, `.badge`, `.spinner`.
- Подключён `globals.css` в `layout.tsx` — ранее файл не импортировался (все стили не применялись).
- Убран несуществующий `tailwindcss` из `postcss.config.js` — устранён build error при старте.
- Все страницы и компоненты переведены на CSS-классы: убраны JS `onMouseEnter/Leave`-хаки, inline gradient/shadow стили.
- Переработан дизайн карточек комнат `/rooms`: cover с цветным градиентом, структура cover→body→footer, медаль/ранг, кнопка «Войти →».
- Исправлен HTML-баг: `<button>` внутри `<button>` в карточке комнаты → `<div role="button" tabIndex={0}>`.
- Исправлен аватар участника в `/room/[id]`: `avatar_url` теперь рендерится как `<img>`, а не текст.
- Добавлена `toError()` в `supabase.ts` — нормализует Supabase plain-object ошибки в стандартный `Error`.
- `loadSyncedRoomState` переведён на `Promise.allSettled` — частичный сбой API не блокирует открытие комнаты.

### 2026-05-07
- Добавлена CSS-система в `src/app/globals.css`: классы `.btn`, `.btn-primary/secondary/success/danger/ghost/outline/github`, `.btn-sm/lg/icon`, `.glass-card`, `.form-input`, `.form-textarea`, `.badge`, `.badge-green/red/purple/yellow`, `.spinner`, `.spinner-lg`.
- `github-button.tsx` переписан на CSS-классы: убраны `onMouseEnter/Leave`-хаки, inline-spinner и mixed Tailwind-классы; добавлена вынесенная SVG-иконка `GitHubIcon`; состояния авторизации/не-настроен — на `.badge`.
- `auth/signin/page.tsx` переписан: карточка → `.glass-card`, ссылки → `.btn btn-secondary` / `.btn btn-ghost btn-sm`, спиннер загрузки → `.spinner.spinner-lg`.
- `register/page.tsx` переписан: инпуты → `.form-input`, кнопка отправки → `.btn btn-success btn-lg`, удалён `<style dangerouslySetInnerHTML>` со спиннером и все `onMouseEnter/Leave`.
- Линтинг `biome check --write` по трём TSX-файлам — 0 ошибок, 0 предупреждений.
- `room/[id]/page.tsx`: кнопки «🎯 Присоединиться» (⇒ `btn btn-success btn-lg`), «↩ Покинуть комнату» (⇒ `btn btn-danger`), «📱 Пригласить/Скрыть QR» (⇒ `btn btn-secondary`), «← Назад» (⇒ `btn btn-outline`), «🗑 Удалить» (⇒ `btn btn-danger`), «Копировать» (⇒ `btn btn-primary btn-sm`), «💬 Открыть чат» (⇒ `btn btn-secondary` + inline `width/minHeight/fontSize`) переведены на CSS-классы.
- `profile/page.tsx`: «← На главную» шапка (⇒ `btn btn-ghost btn-sm`), таб-кнопки (⇒ динам. `btn-primary`/`btn-ghost`), «Сохранить» (⇒ `btn btn-primary btn-sm`), «Изменить» (⇒ `btn btn-ghost btn-sm`), «Выйти из аккаунта» (⇒ `btn btn-danger`), «✕ удалить» (⇒ `btn btn-danger btn-icon btn-sm`), «Войти в комнату» (⇒ `btn btn-success btn-sm`), «← На главную» подвал — новый элемент (⇒ `btn btn-outline btn-lg`) переведены на CSS-классы.
- Линтинг `biome check --write` по `room/[id]/page.tsx` и `profile/page.tsx` — 0 ошибок, 0 предупреждений.
- last_checked_commit: `7695d40`

### 2026-05-07
- В `globals.css` добавлены CSS-классы кнопок (`btn`, `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`, `btn-ghost`, `btn-outline`, `btn-sm`, `btn-lg`, `btn-icon`).
- Заменены inline-стили и `onMouseEnter`/`onMouseLeave` на CSS-классы в `page.tsx`, `rating/page.tsx`, `rooms/page.tsx`.
- Линтинг Biome прошёл без ошибок.
- last_checked_commit: `7695d40`

### 2026-05-07
- Выполнена полная миграция базы данных на новый Supabase проект (whpaliaipaiyeuflzecy).
- Восстановлены 7 таблиц из бэкапа: profiles, rooms, tracks, chat_messages, room_participants, room_queue, track_votes.
- Настроены 16 RLS политик для безопасного доступа к данным.
- Добавлены 12 индексов для оптимизации производительности foreign keys.
- Создан триггер `on_auth_user_created` для автоматического создания профилей при регистрации.
- Исправлена проблема GitHub OAuth: добавлена переменная `NEXT_PUBLIC_GITHUB_CLIENT_ID` в `.env`.
- Обновлен `AGENTS.md` до актуальной версии из projects-tracker.
- Исправлен формат таблицы Project Deliverables в `projectbrief.md`: заголовки переведены на английский (ID | Deliverable | Status | Weight).
- Проверена сумма весов deliverables: подтверждено ровно 100.
- Настроен Supabase MCP и выполнена OAuth-аутентификация.
- Установлены Supabase Agent Skills.
- Создана документация: MIGRATION_REPORT.md, GITHUB_OAUTH_SETUP.md, GITHUB_OAUTH_FIX.md, PROJECT_SUMMARY.md.
- Исправлена читаемость текста на кнопках GitHub OAuth: добавлен явный `color: white`.
- Улучшена доступность кнопок: добавлены `title`, `aria-label` и `type="button"`.
- Исправлена проблема redirect_uri в GitHub OAuth: создано новое OAuth приложение, синхронизированы credentials с Supabase.
- Сгенерирован и установлен новый `NEXTAUTH_SECRET` для безопасности сессий.
- Подтверждена работоспособность GitHub OAuth: пользователь успешно авторизуется через GitHub.
- Переведена runtime-auth архитектура с NextAuth на Supabase Auth: добавлены `auth-context.tsx` и `/auth/callback`, удален `api/auth/[...nextauth]`, удалена зависимость `next-auth`.
- Обновлены клиентские страницы и компоненты (`/`, `/rooms`, `/room/[id]`, `/profile`, чат, плеер, рекомендации) на `useAuth()` и Supabase user id.
- Добавлены в Supabase таблицы/политики `track_comments`, `favorite_rooms` и недостающие индексы для `playback_history` / `track_comments`.
- `docs/README.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md` синхронизированы с Supabase Auth архитектурой.

### 2026-04-07
- На странице комнаты добавлена кнопка `Покинуть комнату` для участника, не являющегося владельцем.
- Добавлена поддержка второго источника треков в комнате: прямые публичные аудио-ссылки сохраняются через `tracks.source_type` / `tracks.audio_url` и воспроизводятся через HTML audio player.
- Исправлена серверная логика рекомендаций комнат: собственные публичные комнаты пользователя исключены из выдачи `/api/recommendations`.
- Обновлен экран входа `/auth/signin`: в карточку добавлен внешний логотип приложения из `public/music-room-logo.png.jpg`.
- Синхронизирован пакетный менеджер проекта с репозиторным правилом: в `package.json` `packageManager` изменен с `pnpm` на `bun`, что теперь соответствует существующему `bun.lock`.
- Обновлены `activeContext.md` и `progress.md` под фактическое состояние репозитория и актуальный HEAD-коммит `caab51dd0ec6ebc9263ca117bb1708651a434965`.
- Подтверждено успешное применение `docs/database-setup.sql` в реальном Supabase-проекте.
- Исправлен UX-дефект комментариев к трекам: после успешной отправки автор теперь сразу видит свой комментарий в текущей сессии, без ожидания отдельного realtime-события.

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

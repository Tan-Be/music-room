# Tech Context - Music Room

## Стек
- Next.js 16.1.6
- React 19.2.4
- TypeScript 5.x
- Supabase JS 2.93.3
- qrcode.react 4.2.0

## Управление пакетами и команды
- Репозиторный стандарт: `bun`.
- В `package.json` зафиксирован `packageManager: bun@1.3.9`, что соответствует правилам репозитория.
- Доступные скрипты:
  - `bun run dev`
  - `bun run build`
  - `bun run start`
  - `bun run type-check`
- Для линтинга и автоисправления в этой сессии использовался `bunx @biomejs/biome check --write`.

## Важные переменные окружения
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GITHUB_CLIENT_ID` используется только для клиентской проверки отображения кнопки; сам OAuth выполняется через Supabase Auth provider settings.

## Структура проекта
- `src/app`: маршруты App Router и route handlers.
- `src/components`: UI и пользовательские виджеты.
- `src/lib`: инфраструктурные клиенты и API-обертки.
- `docs`: продуктовая и техническая документация.
- `memory_bank`: операционная память проекта для агента.

## Серверные точки интеграции
- `src/app/api/recommendations/route.ts`: серверный расчет рекомендаций комнат.
- `src/app/auth/callback/page.tsx`: клиентский callback Supabase Auth OAuth.

## Ограничения среды
- Сервер разработки управляется пользователем; агент не должен его запускать, останавливать или проверять статус.
- Для форматирования и линтинга нужно использовать Biome и не запускать его по Markdown-файлам.
- Сеть в рабочем окружении ограничена, поэтому `git push` или `bunx` могут потребовать эскалацию.

## Ключевые технические наблюдения
- Проект использует inline styles вместе с небольшим `globals.css`.
- Комната теперь зависит от Supabase Realtime для `rooms`, `room_queue`, `room_participants`, `chat_messages` и `track_comments`.
- Клиентская сессия хранится в Supabase Auth; `auth.users.id` используется как единый UUID пользователя в `profiles` и связанных таблицах.
- Значительная часть fallback-данных по-прежнему живет в `localStorage`, но основное состояние комнаты вынесено в Supabase.
- Biome в текущей конфигурации обрабатывает TypeScript-файлы, но не форматирует `docs/database-setup.sql`.
- Версии `next` и `eslint-config-next` в `package.json` расходятся по мажорной линии и заслуживают отдельной проверки вне этой задачи.
- Клиентские вставки треков, очереди, чата и комментариев выполняются с Supabase Auth JWT и проходят RLS через `(select auth.uid())`.

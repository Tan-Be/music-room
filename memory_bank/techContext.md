# Tech Context - Music Room

## Стек
- Next.js 16.1.6
- React 19.2.4
- TypeScript 5.x
- NextAuth 4.24.13
- Supabase JS 2.93.3
- qrcode.react 4.2.0

## Управление пакетами и команды
- Репозиторный стандарт: `bun`.
- В `package.json` сейчас зафиксирован `packageManager: pnpm`, это расхождение с правилами репозитория и требует отдельной технической синхронизации.
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
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`
- server-side переменные NextAuth/GitHub для `api/auth/[...nextauth]`

## Структура проекта
- `src/app`: маршруты App Router и route handlers.
- `src/components`: UI и пользовательские виджеты.
- `src/lib`: инфраструктурные клиенты и API-обертки.
- `docs`: продуктовая и техническая документация.
- `memory_bank`: операционная память проекта для агента.

## Серверные точки интеграции
- `src/app/api/chat/route.ts`: тонкий серверный слой для сообщений комнаты.
- `src/app/api/track-comments/route.ts`: тонкий серверный слой для комментариев к трекам.
- `src/app/api/auth/[...nextauth]/route.ts`: GitHub OAuth и server-side синхронизация Supabase profile id.

## Ограничения среды
- Сервер разработки управляется пользователем; агент не должен его запускать, останавливать или проверять статус.
- Для форматирования и линтинга нужно использовать Biome и не запускать его по Markdown-файлам.
- Сеть в рабочем окружении ограничена, поэтому `git push` или `bunx` могут потребовать эскалацию.

## Ключевые технические наблюдения
- Проект использует inline styles вместе с небольшим `globals.css`.
- Комната теперь зависит от Supabase Realtime для `rooms`, `room_queue`, `room_participants`, `chat_messages` и `track_comments`.
- Для NextAuth-пользователя `session.user.id` теперь формируется как детерминированный UUID профиля Supabase, а не как provider numeric id GitHub.
- Значительная часть fallback-данных по-прежнему живет в `localStorage`, но основное состояние комнаты вынесено в Supabase.
- Biome в текущей конфигурации обрабатывает TypeScript-файлы, но не форматирует `docs/database-setup.sql`.
- Версии `next` и `eslint-config-next` в `package.json` расходятся по мажорной линии и заслуживают отдельной проверки вне этой задачи.
- Пока клиент не аутентифицируется в Supabase напрямую, клиентские вставки треков оставляют `added_by` пустым для совместимости с текущими RLS-политиками.
- По той же причине чтение списка комнат и управление участниками требуют permissive RLS-политик для `rooms` и `room_participants`, если эти операции остаются на клиентском Supabase JS.

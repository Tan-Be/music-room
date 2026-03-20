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
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`
- server-side переменные NextAuth/GitHub для `api/auth/[...nextauth]`

## Структура проекта
- `src/app`: маршруты App Router и route handlers.
- `src/components`: UI и пользовательские виджеты.
- `src/lib`: инфраструктурные клиенты и API-обертки.
- `docs`: продуктовая и техническая документация.
- `memory_bank`: операционная память проекта для агента.

## Ограничения среды
- Сервер разработки управляется пользователем; агент не должен его запускать, останавливать или проверять статус.
- Для форматирования и линтинга нужно использовать Biome и не запускать его по Markdown-файлам.
- Сеть в рабочем окружении ограничена, поэтому `git push` или `bunx` могут потребовать эскалацию.

## Ключевые технические наблюдения
- Проект использует inline styles вместе с небольшим `globals.css`.
- Комната теперь зависит от Supabase Realtime для `rooms`, `room_queue`, `room_participants` и `chat_messages`.
- Значительная часть fallback-данных по-прежнему живет в `localStorage`, но основное состояние комнаты вынесено в Supabase.
- Версии `next` и `eslint-config-next` в `package.json` расходятся по мажорной линии и заслуживают отдельной проверки вне этой задачи.

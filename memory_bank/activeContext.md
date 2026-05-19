# Active Context - Music Room

**Дата последнего обновления**: 2026-05-19

## Текущий фокус
- Проверена актуальная инструкция `AGENTS.md` из `Ravva/projects-tracker` и применены правила Memory Bank к текущей синхронизации документации.
- `memory_bank/projectbrief.md` содержит обязательный раздел `## Project Deliverables` в формате таблицы `ID | Deliverable | Status | Weight`; сумма весов подтверждена как ровно 100.
- Завершён масштабный UI-рефакторинг: единая CSS design system, современные карточки комнат, исправлены баги (кнопка в кнопке, аватар как текст, ошибка синхронизации).
- Проект полностью восстановлен на Supabase (whpaliaipaiyeuflzecy), GitHub OAuth через Supabase Auth.

## Что выполнено в этой сессии (2026-05-19)
- Скачана и использована актуальная версия правил `AGENTS.md` из `https://github.com/Ravva/projects-tracker/blob/main/AGENTS.md`.
- Проверен раздел `## Project Deliverables` в `memory_bank/projectbrief.md`: таблица имеет колонки `ID | Deliverable | Status | Weight`, статусы используют канонические значения.
- Выполнена явная арифметическая самопроверка весов deliverables: `15 + 20 + 20 + 20 + 15 + 10 = 100`.
- Memory Bank обновлён под текущую документационную синхронизацию без изменения проектного scope и без изменения архитектуры.

## Что выполнено в этой сессии (2026-05-08)

### CSS Design System
- Создана и подключена единая CSS-система в `src/app/globals.css`.
- Классы кнопок: `.btn` + варианты `primary`, `secondary`, `success`, `danger`, `ghost`, `outline`, `github` — с градиентами, `inset` highlight, box-shadow и hover-анимацией `translateY(-2px)`.
- Вспомогательные классы: `.glass-card`, `.form-input`, `.badge` (4 цвета), `.spinner`, `.spinner-lg`.
- Подключение: добавлен `import './globals.css'` в `src/app/layout.tsx` (ранее файл не импортировался).
- Убран `tailwindcss` из `postcss.config.js` — пакет не был установлен, вызывал build error.

### Рефакторинг страниц и компонентов
- `github-button.tsx` — `btn-github btn-lg`, SVG-иконка вынесена отдельно, убраны JS hover-хаки.
- `auth/signin/page.tsx` — `glass-card`, `btn-secondary`, `btn-ghost btn-sm`, спиннер.
- `register/page.tsx` — `form-input`, `btn-success btn-lg`, убран `dangerouslySetInnerHTML` со спиннером.
- `page.tsx` (главная) — `btn-secondary`, `btn-danger`.
- `rooms/page.tsx` — `btn-primary btn-lg`, `btn-ghost` для отмены, карточки комнат.
- `rating/page.tsx` — `btn-primary`, `btn-outline`.
- `room/[id]/page.tsx` — `btn-success btn-lg`, `btn-danger`, `btn-secondary`, `btn-outline`, `btn-primary btn-sm`; аватар участника теперь рендерится как `<img>` а не текст URL.
- `profile/page.tsx` — таб-кнопки `btn-primary`/`btn-ghost`, `btn-danger`, `btn-success btn-sm`.
- `music-player.tsx` — `btn-danger`, `btn-ghost` (отмена), `form-input`, `btn-primary btn-sm`.
- `room-recommendations.tsx` — `btn-secondary` вместо JS hover.

### Карточки комнат (`/rooms`)
- Полностью переработан дизайн: цветная обложка-шапка с уникальным градиентом на каждую комнату, иконка-плашка поверх обложки, `overflow: hidden`.
- Структура: cover (90px) → body (название, описание 2 строки, мета) → footer (рейтинг + голоса + кнопка).
- Исправлен баг `<button>` внутри `<button>`: внешний контейнер карточки стал `<div role="button" tabIndex={0}>` с `onKeyDown`.

### Исправления багов
- **Аватар участника** в `/room/[id]`: `avatar_url` (URL строка) рендерился как текст в `<span>`. Исправлено на `<img>` с `border-radius: 50%` и фоллбек-плейсхолдер.
- **Ошибка синхронизации `{}`**: Supabase возвращает ошибки как plain-объект без `Error.prototype`. Добавлена функция `toError()` в `supabase.ts`, все `throw error` заменены на `throw toError(error)`.
- **`loadSyncedRoomState`**: заменён `Promise.all` на `Promise.allSettled` — падение одного запроса (очередь/воспроизведение/комментарии) больше не блокирует открытие комнаты.

## Актуальная картина системы
- Приложение: Next.js 16.1.6 App Router, маршруты `/`, `/rooms`, `/room/[id]`, `/rating`, `/profile`, `/register`, `/auth/signin`, `/auth/callback`.
- Стили: глобальные CSS-классы в `src/app/globals.css`, подключены через `layout.tsx`. PostCSS без плагинов (tailwind не установлен).
- Данные: `src/lib/supabase.ts` — все API с нормализацией ошибок через `toError()`.
- Auth: `src/lib/auth-context.tsx` — Supabase Auth, GitHub OAuth.

## Открытые вопросы и риски
- YouTube `iframe` ограничивает точную синхронизацию таймкода между участниками.
- У комментариев к трекам нет редактирования и удаления.
- В корне присутствует `pnpm-lock.yaml` (технический долг — удалить при случае).
- После перехода на Supabase Auth старые cookies/сессии NextAuth могут требовать очистки браузера.

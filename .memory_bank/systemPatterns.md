# System Patterns - Music Room

## Архитектурный срез
- Frontend: Next.js App Router, почти все пользовательские экраны рендерятся как client components.
- Auth: NextAuth с GitHub provider и пользовательской сессией на клиенте.
- Data layer: Supabase client на фронтенде и в route handlers.
- Fallback layer: localStorage для демо-режима, если Supabase отсутствует или недоступен.

## Основные паттерны

### 1. Client-first страницы
- Маршруты в `src/app` используют `useState`, `useEffect`, `useSession`.
- Это упрощает работу с сессией, localStorage и браузерными API, но повышает зависимость от клиентского окружения.

### 2. API wrappers вокруг Supabase
- В `src/lib/supabase.ts` собраны функции `roomsApi` и `profilesApi`.
- Страницы используют эти обертки вместо прямого повторения запросов во всех местах.

### 3. Graceful degradation
- Если `isSupabaseConfigured()` возвращает `false`, сценарии комнат, профиля и части UI переходят в локальный режим.
- Локальный режим хранит комнаты, голоса, избранное, треки и часть пользовательских действий в `localStorage`.

### 4. Route handlers как thin backend
- `src/app/api/chat/route.ts` отдает и принимает сообщения.
- `src/app/api/recommendations/route.ts` строит рекомендации на основе истории воспроизведения.
- Серверные роуты тонкие и в основном проксируют логику в Supabase-запросы.

### 5. Inline-styled UI
- Значительная часть визуального слоя оформлена через `style={{ ... }}` непосредственно в JSX.
- Глобальный CSS минимален; переиспользование достигается в основном через React-компоненты.

## Карта модулей
- `src/app/page.tsx`: главная страница, навигационные карточки, рекомендации и быстрый OAuth-вход.
- `src/app/rooms/page.tsx`: список комнат, голосование, создание, удаление, демо-режим.
- `src/app/room/[id]/page.tsx`: страница комнаты, участие, удаление, QR-код, чат, музыкальный плеер.
- `src/app/profile/page.tsx`: история, избранное, профиль пользователя.
- `src/app/rating/page.tsx`: рейтинг комнат на основе локально сохраненных голосов.
- `src/components/music-player.tsx`: очередь треков, YouTube embed, локальные комментарии.
- `src/components/chat.tsx`: чат с polling.

## Известные архитектурные ограничения
- Чат не использует realtime-подписки Supabase, а работает через polling.
- Плеер не синхронизирует фактическое воспроизведение между участниками на сервере.
- Части продукта используют mixed strategy: база данных для комнат и профиля, localStorage для других сущностей.

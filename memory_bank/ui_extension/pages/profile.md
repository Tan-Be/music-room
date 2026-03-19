# Page: Profile

## Route
`/profile`

## Purpose
Показывает данные профиля, историю прослушивания, избранные комнаты и настройки имени пользователя.

## Main Components
- `AnimatedBackground`

## Data Flow
- Сессия берется через `useSession`.
- Профиль и история читаются из Supabase.
- Избранное хранится в `localStorage`.
- Без Supabase страница переходит в упрощенный режим.

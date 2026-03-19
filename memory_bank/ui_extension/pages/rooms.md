# Page: Rooms

## Route
`/rooms`

## Purpose
Список публичных комнат, создание новой комнаты, локальное голосование и удаление.

## Main Components
- `AnimatedBackground`

## Data Flow
- При рабочем Supabase комнаты загружаются через `roomsApi.getPublicRooms()`.
- При отсутствии Supabase используется `localStorage` (`demoRooms`, `userVotes`).
- После создания комнаты выполняется переход на `/room/[id]`.

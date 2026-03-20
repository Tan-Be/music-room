# Component: Music Player

## Source
`src/components/music-player.tsx`

## Responsibility
Управляет очередью треков комнаты, встраивает YouTube-плеер и поддерживает комментарии к трекам в synced- и demo-режимах.

## Notes
- В synced-режиме очередь хранится в `room_queue`, а комментарии к трекам загружаются через `GET/POST /api/track-comments` и обновляются через Supabase Realtime.
- В demo-режиме очередь и комментарии по-прежнему живут в `localStorage`.
- Проверяет право пользователя на добавление треков.

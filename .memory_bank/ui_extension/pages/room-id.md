# Page: Room Detail

## Route
`/room/[id]`

## Purpose
Основной экран взаимодействия внутри комнаты: участие, музыкальный плеер, чат, QR-приглашение и удаление комнаты владельцем.

## Main Components
- `AnimatedBackground`
- `MusicPlayer`
- `Chat`
- `QRCodeSVG`

## Data Flow
- Комната загружается через `roomsApi.getRoomById(roomId)`.
- При сетевых проблемах или отсутствии конфигурации включается демо-режим.
- Чат использует `GET/POST /api/chat`.
- Плеер хранит очередь в `localStorage`.

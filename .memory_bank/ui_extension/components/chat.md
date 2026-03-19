# Component: Chat

## Source
`src/components/chat.tsx`

## Responsibility
Показывает сообщения комнаты и отправляет новые сообщения через API.

## Notes
- Работает только при настроенном Supabase.
- Обновляет список сообщений через polling раз в 3 секунды.

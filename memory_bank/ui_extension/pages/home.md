# Page: Home

## Route
`/`

## Purpose
Точка входа в приложение с основными переходами, быстрым OAuth-входом и персональными рекомендациями.

## Main Components
- `AnimatedBackground`
- `BackgroundMusicPlayer`
- `GitHubButton`
- `RoomRecommendations`

## Data Flow
- Сессия берется через `useSession`.
- При наличии сессии показываются рекомендации через `GET /api/recommendations`.
- Навигация выполнена прямыми ссылками на ключевые разделы приложения.

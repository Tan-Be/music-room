# Pages: Auth

## Routes
- `/register`
- `/auth/signin`
- `/auth/error`

## Purpose
Регистрация, вход и обработка ошибок аутентификации.

## Main Components
- `GitHubButton`
- form-based auth UI на клиенте

## Data Flow
- GitHub OAuth запускается через `next-auth/react`.
- Ошибки авторизации выводятся на отдельной странице `auth/error`.

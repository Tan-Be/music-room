# 🔴 СРОЧНО: Исправление redirect_uri для GitHub OAuth

## Проблема
```
The redirect_uri is not associated with this application.
```

Это означает, что в настройках GitHub OAuth App не указан правильный callback URL.

## Решение

### Шаг 1: Откройте настройки GitHub OAuth App
1. Перейдите: https://github.com/settings/developers
2. Найдите приложение с Client ID: `Ov23liEcvRDYdzdNgFGX`
3. Нажмите на название приложения для редактирования

### Шаг 2: Проверьте и исправьте Authorization callback URL

**Должен быть ТОЧНО:**
```
http://localhost:3000/api/auth/callback/github
```

**Важно:**
- Без слэша в конце
- Точный путь: `/api/auth/callback/github`
- Протокол: `http://` (для localhost)
- Порт: `3000`

### Шаг 3: Сохраните изменения
Нажмите "Update application" внизу страницы.

### Шаг 4: Перезапустите dev сервер
```bash
# Остановите текущий сервер (Ctrl+C)
bun run dev
```

### Шаг 5: Проверьте снова
1. Откройте: http://localhost:3000/auth/signin
2. Нажмите "Войти через GitHub"
3. Должно открыться окно авторизации GitHub без ошибки

## Если используете другой порт

Если ваш dev сервер запущен на другом порту (например, 3001), измените:

**В GitHub OAuth App:**
```
http://localhost:3001/api/auth/callback/github
```

**В .env:**
```
NEXTAUTH_URL=http://localhost:3001
```

## Для production (когда будет деплой)

Когда будете деплоить на production, добавьте второй callback URL:
```
https://ваш-домен.com/api/auth/callback/github
```

GitHub OAuth App поддерживает несколько callback URLs.

## Проверка текущего порта

Если не уверены, на каком порту запущен сервер:
```bash
# Проверьте вывод команды bun run dev
# Должно быть что-то вроде:
# ▲ Next.js 16.1.6
# - Local:        http://localhost:3000
```

## Troubleshooting

### Ошибка всё ещё появляется?
1. Убедитесь, что сохранили изменения в GitHub
2. Очистите cookies браузера для localhost
3. Перезапустите dev сервер
4. Попробуйте в режиме инкогнито

### Проверьте NEXTAUTH_URL
В `.env` должно быть:
```
NEXTAUTH_URL=http://localhost:3000
```

Без слэша в конце!

## Быстрая проверка

Откройте в браузере и проверьте, что URL совпадает:
```
http://localhost:3000/api/auth/callback/github
```

Должна появиться ошибка NextAuth (это нормально), но не ошибка 404.

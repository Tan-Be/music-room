# Инструкция по настройке GitHub OAuth

## Проблема
GitHub OAuth требует настройки, потому что:
1. ✅ Client ID и Secret уже есть в `.env`
2. ✅ `NEXT_PUBLIC_GITHUB_CLIENT_ID` добавлен для клиентской проверки
3. ⚠️ Нужно проверить callback URL в GitHub OAuth App

## Текущие credentials
- **Client ID:** `Ov23liEcvRDYdzdNgFGX`
- **Client Secret:** `455348e8a4e99ae2861ff60fb861b6e3f0bd2567`

## Шаги для проверки/настройки

### 1. Откройте GitHub OAuth App
https://github.com/settings/developers

Найдите приложение с Client ID: `Ov23liEcvRDYdzdNgFGX`

### 2. Проверьте настройки

**Homepage URL:**
```
http://localhost:3000
```

**Authorization callback URL (NextAuth):**
```
http://localhost:3000/api/auth/callback/github
```

### 3. Если нужно создать новое приложение

1. Перейдите: https://github.com/settings/applications/new

2. Заполните форму:
   - **Application name:** Music Room (или любое другое)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
   - **Description:** Music Room - collaborative music listening app

3. Нажмите "Register application"

4. Скопируйте **Client ID** и создайте новый **Client Secret**

5. Обновите `.env`:
   ```bash
   GITHUB_CLIENT_ID=ваш_новый_client_id
   GITHUB_CLIENT_SECRET=ваш_новый_client_secret
   NEXT_PUBLIC_GITHUB_CLIENT_ID=ваш_новый_client_id
   ```

### 4. Для production (когда будет деплой)

Добавьте дополнительный callback URL:
```
https://ваш-домен.com/api/auth/callback/github
```

## Проверка работы

После настройки:

1. Перезапустите dev сервер:
   ```bash
   bun run dev
   ```

2. Откройте: http://localhost:3000/auth/signin

3. Кнопка GitHub должна быть активна (без предупреждения)

4. При клике должен открыться GitHub для авторизации

## Текущий статус

✅ `.env` обновлен с `NEXT_PUBLIC_GITHUB_CLIENT_ID`
✅ Credentials настроены
⚠️ Требуется проверить callback URL в GitHub OAuth App

## Troubleshooting

**Если видите "GitHub OAuth требует настройки":**
- Проверьте, что `NEXT_PUBLIC_GITHUB_CLIENT_ID` есть в `.env`
- Перезапустите dev сервер после изменения `.env`

**Если получаете ошибку redirect_uri_mismatch:**
- Проверьте callback URL в GitHub OAuth App
- Должен быть: `http://localhost:3000/api/auth/callback/github`

**Если авторизация не работает:**
- Проверьте, что Client Secret правильный
- Убедитесь, что приложение не заблокировано в GitHub

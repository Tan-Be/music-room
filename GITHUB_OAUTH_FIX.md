# ✅ GitHub OAuth - Решение проблемы

## Проблема
Компонент показывал предупреждение: "⚠️ GitHub OAuth требует настройки"

## Причина
В компоненте `github-button.tsx` (строка 16) проверялась переменная `NEXT_PUBLIC_GITHUB_CLIENT_ID`, но в `.env` она отсутствовала.

## Решение
Добавлена переменная `NEXT_PUBLIC_GITHUB_CLIENT_ID` в `.env`:

```env
# Github OAuth (for NextAuth server-side)
GITHUB_CLIENT_ID=Ov23liEcvRDYdzdNgFGX
GITHUB_CLIENT_SECRET=455348e8a4e99ae2861ff60fb861b6e3f0bd2567

# Github OAuth (for client-side check)
NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23liEcvRDYdzdNgFGX
```

## Почему нужны обе переменные?

### `GITHUB_CLIENT_ID` и `GITHUB_CLIENT_SECRET`
- Используются NextAuth на **сервере** (API route)
- Не доступны в браузере (безопасно)
- Используются в `src/app/api/auth/[...nextauth]/route.ts`

### `NEXT_PUBLIC_GITHUB_CLIENT_ID`
- Доступна на **клиенте** (в браузере)
- Используется для проверки, настроен ли OAuth
- Используется в `src/components/auth/github-button.tsx`

## Что нужно проверить в GitHub OAuth App

1. **Откройте:** https://github.com/settings/developers
2. **Найдите приложение** с Client ID: `Ov23liEcvRDYdzdNgFGX`
3. **Проверьте Authorization callback URL:**
   ```
   http://localhost:3000/api/auth/callback/github
   ```

## Следующие шаги

1. **Перезапустите dev сервер:**
   ```bash
   bun run dev
   ```

2. **Откройте страницу входа:**
   ```
   http://localhost:3000/auth/signin
   ```

3. **Проверьте:**
   - ✅ Кнопка GitHub должна быть активна
   - ✅ Предупреждение "требует настройки" должно исчезнуть
   - ✅ При клике должен открыться GitHub для авторизации

## Если проблема осталась

### Проверьте переменные окружения:
```bash
# В терминале dev сервера должно быть:
echo %NEXT_PUBLIC_GITHUB_CLIENT_ID%
# Должно вывести: Ov23liEcvRDYdzdNgFGX
```

### Очистите кэш Next.js:
```bash
rm -rf .next
bun run dev
```

### Проверьте консоль браузера:
Откройте DevTools (F12) и проверьте, нет ли ошибок

## Статус

✅ `.env` обновлен  
✅ `NEXT_PUBLIC_GITHUB_CLIENT_ID` добавлен  
✅ Документация создана  
⏳ Требуется перезапуск dev сервера  
⏳ Требуется проверка callback URL в GitHub

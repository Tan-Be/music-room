# 🔐 Настройка OAuth провайдеров в Supabase

## Обзор

Проект Music Room поддерживает вход через следующие OAuth провайдеры:
- ✅ **Google** - самый популярный провайдер
- ✅ **GitHub** - для разработчиков
- ✅ **Spotify** - для музыкальной интеграции

## 📋 Предварительные требования

1. Аккаунт в Supabase
2. Созданный проект в Supabase
3. Аккаунты в Google Cloud, GitHub и Spotify Developer

---

## 🔵 Настройка Google OAuth

### 1. Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**

### 2. Создание OAuth 2.0 Client ID

1. Нажмите **Create Credentials** → **OAuth client ID**
2. Выберите тип приложения: **Web application**
3. Добавьте **Authorized redirect URIs**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
4. Скопируйте **Client ID** и **Client Secret**

### 3. Настройка в Supabase

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в **Authentication** → **Providers**
3. Найдите **Google** и включите его
4. Вставьте **Client ID** и **Client Secret**
5. Сохраните изменения

### 4. Настройка OAuth Consent Screen

1. В Google Cloud Console перейдите в **OAuth consent screen**
2. Выберите **External** (для публичного приложения)
3. Заполните обязательные поля:
   - App name: **Music Room**
   - User support email: ваш email
   - Developer contact information: ваш email
4. Добавьте scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Сохраните и продолжите

---

## ⚫ Настройка GitHub OAuth

### 1. Создание OAuth App в GitHub

1. Перейдите на [GitHub Developer Settings](https://github.com/settings/developers)
2. Нажмите **New OAuth App**
3. Заполните форму:
   - **Application name**: Music Room
   - **Homepage URL**: `https://yourdomain.com` (или localhost для разработки)
   - **Authorization callback URL**:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
4. Нажмите **Register application**
5. Скопируйте **Client ID**
6. Создайте **Client Secret** и скопируйте его

### 2. Настройка в Supabase

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в **Authentication** → **Providers**
3. Найдите **GitHub** и включите его
4. Вставьте **Client ID** и **Client Secret**
5. Сохраните изменения

---

## 🟢 Настройка Spotify OAuth

### 1. Создание приложения в Spotify Developer Dashboard

1. Перейдите на [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Нажмите **Create an App**
3. Заполните форму:
   - **App name**: Music Room
   - **App description**: Collaborative music listening platform
4. Примите условия и создайте приложение

### 2. Настройка Redirect URIs

1. В настройках приложения нажмите **Edit Settings**
2. Добавьте **Redirect URIs**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
3. Сохраните изменения
4. Скопируйте **Client ID** и **Client Secret**

### 3. Настройка в Supabase

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в **Authentication** → **Providers**
3. Найдите **Spotify** и включите его
4. Вставьте **Client ID** и **Client Secret**
5. В поле **Scopes** добавьте:
   ```
   user-read-email user-read-private user-library-read user-top-read playlist-read-private playlist-read-collaborative user-read-playback-state user-modify-playback-state
   ```
6. Сохраните изменения

---

## 🔧 Настройка Callback URL

### Для локальной разработки

Добавьте в `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Для продакшена

Добавьте в переменные окружения Vercel:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 📝 Обновление Supabase Database

После первого входа через OAuth необходимо создать профиль пользователя. Добавьте триггер в Supabase:

```sql
-- Функция для автоматического создания профиля при OAuth входе
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ Проверка настройки

### 1. Локальная разработка

```bash
# Запустите dev сервер
pnpm dev

# Откройте http://localhost:3000/login
# Попробуйте войти через каждый провайдер
```

### 2. Проверка в Supabase Dashboard

1. Перейдите в **Authentication** → **Users**
2. После успешного входа вы увидите нового пользователя
3. Проверьте, что профиль создан в таблице `profiles`

---

## 🐛 Устранение неполадок

### Ошибка: "Invalid redirect URI"

**Решение**: Убедитесь, что redirect URI в OAuth приложении точно совпадает с URL в Supabase:
```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

### Ошибка: "Access denied"

**Решение**: 
1. Проверьте, что OAuth приложение опубликовано (для Google)
2. Убедитесь, что Client ID и Secret правильные
3. Проверьте scopes в настройках провайдера

### Ошибка: "User not found in profiles table"

**Решение**: Убедитесь, что триггер `on_auth_user_created` создан и работает

### Ошибка при локальной разработке

**Решение**: Для локальной разработки используйте ngrok или добавьте `http://localhost:3000/auth/callback` в список разрешенных redirect URIs

---

## 🔒 Безопасность

### Рекомендации:

1. **Никогда не коммитьте** Client Secrets в Git
2. Используйте **переменные окружения** для всех секретов
3. Регулярно **ротируйте** Client Secrets
4. Ограничьте **scopes** только необходимыми
5. Включите **Email verification** в Supabase для дополнительной безопасности

---

## 📚 Дополнительные ресурсы

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Spotify OAuth Documentation](https://developer.spotify.com/documentation/general/guides/authorization/)

---

**Дата создания**: 21.11.2025  
**Статус**: Готово к использованию ✅

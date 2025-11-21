# ⚡ Быстрая настройка OAuth - Music Room

## 🎯 Что нужно сделать

Для работы кнопок входа через Google, GitHub и Spotify нужно настроить OAuth провайдеры в Supabase.

## 📋 Шаги настройки

### 1️⃣ Google OAuth (5 минут)

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект → **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth client ID** → **Web application**
4. Добавьте redirect URI:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
5. Скопируйте **Client ID** и **Client Secret**
6. В Supabase: **Authentication** → **Providers** → **Google** → вставьте данные

### 2️⃣ GitHub OAuth (3 минуты)

1. Откройте [GitHub Developer Settings](https://github.com/settings/developers)
2. **New OAuth App**
3. Заполните:
   - Name: Music Room
   - Callback URL: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
4. Скопируйте **Client ID** и создайте **Client Secret**
5. В Supabase: **Authentication** → **Providers** → **GitHub** → вставьте данные

### 3️⃣ Spotify OAuth (3 минуты)

1. Откройте [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Create an App**
3. В настройках добавьте Redirect URI:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
4. Скопируйте **Client ID** и **Client Secret**
5. В Supabase: **Authentication** → **Providers** → **Spotify** → вставьте данные

### 4️⃣ Настройка базы данных (1 минута)

Выполните в Supabase SQL Editor:

```sql
-- Автоматическое создание профиля при OAuth входе
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## ✅ Готово!

Теперь кнопки входа работают:
- 🔵 **Google** - синяя кнопка с логотипом Google
- ⚫ **GitHub** - черная кнопка с логотипом GitHub
- 🟢 **Spotify** - зеленая кнопка с логотипом Spotify

## 🧪 Тестирование

```bash
# Запустите проект
pnpm dev

# Откройте http://localhost:3000/login
# Попробуйте войти через любой провайдер
```

## 📝 Важно

Для локальной разработки добавьте в каждый OAuth провайдер дополнительный redirect URI:
```
http://localhost:3000/auth/callback
```

---

**Полная документация**: [oauth-setup.md](./oauth-setup.md)

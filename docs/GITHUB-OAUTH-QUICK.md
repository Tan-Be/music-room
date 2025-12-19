# ⚡ GitHub OAuth - Быстрая настройка (2 минуты)

## 1️⃣ GitHub (1 минута)

https://github.com/settings/developers → **New OAuth App**

```
Application name: Music Room
Homepage URL: http://localhost:3000
Callback URL: https://syxjqxfoycmttcmrasgq.supabase.co/auth/v1/callback
```

→ Скопировать **Client ID** и **Client Secret**

---

## 2️⃣ Supabase (1 минута)

https://supabase.com/dashboard/project/syxjqxfoycmttcmrasgq/auth/providers

→ Найти **GitHub** → Включить → Вставить Client ID и Secret → **Save**

---

## 3️⃣ Тест

http://localhost:3000 → **"Войти через GitHub"** → ✅

---

## ⚠️ Важно

Callback URL должен быть ТОЧНО:

```
https://syxjqxfoycmttcmrasgq.supabase.co/auth/v1/callback
```

НЕ `http://localhost:3000/auth/callback` ❌

# 🚀 GitHub OAuth - СДЕЛАТЬ СЕЙЧАС

## 📋 3 простых шага (3 минуты)

### 1️⃣ Создать GitHub приложение
**Открыть:** https://github.com/settings/developers

**Нажать:** "New OAuth App"

**Заполнить:**
```
Application name: Music Room Local Dev
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

**Нажать:** "Register application"

### 2️⃣ Получить данные
- Скопировать **Client ID** (например: `Ov23liABC123DEF456`)
- Нажать **"Generate a new client secret"**
- Скопировать **Client Secret** (например: `ghs_1234567890abcdef...`)

### 3️⃣ Обновить конфигурацию
**В PowerShell (в корне проекта):**
```powershell
.\scripts\setup-github-oauth.ps1 "ВАШ_CLIENT_ID" "ВАШ_CLIENT_SECRET"
```

**Перезапустить сервер:**
```bash
# Ctrl+C, затем:
pnpm dev
```

## ✅ Готово!
Теперь GitHub OAuth работает полноценно на http://localhost:3000/auth/signin
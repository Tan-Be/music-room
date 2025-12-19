# 🔗 Руководство по подключению к GitHub для деплоя

## 📋 Подготовка репозитория GitHub

### Шаг 1: Создание репозитория

1. Зайдите на [github.com](https://github.com)
2. Нажмите "New repository"
3. Заполните данные:
   - **Repository name**: `music-room`
   - **Description**: `🎵 Платформа для совместного прослушивания музыки в реальном времени`
   - **Visibility**: Public (рекомендуется для Vercel)
   - ✅ Add a README file
   - ✅ Add .gitignore (Node)

### Шаг 2: Настройка локального репозитория

```bash
# Инициализация Git (если еще не сделано)
git init

# Добавление remote origin
git remote add origin https://github.com/YOUR_USERNAME/music-room.git

# Проверка статуса
git status

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "feat: initial commit - Music Room MVP ready for deployment"

# Отправка в GitHub
git push -u origin main
```

### Шаг 3: Настройка .gitignore

Убедитесь, что `.gitignore` содержит:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Production builds
.next/
out/
dist/

# Environment variables
.env
.env.local
.env.production
.env.development

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage
coverage/

# Cache
.cache/
.parcel-cache/

# Temporary
.tmp/
temp/

# Build info
.tsbuildinfo
```

## 🔧 Настройка GitHub Actions (опционально)

Создайте `.github/workflows/vercel-deploy.yml`:

```yaml
name: Vercel Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run type check
        run: pnpm run type-check:build

      - name: Run linter
        run: pnpm run lint

      - name: Build project
        run: pnpm run build
```

## 🚀 Подключение к Vercel

### Через Vercel Dashboard:

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Выберите "Import Git Repository"
4. Найдите ваш репозиторий `music-room`
5. Нажмите "Import"

### Настройки проекта в Vercel:

- **Framework Preset**: Next.js (автоопределение)
- **Root Directory**: `./` (корень)
- **Build Command**: `pnpm run build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Development Command**: `pnpm run dev`

## 🔐 Настройка переменных окружения в Vercel

### В Vercel Dashboard:

1. Перейдите в Settings → Environment Variables
2. Добавьте переменные:

```bash
# Обязательные
NEXT_PUBLIC_SUPABASE_URL=https://syxjqxfoycmttcmrasgq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OAuth (опционально)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
Github_OAuth_secret=f26fb6054d63fa3f01791e2b76b34279bf6e069f
```

### Применение к окружениям:

- ✅ Production
- ✅ Preview
- ✅ Development

## 🔄 Автоматический деплой

После настройки каждый push в `main` ветку будет автоматически деплоиться:

```bash
# Внесение изменений
git add .
git commit -m "feat: добавлена новая функция"
git push origin main

# Vercel автоматически начнет деплой
```

## 📊 Мониторинг деплоев

### В Vercel Dashboard:

- **Deployments** - история всех деплоев
- **Functions** - логи serverless функций
- **Analytics** - статистика посещений
- **Speed Insights** - метрики производительности

### Через CLI:

```bash
# Установка Vercel CLI
npm i -g vercel

# Логин
vercel login

# Просмотр деплоев
vercel ls

# Логи в реальном времени
vercel logs --follow
```

## 🚨 Устранение проблем

### Ошибка: "Repository not found"

**Решение**: Убедитесь, что репозиторий публичный или дайте Vercel доступ к приватным репозиториям

### Ошибка: "Build failed"

**Решение**:

1. Проверьте логи сборки в Vercel Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте локальную сборку: `pnpm run build`

### Ошибка: "Environment variables not found"

**Решение**: Добавьте все необходимые переменные в Vercel Settings

## ✅ Чек-лист подключения

- [ ] Репозиторий создан на GitHub
- [ ] Код загружен в репозиторий
- [ ] .gitignore настроен правильно
- [ ] Проект импортирован в Vercel
- [ ] Переменные окружения добавлены
- [ ] Первый деплой успешен
- [ ] Домен работает
- [ ] OAuth настроен для нового домена

---

**🎉 После выполнения всех шагов ваш проект будет автоматически деплоиться при каждом обновлении!**

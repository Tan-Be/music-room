#!/usr/bin/env node

/**
 * Скрипт автоматической настройки GitHub для деплоя на Vercel
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Настройка GitHub для деплоя на Vercel...\n')

// Проверка наличия Git
function checkGitInstalled() {
  try {
    execSync('git --version', { stdio: 'pipe' })
    console.log('✅ Git установлен')
    return true
  } catch (error) {
    console.log('❌ Git не установлен. Установите Git и повторите попытку.')
    return false
  }
}

// Проверка инициализации Git репозитория
function checkGitRepo() {
  try {
    execSync('git status', { stdio: 'pipe' })
    console.log('✅ Git репозиторий инициализирован')
    return true
  } catch (error) {
    console.log('⚠️ Git репозиторий не инициализирован. Инициализируем...')
    try {
      execSync('git init', { stdio: 'inherit' })
      console.log('✅ Git репозиторий инициализирован')
      return true
    } catch (initError) {
      console.log('❌ Ошибка инициализации Git репозитория')
      return false
    }
  }
}

// Создание .gitignore если его нет
function createGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore')

  if (fs.existsSync(gitignorePath)) {
    console.log('✅ .gitignore уже существует')
    return
  }

  const gitignoreContent = `# Dependencies
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

# Vercel
.vercel
`

  fs.writeFileSync(gitignorePath, gitignoreContent)
  console.log('✅ .gitignore создан')
}

// Создание GitHub Actions workflow
function createGitHubActions() {
  const workflowDir = path.join(process.cwd(), '.github', 'workflows')
  const workflowPath = path.join(workflowDir, 'vercel-deploy.yml')

  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true })
  }

  const workflowContent = `name: Vercel Deploy
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
        
      - name: Run deployment readiness check
        run: pnpm run check-deploy
`

  fs.writeFileSync(workflowPath, workflowContent)
  console.log('✅ GitHub Actions workflow создан')
}

// Проверка remote origin
function checkRemoteOrigin() {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      stdio: 'pipe',
      encoding: 'utf8',
    }).trim()

    console.log(`✅ Remote origin настроен: ${remoteUrl}`)
    return true
  } catch (error) {
    console.log('⚠️ Remote origin не настроен')
    return false
  }
}

// Создание README.md
function createReadme() {
  const readmePath = path.join(process.cwd(), 'README.md')

  if (fs.existsSync(readmePath)) {
    console.log('✅ README.md уже существует')
    return
  }

  const readmeContent = `# 🎵 Music Room

Платформа для совместного прослушивания музыки в реальном времени.

## 🚀 Быстрый старт

### Установка зависимостей
\`\`\`bash
pnpm install
\`\`\`

### Настройка переменных окружения
Скопируйте \`.env.example\` в \`.env.local\` и заполните переменные:
\`\`\`bash
cp .env.example .env.local
\`\`\`

### Запуск в режиме разработки
\`\`\`bash
pnpm run dev
\`\`\`

### Сборка для production
\`\`\`bash
pnpm run build
pnpm run start
\`\`\`

## 🧪 Тестирование

\`\`\`bash
# Запуск тестов
pnpm run test

# Проверка готовности к деплою
pnpm run check-deploy
\`\`\`

## 📦 Деплой

Проект настроен для автоматического деплоя на Vercel при push в main ветку.

### Ручной деплой
\`\`\`bash
vercel --prod
\`\`\`

## 🛠️ Технологии

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **UI**: shadcn/ui, Framer Motion
- **State**: Zustand
- **Testing**: Jest, Testing Library
- **Deployment**: Vercel

## 📚 Документация

- [Руководство по деплою](./docs/vercel-deployment-guide.md)
- [Настройка GitHub](./docs/github-integration-guide.md)
- [Мониторинг ошибок](./docs/error-monitoring-setup.md)
- [Конфигурация домена](./docs/domain-configuration-guide.md)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature ветку (\`git checkout -b feature/amazing-feature\`)
3. Commit изменения (\`git commit -m 'Add amazing feature'\`)
4. Push в ветку (\`git push origin feature/amazing-feature\`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл.

## 🎯 Roadmap

- [ ] Интеграция с Spotify API
- [ ] Мобильное приложение
- [ ] Расширенная модерация
- [ ] Премиум функции
- [ ] Международная локализация

---

**Создано с ❤️ для любителей музыки**
`

  fs.writeFileSync(readmePath, readmeContent)
  console.log('✅ README.md создан')
}

// Проверка статуса файлов
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', {
      stdio: 'pipe',
      encoding: 'utf8',
    })

    if (status.trim()) {
      console.log('⚠️ Есть неотслеживаемые изменения:')
      console.log(status)
      return false
    } else {
      console.log('✅ Все файлы отслеживаются Git')
      return true
    }
  } catch (error) {
    console.log('❌ Ошибка проверки статуса Git')
    return false
  }
}

// Основная функция
async function main() {
  console.log('🔍 Проверка готовности к настройке GitHub...\n')

  // Проверки
  if (!checkGitInstalled()) return
  if (!checkGitRepo()) return

  // Создание необходимых файлов
  createGitignore()
  createGitHubActions()
  createReadme()

  // Проверка remote
  const hasRemote = checkRemoteOrigin()

  console.log('\n📋 Следующие шаги:\n')

  if (!hasRemote) {
    console.log('1. 🌐 Создайте репозиторий на GitHub:')
    console.log('   - Зайдите на https://github.com')
    console.log('   - Нажмите "New repository"')
    console.log('   - Название: music-room')
    console.log(
      '   - Описание: 🎵 Платформа для совместного прослушивания музыки'
    )
    console.log('   - Visibility: Public (рекомендуется для Vercel)')
    console.log('')
    console.log('2. 🔗 Добавьте remote origin:')
    console.log(
      '   git remote add origin https://github.com/YOUR_USERNAME/music-room.git'
    )
    console.log('')
  }

  console.log('3. 📦 Добавьте и закоммитьте файлы:')
  console.log('   git add .')
  console.log(
    '   git commit -m "feat: initial commit - Music Room MVP ready for deployment"'
  )
  console.log('')

  console.log('4. 🚀 Отправьте код в GitHub:')
  console.log('   git push -u origin main')
  console.log('')

  console.log('5. 🌐 Подключите к Vercel:')
  console.log('   - Зайдите на https://vercel.com')
  console.log('   - Нажмите "New Project"')
  console.log('   - Выберите ваш репозиторий music-room')
  console.log('   - Настройте переменные окружения')
  console.log('')

  console.log('📚 Подробные инструкции:')
  console.log('   - docs/github-integration-guide.md')
  console.log('   - docs/vercel-deployment-guide.md')
  console.log('')

  console.log('🎉 Настройка GitHub завершена!')
}

// Запуск скрипта
main().catch(console.error)

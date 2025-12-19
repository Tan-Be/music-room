#!/usr/bin/env node

/**
 * Скрипт проверки готовности проекта к деплою на Vercel
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Проверка готовности к деплою на Vercel...\n')

const checks = []

// 1. Проверка сборки проекта
console.log('📦 Проверка сборки проекта...')
try {
  execSync('pnpm run build', { stdio: 'pipe' })
  checks.push({ name: 'Сборка проекта', status: '✅', message: 'Успешно' })
} catch (error) {
  checks.push({
    name: 'Сборка проекта',
    status: '❌',
    message: 'Ошибка сборки',
  })
}

// 2. Проверка переменных окружения
console.log('🔐 Проверка переменных окружения...')
const envFile = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8')
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  const missingVars = requiredVars.filter(
    varName => !envContent.includes(varName)
  )

  if (missingVars.length === 0) {
    checks.push({
      name: 'Переменные окружения',
      status: '✅',
      message: 'Все обязательные переменные найдены',
    })
  } else {
    checks.push({
      name: 'Переменные окружения',
      status: '⚠️',
      message: `Отсутствуют: ${missingVars.join(', ')}`,
    })
  }
} else {
  checks.push({
    name: 'Переменные окружения',
    status: '❌',
    message: 'Файл .env.local не найден',
  })
}

// 3. Проверка package.json
console.log('📋 Проверка package.json...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const requiredScripts = ['build', 'start', 'dev']
const missingScripts = requiredScripts.filter(
  script => !packageJson.scripts[script]
)

if (missingScripts.length === 0) {
  checks.push({
    name: 'Scripts в package.json',
    status: '✅',
    message: 'Все необходимые скрипты найдены',
  })
} else {
  checks.push({
    name: 'Scripts в package.json',
    status: '❌',
    message: `Отсутствуют: ${missingScripts.join(', ')}`,
  })
}

// 4. Проверка Next.js конфигурации
console.log('⚙️ Проверка Next.js конфигурации...')
if (fs.existsSync('next.config.js')) {
  checks.push({
    name: 'Next.js конфигурация',
    status: '✅',
    message: 'next.config.js найден',
  })
} else {
  checks.push({
    name: 'Next.js конфигурация',
    status: '⚠️',
    message: 'next.config.js не найден (опционально)',
  })
}

// 5. Проверка Vercel конфигурации
console.log('🔧 Проверка Vercel конфигурации...')
if (fs.existsSync('vercel.json')) {
  checks.push({
    name: 'Vercel конфигурация',
    status: '✅',
    message: 'vercel.json найден',
  })
} else {
  checks.push({
    name: 'Vercel конфигурация',
    status: '⚠️',
    message: 'vercel.json не найден (опционально)',
  })
}

// 6. Проверка PWA файлов
console.log('📱 Проверка PWA файлов...')
const pwaFiles = ['public/manifest.json', 'public/sw.js']
const missingPwaFiles = pwaFiles.filter(file => !fs.existsSync(file))

if (missingPwaFiles.length === 0) {
  checks.push({
    name: 'PWA файлы',
    status: '✅',
    message: 'Все PWA файлы найдены',
  })
} else {
  checks.push({
    name: 'PWA файлы',
    status: '⚠️',
    message: `Отсутствуют: ${missingPwaFiles.join(', ')}`,
  })
}

// 7. Проверка иконок
console.log('🎨 Проверка иконок...')
const iconSizes = ['192x192', '512x512']
const missingIcons = iconSizes.filter(
  size => !fs.existsSync(`public/icons/icon-${size}.png`)
)

if (missingIcons.length === 0) {
  checks.push({
    name: 'Иконки приложения',
    status: '✅',
    message: 'Все иконки найдены',
  })
} else {
  checks.push({
    name: 'Иконки приложения',
    status: '⚠️',
    message: `Отсутствуют иконки: ${missingIcons.join(', ')}`,
  })
}

// 8. Проверка TypeScript (только production код)
console.log('📝 Проверка TypeScript...')
try {
  execSync('pnpm run type-check:build', { stdio: 'pipe' })
  checks.push({
    name: 'TypeScript проверка',
    status: '✅',
    message: 'Типы корректны',
  })
} catch (error) {
  checks.push({
    name: 'TypeScript проверка',
    status: '❌',
    message: 'Ошибки типов',
  })
}

// 9. Проверка линтера
console.log('🔍 Проверка ESLint...')
try {
  execSync('pnpm run lint', { stdio: 'pipe' })
  checks.push({
    name: 'ESLint проверка',
    status: '✅',
    message: 'Код соответствует стандартам',
  })
} catch (error) {
  checks.push({
    name: 'ESLint проверка',
    status: '⚠️',
    message: 'Есть предупреждения линтера',
  })
}

// Вывод результатов
console.log('\n📊 Результаты проверки:\n')
console.log(
  '┌─────────────────────────────┬────────┬─────────────────────────────────┐'
)
console.log(
  '│ Проверка                    │ Статус │ Сообщение                       │'
)
console.log(
  '├─────────────────────────────┼────────┼─────────────────────────────────┤'
)

checks.forEach(check => {
  const name = check.name.padEnd(27)
  const status = check.status.padEnd(6)
  const message = check.message.padEnd(31)
  console.log(`│ ${name} │ ${status} │ ${message} │`)
})

console.log(
  '└─────────────────────────────┴────────┴─────────────────────────────────┘'
)

// Подсчет результатов
const passed = checks.filter(c => c.status === '✅').length
const warnings = checks.filter(c => c.status === '⚠️').length
const failed = checks.filter(c => c.status === '❌').length

console.log(
  `\n📈 Итого: ${passed} успешно, ${warnings} предупреждений, ${failed} ошибок`
)

if (failed === 0) {
  console.log('\n🎉 Проект готов к деплою на Vercel!')
  console.log('\n📋 Следующие шаги:')
  console.log('1. Убедитесь, что код загружен в GitHub')
  console.log('2. Подключите репозиторий к Vercel')
  console.log('3. Настройте переменные окружения в Vercel')
  console.log('4. Запустите деплой')

  if (warnings > 0) {
    console.log('\n⚠️ Рекомендации:')
    checks
      .filter(c => c.status === '⚠️')
      .forEach(check => {
        console.log(`- ${check.name}: ${check.message}`)
      })
  }
} else {
  console.log('\n❌ Проект не готов к деплою. Исправьте ошибки:')
  checks
    .filter(c => c.status === '❌')
    .forEach(check => {
      console.log(`- ${check.name}: ${check.message}`)
    })
  process.exit(1)
}

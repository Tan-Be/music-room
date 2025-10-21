#!/usr/bin/env node

// Скрипт для проверки конфигурации переменных окружения
const fs = require('fs')
const path = require('path')

console.log('Проверка конфигурации переменных окружения...\n')

// Проверяем наличие файла .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('❌ Файл .env.local не найден')
  console.log('Создайте его, скопировав из .env.local.example:')
  console.log('  cp .env.local.example .env.local\n')
  process.exit(1)
}

// Читаем файл
const envContent = fs.readFileSync(envPath, 'utf8')
console.log('✅ Файл .env.local найден\n')

// Проверяем основные переменные
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const lines = envContent.split('\n')
const envVars = {}

lines.forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=')
    if (key && value) {
      envVars[key.trim()] = value.trim()
    }
  }
})

let hasErrors = false

requiredVars.forEach(varName => {
  if (!envVars[varName]) {
    console.log(`❌ Отсутствует переменная: ${varName}`)
    hasErrors = true
  } else if (envVars[varName].includes('your_') || envVars[varName] === '') {
    console.log(
      `❌ Переменная ${varName} содержит placeholder значение: ${envVars[varName]}`
    )
    hasErrors = true
  } else if (varName.includes('URL') && !envVars[varName].startsWith('http')) {
    console.log(
      `❌ Переменная ${varName} должна начинаться с http:// или https://`
    )
    hasErrors = true
  } else {
    console.log(
      `✅ ${varName}: ${envVars[varName].substring(0, 30)}${envVars[varName].length > 30 ? '...' : ''}`
    )
  }
})

console.log('\n' + '='.repeat(50))

if (hasErrors) {
  console.log('\n⚠️  Обнаружены ошибки в конфигурации!')
  console.log('Пожалуйста, исправьте переменные окружения в файле .env.local')
  console.log('См. документацию: docs/supabase-setup.md')
  process.exit(1)
} else {
  console.log('\n✅ Все переменные окружения настроены корректно!')
  console.log('Можно запускать приложение.')
}

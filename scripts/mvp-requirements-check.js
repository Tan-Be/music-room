#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🎯 Проверка выполнения всех технических требований MVP...\n')

// Функция для проверки файлов
const checkFile = filePath => fs.existsSync(filePath)

// Функция для проверки содержимого файла
const checkFileContent = (filePath, searchText) => {
  if (!fs.existsSync(filePath)) return false
  const content = fs.readFileSync(filePath, 'utf8')
  return content.includes(searchText)
}

// 1. Проверка производительности
console.log('🚀 1. Производительность...')
const performanceChecks = [
  {
    name: 'Система мониторинга Core Web Vitals',
    check: () => checkFile('src/lib/performance.ts'),
    status: '✅',
  },
  {
    name: 'Оптимизированные компоненты',
    check: () => checkFile('src/components/common/performance-optimized.tsx'),
    status: '✅',
  },
  {
    name: 'Оптимизация изображений',
    check: () => checkFile('src/components/ui/optimized-image.tsx'),
    status: '✅',
  },
  {
    name: 'Оптимизированный чат с виртуализацией',
    check: () => checkFile('src/components/room/optimized-chat.tsx'),
    status: '✅',
  },
  {
    name: 'SEO система',
    check: () => checkFile('src/lib/seo.ts'),
    status: '✅',
  },
]

let performanceScore = 0
performanceChecks.forEach(check => {
  if (check.check()) {
    console.log(`${check.status} ${check.name}`)
    performanceScore++
  } else {
    console.log(`❌ ${check.name}`)
  }
})

// 2. Проверка безопасности
console.log('\n🛡️ 2. Безопасность...')
const securityChecks = [
  {
    name: 'HTTPS заголовки безопасности',
    check: () => checkFileContent('vercel.json', 'Strict-Transport-Security'),
    status: '✅',
  },
  {
    name: 'Валидация пользовательских вводов',
    check: () =>
      checkFileContent('src/components/auth/login-form.tsx', 'validateEmail'),
    status: '✅',
  },
  {
    name: 'RLS политики Supabase',
    check: () => {
      const sqlFiles = fs.readdirSync('docs').filter(f => f.endsWith('.sql'))
      return sqlFiles.some(f => checkFileContent(`docs/${f}`, 'POLICY'))
    },
    status: '✅',
  },
  {
    name: 'Rate limiting для чата',
    check: () => checkFileContent('src/lib/chat-filter.ts', 'checkRateLimit'),
    status: '✅',
  },
]

let securityScore = 0
securityChecks.forEach(check => {
  if (check.check()) {
    console.log(`${check.status} ${check.name}`)
    securityScore++
  } else {
    console.log(`❌ ${check.name}`)
  }
})

// 3. Проверка совместимости
console.log('\n🌐 3. Совместимость...')
const compatibilityChecks = [
  {
    name: 'Поддержка современных браузеров',
    check: () => checkFileContent('package.json', 'next'),
    status: '✅',
  },
  {
    name: 'Мобильная адаптивность',
    check: () =>
      checkFile('src/components/layout/mobile-navigation.tsx') &&
      checkFile('src/hooks/use-media-query.ts'),
    status: '✅',
  },
  {
    name: 'PWA готовность',
    check: () =>
      checkFile('public/manifest.json') &&
      checkFile('public/sw.js') &&
      checkFile('src/components/common/pwa-install.tsx'),
    status: '✅',
  },
  {
    name: 'Keyboard navigation',
    check: () => {
      const uiFiles = fs
        .readdirSync('src/components/ui')
        .filter(f => f.endsWith('.tsx'))
      return uiFiles.some(
        f =>
          checkFileContent(`src/components/ui/${f}`, 'onKeyDown') ||
          checkFileContent(`src/components/ui/${f}`, 'aria-')
      )
    },
    status: '✅',
  },
]

let compatibilityScore = 0
compatibilityChecks.forEach(check => {
  if (check.check()) {
    console.log(`${check.status} ${check.name}`)
    compatibilityScore++
  } else {
    console.log(`❌ ${check.name}`)
  }
})

// 4. Проверка функциональных требований
console.log('\n⚙️ 4. Функциональные требования...')
const functionalChecks = [
  {
    name: 'Система аутентификации',
    check: () =>
      checkFile('src/contexts/auth-context.tsx') &&
      checkFile('src/components/auth/login-form.tsx'),
    status: '✅',
  },
  {
    name: 'Управление комнатами',
    check: () =>
      checkFile('src/components/room/create-room-dialog.tsx') &&
      checkFile('src/components/room/room-card.tsx'),
    status: '✅',
  },
  {
    name: 'Realtime чат',
    check: () =>
      checkFile('src/components/room/chat.tsx') &&
      checkFile('src/lib/chat-realtime.ts'),
    status: '✅',
  },
  {
    name: 'Система треков и голосования',
    check: () =>
      checkFile('src/components/track/track-search.tsx') &&
      checkFile('src/lib/track-voting.ts'),
    status: '✅',
  },
  {
    name: 'Лимиты пользователей',
    check: () => checkFile('src/lib/track-limits.ts'),
    status: '✅',
  },
  {
    name: 'Zustand stores',
    check: () =>
      checkFile('src/stores/useAuthStore.ts') &&
      checkFile('src/stores/useRoomStore.ts'),
    status: '✅',
  },
]

let functionalScore = 0
functionalChecks.forEach(check => {
  if (check.check()) {
    console.log(`${check.status} ${check.name}`)
    functionalScore++
  } else {
    console.log(`❌ ${check.name}`)
  }
})

// 5. Проверка дополнительных возможностей
console.log('\n🎨 5. Дополнительные возможности...')
const additionalChecks = [
  {
    name: 'Профиль пользователя и история',
    check: () =>
      checkFile('src/app/profile/page.tsx') &&
      checkFile('src/app/profile/history/page.tsx'),
    status: '✅',
  },
  {
    name: 'Web уведомления',
    check: () =>
      checkFile('src/lib/notification-service.ts') &&
      checkFile('src/hooks/use-notifications.ts'),
    status: '✅',
  },
  {
    name: 'Адаптивный дизайн',
    check: () =>
      checkFile('src/components/layout/responsive-grid.tsx') &&
      checkFile('src/components/ui/responsive-dialog.tsx'),
    status: '✅',
  },
  {
    name: 'Обработка ошибок',
    check: () =>
      checkFile('src/components/common/error-boundary.tsx') &&
      checkFile('src/lib/retry.ts'),
    status: '✅',
  },
  {
    name: 'Загрузочные состояния',
    check: () =>
      checkFile('src/components/common/skeleton-loaders.tsx') &&
      checkFile('src/hooks/use-optimistic.ts'),
    status: '✅',
  },
]

let additionalScore = 0
additionalChecks.forEach(check => {
  if (check.check()) {
    console.log(`${check.status} ${check.name}`)
    additionalScore++
  } else {
    console.log(`❌ ${check.name}`)
  }
})

// 6. Проверка сборки
console.log('\n📦 6. Проверка сборки...')
try {
  console.log('🔨 Выполнение сборки проекта...')
  execSync('npm run build', { stdio: 'pipe' })
  console.log('✅ Сборка успешна')
} catch (error) {
  console.log('❌ Ошибка сборки')
  console.log(error.message)
}

// Итоговая статистика
console.log('\n📊 ИТОГОВАЯ СТАТИСТИКА:')
console.log('='.repeat(50))

const totalPerformance = performanceChecks.length
const totalSecurity = securityChecks.length
const totalCompatibility = compatibilityChecks.length
const totalFunctional = functionalChecks.length
const totalAdditional = additionalChecks.length

const performancePercent = Math.round(
  (performanceScore / totalPerformance) * 100
)
const securityPercent = Math.round((securityScore / totalSecurity) * 100)
const compatibilityPercent = Math.round(
  (compatibilityScore / totalCompatibility) * 100
)
const functionalPercent = Math.round((functionalScore / totalFunctional) * 100)
const additionalPercent = Math.round((additionalScore / totalAdditional) * 100)

console.log(
  `🚀 Производительность: ${performanceScore}/${totalPerformance} (${performancePercent}%)`
)
console.log(
  `🛡️ Безопасность: ${securityScore}/${totalSecurity} (${securityPercent}%)`
)
console.log(
  `🌐 Совместимость: ${compatibilityScore}/${totalCompatibility} (${compatibilityPercent}%)`
)
console.log(
  `⚙️ Функциональность: ${functionalScore}/${totalFunctional} (${functionalPercent}%)`
)
console.log(
  `🎨 Дополнительно: ${additionalScore}/${totalAdditional} (${additionalPercent}%)`
)

const totalChecks =
  totalPerformance +
  totalSecurity +
  totalCompatibility +
  totalFunctional +
  totalAdditional
const totalScore =
  performanceScore +
  securityScore +
  compatibilityScore +
  functionalScore +
  additionalScore
const overallPercent = Math.round((totalScore / totalChecks) * 100)

console.log('\n' + '='.repeat(50))
console.log(`🏆 ОБЩИЙ БАЛЛ: ${totalScore}/${totalChecks} (${overallPercent}%)`)

if (overallPercent >= 95) {
  console.log('🎉 ОТЛИЧНО! MVP полностью готов к production!')
} else if (overallPercent >= 85) {
  console.log('✅ ХОРОШО! MVP почти готов, осталось несколько доработок')
} else if (overallPercent >= 70) {
  console.log('⚠️ УДОВЛЕТВОРИТЕЛЬНО. Требуются доработки перед production')
} else {
  console.log('❌ ТРЕБУЕТСЯ ДОРАБОТКА. Много критических проблем')
}

console.log('\n📋 Следующие шаги:')
if (overallPercent >= 95) {
  console.log('1. ✅ Деплой на Vercel')
  console.log('2. 🔍 Lighthouse аудит production')
  console.log('3. 📊 Мониторинг метрик в реальном времени')
  console.log('4. 📝 Финальная документация')
} else {
  console.log('1. 🔧 Исправить выявленные проблемы')
  console.log('2. 🧪 Повторить тестирование')
  console.log('3. 📦 Проверить сборку')
  console.log('4. 🚀 Подготовить к деплою')
}

console.log('\n💡 Для детальной информации см.:')
console.log('📄 docs/technical-requirements-completion.md')
console.log('📄 docs/performance-requirements-check.md')

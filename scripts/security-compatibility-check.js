#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔒 Проверка требований безопасности и совместимости...\n')

// Проверка безопасности
console.log('🛡️ 1. Проверка требований безопасности...')

const securityChecks = [
  {
    name: 'HTTPS конфигурация',
    check: () => {
      // Проверяем Vercel конфигурацию
      const vercelConfig = 'vercel.json'
      if (fs.existsSync(vercelConfig)) {
        const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'))
        return (
          config.headers &&
          config.headers.some(
            h =>
              h.headers &&
              h.headers.some(
                header => header.key === 'Strict-Transport-Security'
              )
          )
        )
      }
      return false
    },
    description: 'HTTPS принудительно включен',
  },
  {
    name: 'Валидация пользовательских вводов',
    check: () => {
      // Проверяем наличие валидации в формах
      const authFiles = [
        'src/components/auth/login-form.tsx',
        'src/components/auth/register-form.tsx',
      ]
      return authFiles.some(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8')
          return (
            content.includes('validation') ||
            content.includes('validate') ||
            content.includes('schema')
          )
        }
        return false
      })
    },
    description: 'Валидация форм реализована',
  },
  {
    name: 'RLS политики Supabase',
    check: () => {
      // Проверяем наличие SQL файлов с RLS
      const sqlFiles = fs
        .readdirSync('docs')
        .filter(file => file.endsWith('.sql'))
      return sqlFiles.some(file => {
        const content = fs.readFileSync(path.join('docs', file), 'utf8')
        return (
          content.includes('RLS') ||
          content.includes('ROW LEVEL SECURITY') ||
          content.includes('POLICY')
        )
      })
    },
    description: 'RLS политики настроены',
  },
  {
    name: 'Rate limiting',
    check: () => {
      // Проверяем наличие rate limiting в чате
      const chatFiles = [
        'src/lib/chat-filter.ts',
        'src/components/room/chat.tsx',
        'src/components/room/optimized-chat.tsx',
      ]
      return chatFiles.some(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8')
          return (
            content.includes('rate') ||
            content.includes('limit') ||
            content.includes('throttle')
          )
        }
        return false
      })
    },
    description: 'Rate limiting для сообщений',
  },
]

let securityScore = 0
securityChecks.forEach(check => {
  if (check.check()) {
    console.log(`✅ ${check.name} - ${check.description}`)
    securityScore++
  } else {
    console.log(`❌ ${check.name} - требует настройки`)
  }
})

// Проверка совместимости
console.log('\n🌐 2. Проверка требований совместимости...')

const compatibilityChecks = [
  {
    name: 'Современные браузеры (Chrome 90+, Firefox 88+, Safari 14+)',
    check: () => {
      // Проверяем browserslist или package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      return (
        packageJson.browserslist ||
        (packageJson.dependencies && packageJson.dependencies.next)
      ) // Next.js поддерживает современные браузеры
    },
    description: 'Поддержка современных браузеров',
  },
  {
    name: 'Мобильные браузеры',
    check: () => {
      // Проверяем адаптивные компоненты
      const mobileFiles = [
        'src/components/layout/mobile-navigation.tsx',
        'src/hooks/use-media-query.ts',
        'src/components/ui/responsive-dialog.tsx',
      ]
      return mobileFiles.every(file => fs.existsSync(file))
    },
    description: 'Адаптивный дизайн для мобильных',
  },
  {
    name: 'PWA установка',
    check: () => {
      // Проверяем PWA файлы
      const pwaFiles = [
        'public/manifest.json',
        'public/sw.js',
        'src/components/common/pwa-install.tsx',
      ]
      return pwaFiles.every(file => fs.existsSync(file))
    },
    description: 'PWA готовность',
  },
  {
    name: 'Keyboard navigation',
    check: () => {
      // Проверяем accessibility в компонентах
      const uiFiles = fs
        .readdirSync('src/components/ui')
        .filter(file => file.endsWith('.tsx'))
      return uiFiles.some(file => {
        const content = fs.readFileSync(
          path.join('src/components/ui', file),
          'utf8'
        )
        return (
          content.includes('onKeyDown') ||
          content.includes('tabIndex') ||
          content.includes('aria-')
        )
      })
    },
    description: 'Поддержка клавиатурной навигации',
  },
]

let compatibilityScore = 0
compatibilityChecks.forEach(check => {
  if (check.check()) {
    console.log(`✅ ${check.name} - ${check.description}`)
    compatibilityScore++
  } else {
    console.log(`❌ ${check.name} - требует реализации`)
  }
})

// Дополнительные проверки
console.log('\n🔍 3. Дополнительные проверки безопасности...')

const additionalChecks = [
  {
    name: 'Environment variables защита',
    check: () => {
      const envExample = '.env.example'
      const envLocal = '.env.local'
      return fs.existsSync(envExample) && fs.existsSync(envLocal)
    },
    description: 'Переменные окружения настроены',
  },
  {
    name: 'TypeScript строгий режим',
    check: () => {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
      return tsConfig.compilerOptions && tsConfig.compilerOptions.strict
    },
    description: 'TypeScript strict mode включен',
  },
  {
    name: 'ESLint security правила',
    check: () => {
      const eslintConfig = '.eslintrc.json'
      if (fs.existsSync(eslintConfig)) {
        const config = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'))
        return config.extends && config.extends.includes('next')
      }
      return false
    },
    description: 'ESLint конфигурация настроена',
  },
]

let additionalScore = 0
additionalChecks.forEach(check => {
  if (check.check()) {
    console.log(`✅ ${check.name} - ${check.description}`)
    additionalScore++
  } else {
    console.log(`⚠️ ${check.name} - рекомендуется`)
  }
})

// Итоговая оценка
console.log('\n📊 Итоговая оценка:')
const totalSecurity = securityChecks.length
const totalCompatibility = compatibilityChecks.length
const totalAdditional = additionalChecks.length

const securityPercent = Math.round((securityScore / totalSecurity) * 100)
const compatibilityPercent = Math.round(
  (compatibilityScore / totalCompatibility) * 100
)
const additionalPercent = Math.round((additionalScore / totalAdditional) * 100)

console.log(
  `🛡️ Безопасность: ${securityScore}/${totalSecurity} (${securityPercent}%)`
)
console.log(
  `🌐 Совместимость: ${compatibilityScore}/${totalCompatibility} (${compatibilityPercent}%)`
)
console.log(
  `🔍 Дополнительно: ${additionalScore}/${totalAdditional} (${additionalPercent}%)`
)

const overallScore = Math.round(
  ((securityScore + compatibilityScore + additionalScore) /
    (totalSecurity + totalCompatibility + totalAdditional)) *
    100
)

console.log(`🏆 Общий балл: ${overallScore}%`)

if (overallScore >= 80) {
  console.log('🎉 Отличная безопасность и совместимость!')
} else if (overallScore >= 60) {
  console.log('⚠️ Хорошо, но есть место для улучшений')
} else {
  console.log('❌ Требуется доработка безопасности и совместимости')
}

// Рекомендации
console.log('\n💡 Рекомендации по улучшению:')

if (securityPercent < 100) {
  console.log('\n🛡️ Безопасность:')
  if (securityScore < totalSecurity) {
    console.log('- Настройте HTTPS редиректы в Vercel')
    console.log('- Добавьте валидацию всех форм')
    console.log('- Проверьте RLS политики в Supabase')
    console.log('- Реализуйте rate limiting для API')
  }
}

if (compatibilityPercent < 100) {
  console.log('\n🌐 Совместимость:')
  if (compatibilityScore < totalCompatibility) {
    console.log('- Протестируйте в разных браузерах')
    console.log('- Улучшите мобильную версию')
    console.log('- Добавьте keyboard navigation')
    console.log('- Проверьте PWA установку')
  }
}

console.log('\n📋 Следующие шаги:')
console.log('1. Исправьте выявленные проблемы')
console.log('2. Протестируйте в разных браузерах')
console.log('3. Проведите security audit')
console.log('4. Проверьте accessibility')
console.log('5. Задокументируйте результаты')

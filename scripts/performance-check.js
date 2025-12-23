#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Проверка технических требований производительности...\n')

// Проверка 1: Время сборки (должно быть разумным)
console.log('📦 1. Проверка времени сборки...')
const buildStart = Date.now()
try {
  execSync('npm run build', { stdio: 'pipe' })
  const buildTime = Date.now() - buildStart
  const buildTimeSeconds = (buildTime / 1000).toFixed(1)

  if (buildTime < 60000) {
    // менее 60 секунд
    console.log(`✅ Сборка завершена за ${buildTimeSeconds}с (отлично)`)
  } else if (buildTime < 120000) {
    // менее 2 минут
    console.log(`⚠️ Сборка завершена за ${buildTimeSeconds}с (приемлемо)`)
  } else {
    console.log(`❌ Сборка завершена за ${buildTimeSeconds}с (медленно)`)
  }
} catch (error) {
  console.log('❌ Ошибка сборки')
  process.exit(1)
}

// Проверка 2: Размер бандла
console.log('\n📊 2. Анализ размера бандла...')
const nextDir = path.join(process.cwd(), '.next')
const staticDir = path.join(nextDir, 'static')

if (fs.existsSync(staticDir)) {
  const chunksDir = path.join(staticDir, 'chunks')
  if (fs.existsSync(chunksDir)) {
    const files = fs.readdirSync(chunksDir)
    const jsFiles = files.filter(file => file.endsWith('.js'))

    let totalSize = 0
    jsFiles.forEach(file => {
      const filePath = path.join(chunksDir, file)
      const stats = fs.statSync(filePath)
      totalSize += stats.size
    })

    const totalSizeKB = Math.round(totalSize / 1024)
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1)

    console.log(`📦 Общий размер JS: ${totalSizeKB}KB (${totalSizeMB}MB)`)

    if (totalSize < 500 * 1024) {
      // менее 500KB
      console.log('✅ Размер бандла оптимален')
    } else if (totalSize < 1024 * 1024) {
      // менее 1MB
      console.log('⚠️ Размер бандла приемлем')
    } else {
      console.log('❌ Размер бандла превышает рекомендуемый (>1MB)')
    }
  }
}

// Проверка 3: TypeScript производительность
console.log('\n🔍 3. Проверка TypeScript...')
const typeCheckStart = Date.now()
try {
  execSync('npm run type-check:build', { stdio: 'pipe' })
  const typeCheckTime = Date.now() - typeCheckStart
  const typeCheckSeconds = (typeCheckTime / 1000).toFixed(1)

  if (typeCheckTime < 10000) {
    // менее 10 секунд
    console.log(`✅ Проверка типов завершена за ${typeCheckSeconds}с (быстро)`)
  } else if (typeCheckTime < 30000) {
    // менее 30 секунд
    console.log(
      `⚠️ Проверка типов завершена за ${typeCheckSeconds}с (приемлемо)`
    )
  } else {
    console.log(
      `❌ Проверка типов завершена за ${typeCheckSeconds}с (медленно)`
    )
  }
} catch (error) {
  console.log('❌ Ошибки TypeScript найдены')
}

// Проверка 4: Анализ структуры проекта для производительности
console.log('\n⚡ 4. Анализ оптимизаций производительности...')

const optimizations = [
  {
    name: 'Next.js Image оптимизация',
    check: () => fs.existsSync('src/components/ui/optimized-image.tsx'),
    description: 'Компонент оптимизированных изображений',
  },
  {
    name: 'Lazy loading компонентов',
    check: () =>
      fs.existsSync('src/components/common/performance-optimized.tsx'),
    description: 'HOC для оптимизации производительности',
  },
  {
    name: 'Мониторинг производительности',
    check: () => fs.existsSync('src/lib/performance.ts'),
    description: 'Система мониторинга Core Web Vitals',
  },
  {
    name: 'Оптимизированный чат',
    check: () => fs.existsSync('src/components/room/optimized-chat.tsx'),
    description: 'Виртуализация и debounce для чата',
  },
  {
    name: 'SEO оптимизация',
    check: () => fs.existsSync('src/lib/seo.ts'),
    description: 'Система SEO и метаданных',
  },
]

let optimizationScore = 0
optimizations.forEach(opt => {
  if (opt.check()) {
    console.log(`✅ ${opt.name} - ${opt.description}`)
    optimizationScore++
  } else {
    console.log(`❌ ${opt.name} - отсутствует`)
  }
})

// Проверка 5: Конфигурация производительности
console.log('\n⚙️ 5. Проверка конфигурации...')

const configs = [
  {
    name: 'Next.js конфигурация',
    check: () => {
      const configPath = 'next.config.js'
      if (fs.existsSync(configPath)) {
        const config = fs.readFileSync(configPath, 'utf8')
        return config.includes('compress') || config.includes('optimization')
      }
      return false
    },
  },
  {
    name: 'Vercel конфигурация',
    check: () => fs.existsSync('vercel.json'),
  },
  {
    name: 'TypeScript build конфигурация',
    check: () => fs.existsSync('tsconfig.build.json'),
  },
]

let configScore = 0
configs.forEach(config => {
  if (config.check()) {
    console.log(`✅ ${config.name}`)
    configScore++
  } else {
    console.log(`❌ ${config.name} - не настроена`)
  }
})

// Итоговая оценка
console.log('\n🎯 Итоговая оценка производительности:')
const totalOptimizations = optimizations.length
const totalConfigs = configs.length
const optimizationPercent = Math.round(
  (optimizationScore / totalOptimizations) * 100
)
const configPercent = Math.round((configScore / totalConfigs) * 100)

console.log(
  `📊 Оптимизации: ${optimizationScore}/${totalOptimizations} (${optimizationPercent}%)`
)
console.log(
  `⚙️ Конфигурация: ${configScore}/${totalConfigs} (${configPercent}%)`
)

const overallScore = Math.round(
  ((optimizationScore + configScore) / (totalOptimizations + totalConfigs)) *
    100
)
console.log(`🏆 Общий балл: ${overallScore}%`)

if (overallScore >= 80) {
  console.log('🎉 Отличная производительность!')
} else if (overallScore >= 60) {
  console.log('⚠️ Хорошая производительность, есть место для улучшений')
} else {
  console.log('❌ Требуется оптимизация производительности')
}

// Рекомендации по улучшению производительности
console.log('\n💡 Рекомендации для достижения целевых метрик:')
console.log('📈 Время загрузки < 2 сек:')
console.log('  - Используйте Next.js Image для оптимизации изображений')
console.log('  - Включите сжатие gzip/brotli на сервере')
console.log('  - Минимизируйте размер бандла')

console.log('\n⚡ First Contentful Paint < 1.5 сек:')
console.log('  - Используйте Server-Side Rendering (SSR)')
console.log('  - Оптимизируйте критический CSS')
console.log('  - Предзагружайте важные ресурсы')

console.log('\n🚀 Lighthouse Score > 90:')
console.log('  - Следуйте лучшим практикам веб-разработки')
console.log('  - Оптимизируйте доступность и SEO')
console.log('  - Используйте современные веб-стандарты')

console.log('\n💬 Задержка чата < 500мс:')
console.log('  - Используйте WebSocket соединения')
console.log('  - Реализуйте debounce для ввода')
console.log('  - Оптимизируйте рендеринг списков сообщений')

console.log('\n📝 Для полного тестирования производительности:')
console.log('1. Запустите приложение: npm run dev')
console.log('2. Откройте Chrome DevTools > Lighthouse')
console.log('3. Запустите аудит производительности')
console.log('4. Проверьте Core Web Vitals в реальных условиях')

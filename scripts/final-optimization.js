#!/usr/bin/env node

/**
 * Скрипт финальной оптимизации Music Room
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Финальная оптимизация Music Room...\n')

// Проверка и оптимизация изображений
function optimizeImages() {
  console.log('🖼️ Оптимизация изображений...')

  const publicDir = path.join(process.cwd(), 'public')
  const iconsDir = path.join(publicDir, 'icons')

  if (!fs.existsSync(iconsDir)) {
    console.log('⚠️ Папка icons не найдена. Создайте иконки с помощью:')
    console.log('   Откройте scripts/generate-png-icons.html в браузере')
    return false
  }

  const requiredIcons = ['icon-192x192.png', 'icon-512x512.png']
  const missingIcons = requiredIcons.filter(
    icon => !fs.existsSync(path.join(iconsDir, icon))
  )

  if (missingIcons.length > 0) {
    console.log(`⚠️ Отсутствуют иконки: ${missingIcons.join(', ')}`)
    return false
  }

  console.log('✅ Все необходимые иконки найдены')
  return true
}

// Анализ bundle size
function analyzeBundleSize() {
  console.log('\n📊 Анализ размера бандла...')

  try {
    // Проверяем наличие сборки
    const nextDir = path.join(process.cwd(), '.next')
    if (!fs.existsSync(nextDir)) {
      console.log('📦 Создание production сборки...')
      execSync('pnpm run build', { stdio: 'inherit' })
    }

    // Запускаем анализ
    require('./analyze-bundle.js')
    return true
  } catch (error) {
    console.log('❌ Ошибка анализа бандла:', error.message)
    return false
  }
}

// Проверка SEO настроек
function checkSEOOptimization() {
  console.log('\n🔍 Проверка SEO оптимизации...')

  const checks = []

  // Проверка robots.txt
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt')
  if (fs.existsSync(robotsPath)) {
    checks.push({ name: 'robots.txt', status: '✅' })
  } else {
    checks.push({ name: 'robots.txt', status: '❌' })
  }

  // Проверка sitemap
  const sitemapPath = path.join(process.cwd(), 'src', 'app', 'sitemap.ts')
  if (fs.existsSync(sitemapPath)) {
    checks.push({ name: 'sitemap.ts', status: '✅' })
  } else {
    checks.push({ name: 'sitemap.ts', status: '❌' })
  }

  // Проверка manifest.json
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json')
  if (fs.existsSync(manifestPath)) {
    checks.push({ name: 'manifest.json', status: '✅' })
  } else {
    checks.push({ name: 'manifest.json', status: '❌' })
  }

  // Проверка SEO библиотеки
  const seoPath = path.join(process.cwd(), 'src', 'lib', 'seo.ts')
  if (fs.existsSync(seoPath)) {
    checks.push({ name: 'SEO библиотека', status: '✅' })
  } else {
    checks.push({ name: 'SEO библиотека', status: '❌' })
  }

  console.log('SEO компоненты:')
  checks.forEach(check => {
    console.log(`  ${check.status} ${check.name}`)
  })

  return checks.every(check => check.status === '✅')
}

// Проверка кэширования
function checkCachingConfiguration() {
  console.log('\n⚡ Проверка конфигурации кэширования...')

  const vercelConfigPath = path.join(process.cwd(), 'vercel.json')

  if (!fs.existsSync(vercelConfigPath)) {
    console.log('❌ vercel.json не найден')
    return false
  }

  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'))

    const hasHeaders = vercelConfig.headers && vercelConfig.headers.length > 0
    const hasStaticCaching = vercelConfig.headers?.some(header =>
      header.source.includes('_next/static')
    )
    const hasImageCaching = vercelConfig.headers?.some(header =>
      header.source.includes('\\.(ico|png|jpg|jpeg|gif|webp|avif|svg)')
    )

    console.log('Конфигурация кэширования:')
    console.log(`  ${hasHeaders ? '✅' : '❌'} Headers настроены`)
    console.log(`  ${hasStaticCaching ? '✅' : '❌'} Кэширование статики`)
    console.log(`  ${hasImageCaching ? '✅' : '❌'} Кэширование изображений`)

    return hasHeaders && hasStaticCaching && hasImageCaching
  } catch (error) {
    console.log('❌ Ошибка чтения vercel.json:', error.message)
    return false
  }
}

// Проверка производительности
function checkPerformanceOptimizations() {
  console.log('\n⚡ Проверка оптимизаций производительности...')

  const nextConfigPath = path.join(process.cwd(), 'next.config.js')

  if (!fs.existsSync(nextConfigPath)) {
    console.log('❌ next.config.js не найден')
    return false
  }

  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')

  const optimizations = [
    {
      name: 'Bundle Analyzer',
      check: nextConfigContent.includes('withBundleAnalyzer'),
    },
    {
      name: 'SWC Minify',
      check: nextConfigContent.includes('swcMinify: true'),
    },
    {
      name: 'Image Optimization',
      check: nextConfigContent.includes('images:'),
    },
    {
      name: 'Webpack Optimization',
      check: nextConfigContent.includes('webpack:'),
    },
    {
      name: 'Experimental Features',
      check: nextConfigContent.includes('experimental:'),
    },
  ]

  console.log('Оптимизации производительности:')
  optimizations.forEach(opt => {
    console.log(`  ${opt.check ? '✅' : '❌'} ${opt.name}`)
  })

  return optimizations.every(opt => opt.check)
}

// Генерация отчета оптимизации
function generateOptimizationReport() {
  console.log('\n📋 Генерация отчета оптимизации...')

  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      images: optimizeImages(),
      bundleSize: analyzeBundleSize(),
      seo: checkSEOOptimization(),
      caching: checkCachingConfiguration(),
      performance: checkPerformanceOptimizations(),
    },
  }

  const reportPath = path.join(
    process.cwd(),
    'docs',
    'optimization-report.json'
  )
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log(`📄 Отчет сохранен: ${reportPath}`)

  return report
}

// Рекомендации по дальнейшей оптимизации
function generateRecommendations(report) {
  console.log('\n💡 Рекомендации по оптимизации:\n')

  const recommendations = []

  if (!report.checks.images) {
    recommendations.push({
      priority: 'Высокий',
      task: 'Создать PWA иконки',
      action:
        'Откройте scripts/generate-png-icons.html и создайте иконки 192x192 и 512x512',
    })
  }

  if (!report.checks.seo) {
    recommendations.push({
      priority: 'Средний',
      task: 'Завершить SEO настройки',
      action: 'Проверьте наличие всех SEO файлов и метаданных',
    })
  }

  if (!report.checks.caching) {
    recommendations.push({
      priority: 'Средний',
      task: 'Настроить кэширование',
      action: 'Обновите vercel.json с правильными заголовками кэширования',
    })
  }

  // Дополнительные рекомендации
  recommendations.push(
    {
      priority: 'Низкий',
      task: 'Мониторинг производительности',
      action: 'Настройте Vercel Analytics и Speed Insights',
    },
    {
      priority: 'Низкий',
      task: 'Оптимизация шрифтов',
      action: 'Используйте font-display: swap для веб-шрифтов',
    },
    {
      priority: 'Низкий',
      task: 'Lazy loading',
      action: 'Добавьте lazy loading для тяжелых компонентов',
    }
  )

  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.priority}] ${rec.task}`)
    console.log(`   ${rec.action}\n`)
  })
}

// Основная функция
async function main() {
  try {
    console.log('🎯 Запуск финальной оптимизации...\n')

    const report = generateOptimizationReport()

    const totalChecks = Object.keys(report.checks).length
    const passedChecks = Object.values(report.checks).filter(Boolean).length
    const score = Math.round((passedChecks / totalChecks) * 100)

    console.log('\n📊 Результаты оптимизации:')
    console.log(`Пройдено проверок: ${passedChecks}/${totalChecks}`)
    console.log(`Общий балл: ${score}%\n`)

    if (score >= 80) {
      console.log('🎉 Отличная работа! Приложение хорошо оптимизировано.')
    } else if (score >= 60) {
      console.log('👍 Хорошо! Есть несколько областей для улучшения.')
    } else {
      console.log('⚠️ Требуется дополнительная оптимизация.')
    }

    generateRecommendations(report)

    console.log('🚀 Финальная оптимизация завершена!')
    console.log('\n📋 Следующие шаги:')
    console.log('1. Исправьте найденные проблемы')
    console.log('2. Запустите pnpm run analyze для детального анализа бандла')
    console.log('3. Протестируйте производительность с помощью Lighthouse')
    console.log('4. Деплойте на Vercel')
  } catch (error) {
    console.error('❌ Ошибка оптимизации:', error.message)
    process.exit(1)
  }
}

// Запуск
if (require.main === module) {
  main()
}

module.exports = {
  optimizeImages,
  analyzeBundleSize,
  checkSEOOptimization,
  checkCachingConfiguration,
  checkPerformanceOptimizations,
}

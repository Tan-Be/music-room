#!/usr/bin/env node

/**
 * Скрипт тестирования производительности Music Room
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Тестирование производительности Music Room...\n')

// Пороговые значения производительности
const PERFORMANCE_THRESHOLDS = {
  pageLoadTime: 2000, // < 2 сек
  fcp: 1500, // < 1.5 сек
  lcp: 2500, // < 2.5 сек
  cls: 0.1, // < 0.1
  fid: 100, // < 100мс
  chatLatency: 500, // < 500мс
  lighthouseScore: 90, // > 90
}

// Функция для запуска Lighthouse аудита
async function runLighthouseAudit() {
  console.log('🔍 Запуск Lighthouse аудита...')

  try {
    // Проверяем, установлен ли Lighthouse
    try {
      execSync('lighthouse --version', { stdio: 'pipe' })
    } catch (error) {
      console.log('📦 Установка Lighthouse...')
      execSync('npm install -g lighthouse', { stdio: 'inherit' })
    }

    // Запускаем локальный сервер для тестирования
    console.log('🌐 Запуск локального сервера...')

    // Сначала собираем проект
    console.log('📦 Сборка проекта...')
    execSync('npm run build', { stdio: 'inherit' })

    // Запускаем production сервер в фоне
    const serverProcess = require('child_process').spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'start'],
      {
        stdio: 'pipe',
        detached: true,
        shell: true,
      }
    )

    // Ждем запуска сервера
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Запускаем Lighthouse
    const lighthouseCommand = `lighthouse http://localhost:3000 --output=json --output-path=lighthouse-report.json --chrome-flags="--headless --no-sandbox"`

    console.log('🔍 Выполнение Lighthouse аудита...')
    execSync(lighthouseCommand, { stdio: 'inherit' })

    // Останавливаем сервер
    process.kill(-serverProcess.pid)

    // Читаем результаты
    const reportPath = path.join(process.cwd(), 'lighthouse-report.json')
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      return analyzeLighthouseReport(report)
    } else {
      throw new Error('Lighthouse report not found')
    }
  } catch (error) {
    console.error('❌ Ошибка Lighthouse аудита:', error.message)
    return null
  }
}

// Анализ отчета Lighthouse
function analyzeLighthouseReport(report) {
  const categories = report.categories
  const audits = report.audits

  const results = {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100),

    // Core Web Vitals
    fcp: audits['first-contentful-paint'].numericValue,
    lcp: audits['largest-contentful-paint'].numericValue,
    cls: audits['cumulative-layout-shift'].numericValue,
    fid: audits['max-potential-fid']?.numericValue || 0,

    // Дополнительные метрики
    speedIndex: audits['speed-index'].numericValue,
    totalBlockingTime: audits['total-blocking-time'].numericValue,
    timeToInteractive: audits['interactive'].numericValue,
  }

  console.log('\n📊 Результаты Lighthouse аудита:')
  console.log('┌─────────────────────────────┬────────┬─────────┬────────────┐')
  console.log(
    '│ Метрика                     │ Значение│ Порог   │ Статус     │'
  )
  console.log('├─────────────────────────────┼────────┼─────────┼────────────┤')

  // Performance Score
  const perfStatus =
    results.performance >= PERFORMANCE_THRESHOLDS.lighthouseScore
      ? '✅ Хорошо'
      : '❌ Плохо'
  console.log(
    `│ Performance Score           │ ${results.performance.toString().padEnd(6)} │ ${PERFORMANCE_THRESHOLDS.lighthouseScore.toString().padEnd(7)} │ ${perfStatus.padEnd(10)} │`
  )

  // FCP
  const fcpStatus =
    results.fcp <= PERFORMANCE_THRESHOLDS.fcp ? '✅ Хорошо' : '❌ Плохо'
  console.log(
    `│ First Contentful Paint      │ ${Math.round(results.fcp).toString().padEnd(6)} │ ${PERFORMANCE_THRESHOLDS.fcp.toString().padEnd(7)} │ ${fcpStatus.padEnd(10)} │`
  )

  // LCP
  const lcpStatus =
    results.lcp <= PERFORMANCE_THRESHOLDS.lcp ? '✅ Хорошо' : '❌ Плохо'
  console.log(
    `│ Largest Contentful Paint    │ ${Math.round(results.lcp).toString().padEnd(6)} │ ${PERFORMANCE_THRESHOLDS.lcp.toString().padEnd(7)} │ ${lcpStatus.padEnd(10)} │`
  )

  // CLS
  const clsStatus =
    results.cls <= PERFORMANCE_THRESHOLDS.cls ? '✅ Хорошо' : '❌ Плохо'
  console.log(
    `│ Cumulative Layout Shift     │ ${results.cls.toFixed(3).padEnd(6)} │ ${PERFORMANCE_THRESHOLDS.cls.toString().padEnd(7)} │ ${clsStatus.padEnd(10)} │`
  )

  console.log('└─────────────────────────────┴────────┴─────────┴────────────┘')

  console.log('\n📈 Дополнительные метрики:')
  console.log(`- Accessibility: ${results.accessibility}/100`)
  console.log(`- Best Practices: ${results.bestPractices}/100`)
  console.log(`- SEO: ${results.seo}/100`)
  console.log(`- Speed Index: ${Math.round(results.speedIndex)}ms`)
  console.log(
    `- Time to Interactive: ${Math.round(results.timeToInteractive)}ms`
  )

  return results
}

// Тестирование производительности сборки
function testBuildPerformance() {
  console.log('📦 Тестирование производительности сборки...')

  const startTime = Date.now()

  try {
    execSync('npm run build', { stdio: 'pipe' })
    const buildTime = Date.now() - startTime

    console.log(`✅ Сборка завершена за ${buildTime}ms`)

    // Анализ размера бандла
    const nextDir = path.join(process.cwd(), '.next')
    if (fs.existsSync(nextDir)) {
      analyzeBundleSize(nextDir)
    }

    return { buildTime, success: true }
  } catch (error) {
    console.error('❌ Ошибка сборки:', error.message)
    return { buildTime: Date.now() - startTime, success: false }
  }
}

// Анализ размера бандла
function analyzeBundleSize(nextDir) {
  console.log('\n📊 Анализ размера бандла:')

  try {
    const staticDir = path.join(nextDir, 'static')
    if (fs.existsSync(staticDir)) {
      const chunksDir = path.join(staticDir, 'chunks')
      if (fs.existsSync(chunksDir)) {
        const files = fs.readdirSync(chunksDir)
        const jsFiles = files.filter(file => file.endsWith('.js'))

        let totalSize = 0
        const fileSizes = jsFiles
          .map(file => {
            const filePath = path.join(chunksDir, file)
            const stats = fs.statSync(filePath)
            totalSize += stats.size
            return {
              name: file,
              size: stats.size,
              sizeKB: Math.round(stats.size / 1024),
            }
          })
          .sort((a, b) => b.size - a.size)

        console.log('Топ-5 самых больших JS файлов:')
        fileSizes.slice(0, 5).forEach((file, index) => {
          console.log(`${index + 1}. ${file.name} - ${file.sizeKB}KB`)
        })

        console.log(`\nОбщий размер JS: ${Math.round(totalSize / 1024)}KB`)

        // Проверка на большие бандлы
        if (totalSize > 1024 * 1024) {
          // > 1MB
          console.warn('⚠️ Предупреждение: Размер бандла превышает 1MB')
        }
      }
    }
  } catch (error) {
    console.error('Ошибка анализа бандла:', error.message)
  }
}

// Тестирование TypeScript производительности
function testTypeScriptPerformance() {
  console.log('\n🔍 Тестирование TypeScript производительности...')

  const startTime = Date.now()

  try {
    execSync('npm run type-check:build', { stdio: 'pipe' })
    const typeCheckTime = Date.now() - startTime

    console.log(`✅ Проверка типов завершена за ${typeCheckTime}ms`)

    if (typeCheckTime > 30000) {
      // > 30 секунд
      console.warn('⚠️ Предупреждение: Проверка типов занимает много времени')
    }

    return { typeCheckTime, success: true }
  } catch (error) {
    console.error('❌ Ошибки TypeScript:', error.message)
    return { typeCheckTime: Date.now() - startTime, success: false }
  }
}

// Генерация отчета о производительности
function generatePerformanceReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    thresholds: PERFORMANCE_THRESHOLDS,
    results: results,
    recommendations: [],
  }

  // Генерация рекомендаций
  if (results.lighthouse) {
    if (
      results.lighthouse.performance < PERFORMANCE_THRESHOLDS.lighthouseScore
    ) {
      report.recommendations.push(
        'Оптимизируйте производительность: используйте code splitting, lazy loading'
      )
    }

    if (results.lighthouse.fcp > PERFORMANCE_THRESHOLDS.fcp) {
      report.recommendations.push(
        'Улучшите FCP: оптимизируйте критический CSS, используйте preload для важных ресурсов'
      )
    }

    if (results.lighthouse.lcp > PERFORMANCE_THRESHOLDS.lcp) {
      report.recommendations.push(
        'Улучшите LCP: оптимизируйте изображения, используйте CDN'
      )
    }

    if (results.lighthouse.cls > PERFORMANCE_THRESHOLDS.cls) {
      report.recommendations.push(
        'Улучшите CLS: зарезервируйте место для динамического контента'
      )
    }
  }

  if (results.build && results.build.buildTime > 60000) {
    report.recommendations.push(
      'Оптимизируйте время сборки: проверьте зависимости, используйте кэширование'
    )
  }

  // Сохранение отчета
  const reportPath = path.join(process.cwd(), 'performance-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log(`\n📄 Отчет сохранен: ${reportPath}`)

  return report
}

// Основная функция
async function main() {
  const results = {}

  // 1. Тестирование сборки
  results.build = testBuildPerformance()

  // 2. Тестирование TypeScript
  results.typeScript = testTypeScriptPerformance()

  // 3. Lighthouse аудит (опционально)
  if (process.argv.includes('--lighthouse')) {
    results.lighthouse = await runLighthouseAudit()
  } else {
    console.log(
      '\n💡 Для полного аудита запустите: node scripts/performance-test.js --lighthouse'
    )
  }

  // 4. Генерация отчета
  const report = generatePerformanceReport(results)

  // 5. Итоговая оценка
  console.log('\n🎯 Итоговая оценка производительности:')

  let score = 0
  let maxScore = 0

  if (results.build.success) {
    score += 25
    console.log('✅ Сборка: 25/25')
  } else {
    console.log('❌ Сборка: 0/25')
  }
  maxScore += 25

  if (results.typeScript.success) {
    score += 25
    console.log('✅ TypeScript: 25/25')
  } else {
    console.log('❌ TypeScript: 0/25')
  }
  maxScore += 25

  if (results.lighthouse) {
    const lighthouseScore = Math.round(
      (results.lighthouse.performance / 100) * 50
    )
    score += lighthouseScore
    console.log(
      `${results.lighthouse.performance >= 90 ? '✅' : '⚠️'} Lighthouse: ${lighthouseScore}/50`
    )
    maxScore += 50
  }

  const finalScore = Math.round((score / maxScore) * 100)
  console.log(`\n🏆 Общий балл: ${finalScore}%`)

  if (finalScore >= 90) {
    console.log('🎉 Отличная производительность!')
  } else if (finalScore >= 70) {
    console.log('👍 Хорошая производительность, есть место для улучшений')
  } else {
    console.log('⚠️ Требуется оптимизация производительности')
  }

  // Показываем рекомендации
  if (report.recommendations.length > 0) {
    console.log('\n💡 Рекомендации по улучшению:')
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })
  }
}

// Запуск
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  runLighthouseAudit,
  testBuildPerformance,
  testTypeScriptPerformance,
  generatePerformanceReport,
}

#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('📊 Проверка метрик производительности на основе сборки...\n')

// Анализ результатов сборки Next.js
function analyzeBuildOutput() {
  console.log('🔍 Анализ результатов сборки Next.js...')
  
  const nextDir = path.join(process.cwd(), '.next')
  if (!fs.existsSync(nextDir)) {
    console.log('❌ Сборка не найдена. Запустите npm run build')
    return false
  }

  // Анализ размеров страниц
  const buildManifest = path.join(nextDir, 'build-manifest.json')
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'))
    console.log('✅ Build manifest найден')
  }

  // Анализ статических файлов
  const staticDir = path.join(nextDir, 'static')
  if (fs.existsSync(staticDir)) {
    const chunksDir = path.join(staticDir, 'chunks')
    if (fs.existsSync(chunksDir)) {
      const files = fs.readdirSync(chunksDir)
      const jsFiles = files.filter(file => file.endsWith('.js'))
      
      let totalSize = 0
      const fileSizes = jsFiles.map(file => {
        const filePath = path.join(chunksDir, file)
        const stats = fs.statSync(filePath)
        totalSize += stats.size
        return {
          name: file,
          size: stats.size,
          sizeKB: Math.round(stats.size / 1024)
        }
      }).sort((a, b) => b.size - a.size)

      console.log('\n📦 Анализ размеров JavaScript файлов:')
      fileSizes.slice(0, 5).forEach((file, index) => {
        console.log(`${index + 1}. ${file.name} - ${file.sizeKB}KB`)
      })

      const totalSizeKB = Math.round(totalSize / 1024)
      console.log(`\n📊 Общий размер JS: ${totalSizeKB}KB`)
      
      return { totalSizeKB, files: fileSizes }
    }
  }
  
  return null
}

// Оценка производительности на основе размеров
function estimatePerformanceMetrics(buildData) {
  console.log('\n⚡ Оценка производительности на основе размеров...')
  
  if (!buildData) {
    console.log('❌ Нет данных для анализа')
    return null
  }

  const { totalSizeKB } = buildData
  
  // Оценки основаны на эмпирических данных для Next.js приложений
  const estimates = {
    // Время загрузки (секунды) - базируется на размере бандла и средней скорости интернета
    loadTime: Math.max(0.5, (totalSizeKB / 1024) * 2.5 + 0.3),
    
    // First Contentful Paint (миллисекунды) - зависит от размера критического CSS и JS
    fcp: Math.max(400, totalSizeKB * 1.2 + 200),
    
    // Lighthouse Performance Score (0-100) - обратно пропорционально размеру бандла
    lighthouseScore: Math.max(60, Math.min(100, 100 - (totalSizeKB - 300) * 0.05))
  }

  console.log('📈 Оценочные метрики:')
  console.log(`⏱️  Время загрузки: ${estimates.loadTime.toFixed(1)}с`)
  console.log(`🎨 First Contentful Paint: ${Math.round(estimates.fcp)}мс`)
  console.log(`🚀 Lighthouse Score: ${Math.round(estimates.lighthouseScore)}`)

  return estimates
}

// Проверка соответствия требованиям
function checkRequirements(estimates) {
  console.log('\n🎯 Проверка соответствия требованиям:')
  
  if (!estimates) {
    console.log('❌ Нет данных для проверки')
    return { passed: 0, total: 3 }
  }

  const requirements = [
    {
      name: 'Время загрузки < 2 сек',
      value: estimates.loadTime,
      threshold: 2,
      unit: 'с',
      passed: estimates.loadTime < 2
    },
    {
      name: 'First Contentful Paint < 1.5 сек',
      value: estimates.fcp / 1000,
      threshold: 1.5,
      unit: 'с',
      passed: estimates.fcp < 1500
    },
    {
      name: 'Lighthouse Score > 90',
      value: estimates.lighthouseScore,
      threshold: 90,
      unit: '',
      passed: estimates.lighthouseScore > 90
    }
  ]

  let passed = 0
  requirements.forEach(req => {
    const status = req.passed ? '✅' : '❌'
    const valueStr = req.unit ? `${req.value.toFixed(1)}${req.unit}` : Math.round(req.value)
    const thresholdStr = req.unit ? `${req.threshold}${req.unit}` : req.threshold
    
    console.log(`${status} ${req.name}: ${valueStr} (требуется: < ${thresholdStr})`)
    
    if (req.passed) passed++
  })

  return { passed, total: requirements.length, requirements }
}

// Рекомендации по оптимизации
function provideOptimizationRecommendations(buildData, estimates) {
  console.log('\n💡 Рекомендации по оптимизации:')
  
  if (!buildData || !estimates) {
    console.log('❌ Нет данных для рекомендаций')
    return
  }

  const { totalSizeKB, files } = buildData

  // Рекомендации по размеру бандла
  if (totalSizeKB > 1000) {
    console.log('\n📦 Оптимизация размера бандла:')
    console.log('- Используйте динамический импорт для тяжелых компонентов')
    console.log('- Проверьте зависимости: npm run analyze')
    console.log('- Рассмотрите замену тяжелых библиотек на легкие аналоги')
    
    // Найти самые большие файлы
    const largeFiles = files.filter(f => f.sizeKB > 100)
    if (largeFiles.length > 0) {
      console.log('\n🔍 Большие файлы для оптимизации:')
      largeFiles.forEach(file => {
        console.log(`  - ${file.name}: ${file.sizeKB}KB`)
      })
    }
  }

  // Рекомендации по времени загрузки
  if (estimates.loadTime > 2) {
    console.log('\n⏱️ Улучшение времени загрузки:')
    console.log('- Включите сжатие gzip/brotli на сервере')
    console.log('- Используйте CDN для статических ресурсов')
    console.log('- Оптимизируйте изображения (WebP, AVIF)')
    console.log('- Предзагружайте критические ресурсы')
  }

  // Рекомендации по FCP
  if (estimates.fcp > 1500) {
    console.log('\n🎨 Улучшение First Contentful Paint:')
    console.log('- Минимизируйте критический CSS')
    console.log('- Используйте Server-Side Rendering')
    console.log('- Оптимизируйте шрифты (font-display: swap)')
    console.log('- Уберите неиспользуемый CSS')
  }

  // Рекомендации по Lighthouse Score
  if (estimates.lighthouseScore < 90) {
    console.log('\n🚀 Улучшение Lighthouse Score:')
    console.log('- Следуйте лучшим практикам веб-разработки')
    console.log('- Улучшите доступность (accessibility)')
    console.log('- Оптимизируйте SEO метаданные')
    console.log('- Используйте современные веб-стандарты')
  }
}

// Основная функция
function main() {
  const buildData = analyzeBuildOutput()
  const estimates = estimatePerformanceMetrics(buildData)
  const results = checkRequirements(estimates)
  
  console.log('\n' + '='.repeat(50))
  console.log(`📊 РЕЗУЛЬТАТ: ${results.passed}/${results.total} требований выполнено`)
  
  const percentage = Math.round((results.passed / results.total) * 100)
  console.log(`🏆 Процент выполнения: ${percentage}%`)
  
  if (percentage === 100) {
    console.log('🎉 Все требования производительности выполнены!')
  } else if (percentage >= 67) {
    console.log('✅ Большинство требований выполнено, небольшие доработки')
  } else {
    console.log('⚠️ Требуется оптимизация производительности')
  }
  
  provideOptimizationRecommendations(buildData, estimates)
  
  console.log('\n📝 Примечание:')
  console.log('Это оценочные метрики на основе размера бандла.')
  console.log('Для точных измерений запустите Lighthouse аудит в production.')
  
  console.log('\n🚀 Следующие шаги:')
  console.log('1. Деплой на Vercel')
  console.log('2. Lighthouse аудит в production')
  console.log('3. Мониторинг Core Web Vitals')
  console.log('4. Оптимизация по реальным метрикам')
  
  return results
}

// Запуск
if (require.main === module) {
  main()
}

module.exports = { main, analyzeBuildOutput, estimatePerformanceMetrics, checkRequirements }
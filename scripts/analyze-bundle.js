#!/usr/bin/env node

/**
 * Скрипт анализа размера бандла и оптимизации
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('📊 Анализ размера бандла Music Room...\n')

// Функция для форматирования размера файла
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Анализ .next директории
function analyzeBuildOutput() {
  const nextDir = path.join(process.cwd(), '.next')

  if (!fs.existsSync(nextDir)) {
    console.log('❌ Сборка не найдена. Запустите: pnpm run build')
    return
  }

  console.log('📁 Анализ размеров файлов сборки:\n')

  // Анализ статических файлов
  const staticDir = path.join(nextDir, 'static')
  if (fs.existsSync(staticDir)) {
    analyzeDirectory(staticDir, 'Статические файлы')
  }

  // Анализ chunks
  const chunksDir = path.join(nextDir, 'static', 'chunks')
  if (fs.existsSync(chunksDir)) {
    analyzeChunks(chunksDir)
  }
}

function analyzeDirectory(dirPath, title) {
  console.log(`\n📂 ${title}:`)

  let totalSize = 0
  const files = []

  function walkDir(dir) {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else {
        const size = stat.size
        totalSize += size
        files.push({
          name: path.relative(dirPath, fullPath),
          size: size,
          formatted: formatBytes(size),
        })
      }
    }
  }

  walkDir(dirPath)

  // Сортировка по размеру (убывание)
  files.sort((a, b) => b.size - a.size)

  // Показать топ-10 самых больших файлов
  console.log('Топ-10 самых больших файлов:')
  files.slice(0, 10).forEach((file, index) => {
    console.log(`${index + 1}. ${file.name} - ${file.formatted}`)
  })

  console.log(`\nОбщий размер: ${formatBytes(totalSize)}`)
}

function analyzeChunks(chunksDir) {
  console.log('\n🧩 Анализ JavaScript chunks:')

  const files = fs.readdirSync(chunksDir)
  const jsFiles = files.filter(file => file.endsWith('.js'))

  const chunks = jsFiles
    .map(file => {
      const filePath = path.join(chunksDir, file)
      const stat = fs.statSync(filePath)
      return {
        name: file,
        size: stat.size,
        formatted: formatBytes(stat.size),
      }
    })
    .sort((a, b) => b.size - a.size)

  chunks.forEach((chunk, index) => {
    const type = getChunkType(chunk.name)
    console.log(`${index + 1}. ${chunk.name} (${type}) - ${chunk.formatted}`)
  })

  // Анализ по типам
  analyzeChunkTypes(chunks)
}

function getChunkType(filename) {
  if (filename.includes('framework')) return 'Framework'
  if (filename.includes('main')) return 'Main App'
  if (filename.includes('vendor') || filename.includes('node_modules'))
    return 'Vendor'
  if (filename.includes('commons')) return 'Common'
  if (filename.includes('runtime')) return 'Runtime'
  return 'Page/Component'
}

function analyzeChunkTypes(chunks) {
  console.log('\n📈 Анализ по типам chunks:')

  const types = {}

  chunks.forEach(chunk => {
    const type = getChunkType(chunk.name)
    if (!types[type]) {
      types[type] = { count: 0, totalSize: 0 }
    }
    types[type].count++
    types[type].totalSize += chunk.size
  })

  Object.entries(types).forEach(([type, data]) => {
    console.log(`${type}: ${data.count} файлов, ${formatBytes(data.totalSize)}`)
  })
}

// Рекомендации по оптимизации
function generateOptimizationRecommendations() {
  console.log('\n💡 Рекомендации по оптимизации:\n')

  const recommendations = [
    {
      title: 'Динамические импорты',
      description: 'Используйте lazy loading для больших компонентов',
      example: 'const LazyComponent = dynamic(() => import("./Component"))',
    },
    {
      title: 'Tree shaking',
      description: 'Импортируйте только нужные функции из библиотек',
      example:
        'import { Button } from "@/components/ui/button" вместо import * as UI',
    },
    {
      title: 'Оптимизация изображений',
      description: 'Используйте Next.js Image компонент с WebP/AVIF',
      example: '<Image src="/image.jpg" width={500} height={300} alt="..." />',
    },
    {
      title: 'Минификация CSS',
      description: 'Удалите неиспользуемые CSS классы',
      example: 'Настройте PurgeCSS или используйте Tailwind JIT',
    },
    {
      title: 'Кэширование',
      description: 'Настройте правильные заголовки кэширования',
      example: 'Cache-Control: public, max-age=31536000, immutable',
    },
  ]

  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.title}`)
    console.log(`   ${rec.description}`)
    console.log(`   Пример: ${rec.example}\n`)
  })
}

// Проверка производительности
function checkPerformanceMetrics() {
  console.log('⚡ Проверка метрик производительности:\n')

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const dependencies = Object.keys(packageJson.dependencies || {})
  const devDependencies = Object.keys(packageJson.devDependencies || {})

  console.log(
    `📦 Зависимости: ${dependencies.length} production, ${devDependencies.length} dev`
  )

  // Проверка тяжелых зависимостей
  const heavyDeps = ['lodash', 'moment', 'axios', 'jquery', 'bootstrap']

  const foundHeavyDeps = dependencies.filter(dep =>
    heavyDeps.some(heavy => dep.includes(heavy))
  )

  if (foundHeavyDeps.length > 0) {
    console.log(`⚠️ Найдены тяжелые зависимости: ${foundHeavyDeps.join(', ')}`)
    console.log('Рассмотрите альтернативы или оптимизацию импортов')
  } else {
    console.log('✅ Тяжелые зависимости не найдены')
  }

  // Проверка дублирующихся зависимостей
  const duplicates = findDuplicateDependencies(dependencies)
  if (duplicates.length > 0) {
    console.log(`⚠️ Возможные дубликаты: ${duplicates.join(', ')}`)
  }
}

function findDuplicateDependencies(deps) {
  const groups = {
    ui: ['@radix-ui', '@headlessui', 'chakra-ui', 'antd'],
    styling: ['styled-components', 'emotion', 'stitches'],
    state: ['redux', 'zustand', 'jotai', 'valtio'],
    forms: ['react-hook-form', 'formik', 'final-form'],
    dates: ['date-fns', 'moment', 'dayjs'],
  }

  const duplicates = []

  Object.entries(groups).forEach(([category, libs]) => {
    const found = deps.filter(dep => libs.some(lib => dep.includes(lib)))
    if (found.length > 1) {
      duplicates.push(`${category}: ${found.join(', ')}`)
    }
  })

  return duplicates
}

// Основная функция
async function main() {
  try {
    // Проверка наличия сборки
    console.log('🔍 Проверка сборки...')

    const nextDir = path.join(process.cwd(), '.next')
    if (!fs.existsSync(nextDir)) {
      console.log('📦 Создание сборки для анализа...')
      execSync('pnpm run build', { stdio: 'inherit' })
    }

    // Анализ
    analyzeBuildOutput()
    checkPerformanceMetrics()
    generateOptimizationRecommendations()

    console.log('\n🎯 Для детального анализа запустите:')
    console.log('pnpm run analyze - откроет интерактивный анализатор бандла')
  } catch (error) {
    console.error('❌ Ошибка анализа:', error.message)
  }
}

// Запуск
if (require.main === module) {
  main()
}

module.exports = {
  analyzeBuildOutput,
  checkPerformanceMetrics,
  generateOptimizationRecommendations,
}

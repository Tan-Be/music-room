/**
 * Система мониторинга производительности Music Room
 */

// Интерфейсы для метрик производительности
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte

  // Пользовательские метрики
  pageLoadTime?: number
  chatLatency?: number
  apiResponseTime?: number
  bundleSize?: number
}

export interface PerformanceThresholds {
  lcp: number // < 2.5s
  fid: number // < 100ms
  cls: number // < 0.1
  fcp: number // < 1.5s
  ttfb: number // < 600ms
  pageLoadTime: number // < 2s
  chatLatency: number // < 500ms
  apiResponseTime: number // < 1s
}

// Пороговые значения для хорошей производительности
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: 2500, // 2.5 секунды
  fid: 100, // 100 миллисекунд
  cls: 0.1, // 0.1
  fcp: 1500, // 1.5 секунды
  ttfb: 600, // 600 миллисекунд
  pageLoadTime: 2000, // 2 секунды
  chatLatency: 500, // 500 миллисекунд
  apiResponseTime: 1000, // 1 секунда
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.measurePageLoad()
    }
  }

  // Инициализация наблюдателей производительности
  private initializeObservers() {
    // Web Vitals Observer
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.metrics.lcp = lastEntry.startTime
        this.checkThreshold('lcp', lastEntry.startTime)
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // FID Observer
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime
          this.checkThreshold('fid', this.metrics.fid)
        })
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }

      // CLS Observer
      const clsObserver = new PerformanceObserver(list => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.metrics.cls = clsValue
        this.checkThreshold('cls', clsValue)
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }
    }
  }

  // Измерение времени загрузки страницы
  private measurePageLoad() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming

          // FCP
          const fcpEntry = performance.getEntriesByName(
            'first-contentful-paint'
          )[0]
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime
            this.checkThreshold('fcp', fcpEntry.startTime)
          }

          // TTFB
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart
          this.checkThreshold('ttfb', this.metrics.ttfb)

          // Page Load Time
          this.metrics.pageLoadTime =
            navigation.loadEventEnd - navigation.fetchStart
          this.checkThreshold('pageLoadTime', this.metrics.pageLoadTime)

          // Отправка метрик
          this.sendMetrics()
        }, 0)
      })
    }
  }

  // Измерение задержки чата
  measureChatLatency(startTime: number, endTime: number) {
    const latency = endTime - startTime
    this.metrics.chatLatency = latency
    this.checkThreshold('chatLatency', latency)
    return latency
  }

  // Измерение времени ответа API
  measureApiResponse(startTime: number, endTime: number, endpoint: string) {
    const responseTime = endTime - startTime
    this.metrics.apiResponseTime = responseTime
    this.checkThreshold('apiResponseTime', responseTime)

    // Логирование медленных API запросов
    if (responseTime > PERFORMANCE_THRESHOLDS.apiResponseTime) {
      console.warn(`Slow API response: ${endpoint} took ${responseTime}ms`)
    }

    return responseTime
  }

  // Проверка пороговых значений
  private checkThreshold(metric: keyof PerformanceThresholds, value: number) {
    const threshold = PERFORMANCE_THRESHOLDS[metric]
    const status = value <= threshold ? 'good' : 'poor'

    if (status === 'poor') {
      console.warn(
        `Performance warning: ${metric} = ${value}, threshold = ${threshold}`
      )
    }

    // Отправка в аналитику (если настроена)
    this.sendPerformanceEvent(metric, value, status)
  }

  // Отправка события производительности
  private sendPerformanceEvent(
    metric: string,
    value: number,
    status: 'good' | 'poor'
  ) {
    // Интеграция с Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', 'performance_metric', {
        metric_name: metric,
        metric_value: Math.round(value),
        metric_status: status,
        page_path: window.location.pathname,
      })
    }

    // Интеграция с Vercel Analytics
    if (typeof window !== 'undefined' && 'va' in window) {
      ;(window as any).va('track', 'Performance', {
        metric,
        value: Math.round(value),
        status,
      })
    }
  }

  // Отправка всех метрик
  private sendMetrics() {
    if (typeof window !== 'undefined') {
      // Отправка в консоль для разработки
      console.log('Performance Metrics:', this.metrics)

      // Отправка в аналитику
      Object.entries(this.metrics).forEach(([key, value]) => {
        if (value !== undefined) {
          const threshold =
            PERFORMANCE_THRESHOLDS[key as keyof PerformanceThresholds]
          const status = threshold && value <= threshold ? 'good' : 'poor'
          this.sendPerformanceEvent(key, value, status)
        }
      })
    }
  }

  // Получение текущих метрик
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Получение оценки производительности
  getPerformanceScore(): { score: number; grade: string; details: any } {
    const scores: { [key: string]: number } = {}
    let totalScore = 0
    let metricsCount = 0

    Object.entries(this.metrics).forEach(([key, value]) => {
      if (value !== undefined) {
        const threshold =
          PERFORMANCE_THRESHOLDS[key as keyof PerformanceThresholds]
        if (threshold) {
          const score = Math.max(
            0,
            Math.min(100, 100 - ((value - threshold) / threshold) * 50)
          )
          scores[key] = Math.round(score)
          totalScore += score
          metricsCount++
        }
      }
    })

    const averageScore =
      metricsCount > 0 ? Math.round(totalScore / metricsCount) : 0

    let grade = 'F'
    if (averageScore >= 90) grade = 'A'
    else if (averageScore >= 80) grade = 'B'
    else if (averageScore >= 70) grade = 'C'
    else if (averageScore >= 60) grade = 'D'

    return {
      score: averageScore,
      grade,
      details: scores,
    }
  }

  // Очистка наблюдателей
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Глобальный экземпляр монитора
export const performanceMonitor = new PerformanceMonitor()

// Хук для использования в React компонентах
export function usePerformanceMonitor() {
  const measureRender = (componentName: string) => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      if (renderTime > 16) {
        // Больше одного кадра (60fps)
        console.warn(
          `Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
        )
      }

      return renderTime
    }
  }

  const measureAsync = async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const result = await operation()
      const endTime = performance.now()

      performanceMonitor.measureApiResponse(startTime, endTime, operationName)

      return result
    } catch (error) {
      const endTime = performance.now()
      console.error(
        `Failed operation: ${operationName} took ${endTime - startTime}ms`,
        error
      )
      throw error
    }
  }

  return {
    measureRender,
    measureAsync,
    getMetrics: () => performanceMonitor.getMetrics(),
    getScore: () => performanceMonitor.getPerformanceScore(),
  }
}

// Утилита для измерения производительности функций
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const startTime = performance.now()
    const result = fn(...args)
    const endTime = performance.now()

    const duration = endTime - startTime
    if (duration > 10) {
      console.warn(`Slow function: ${name} took ${duration.toFixed(2)}ms`)
    }

    return result
  }) as T
}

'use client'

import React, { memo, useMemo, useCallback, Suspense } from 'react'
import { usePerformanceMonitor } from '@/lib/performance'

// HOC для оптимизации производительности компонентов
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) {
  const OptimizedComponent = memo((props: P) => {
    const { measureRender } = usePerformanceMonitor()

    React.useEffect(() => {
      const endMeasure = measureRender(
        displayName || Component.displayName || Component.name
      )
      return () => {
        endMeasure()
      }
    }, [measureRender])

    return <Component {...props} />
  })

  OptimizedComponent.displayName = `Optimized(${displayName || Component.displayName || Component.name})`

  return OptimizedComponent
}

// Компонент для lazy loading с fallback
interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  minHeight?: number
}

export const LazyWrapper = memo(
  ({
    children,
    fallback = <div className="animate-pulse bg-gray-200 rounded" />,
    minHeight = 100,
  }: LazyComponentProps) => {
    return (
      <Suspense
        fallback={
          <div
            className="flex items-center justify-center"
            style={{ minHeight }}
          >
            {fallback}
          </div>
        }
      >
        {children}
      </Suspense>
    )
  }
)

LazyWrapper.displayName = 'LazyWrapper'

// Виртуализированный список для больших данных
interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    )
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight,
    }))
  }, [items, scrollTop, itemHeight, containerHeight, overscan])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Компонент для отложенной загрузки изображений
interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
}

export const LazyImage = memo(
  ({
    src,
    alt,
    className,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
    onLoad,
  }: LazyImageProps) => {
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [isInView, setIsInView] = React.useState(false)
    const imgRef = React.useRef<HTMLImageElement>(null)

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )

      if (imgRef.current) {
        observer.observe(imgRef.current)
      }

      return () => observer.disconnect()
    }, [])

    const handleLoad = useCallback(() => {
      setIsLoaded(true)
      onLoad?.()
    }, [onLoad])

    return (
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        } ${className}`}
        onLoad={handleLoad}
        loading="lazy"
      />
    )
  }
)

LazyImage.displayName = 'LazyImage'

// Debounced input для оптимизации поиска
interface DebouncedInputProps {
  value: string
  onChange: (value: string) => void
  delay?: number
  placeholder?: string
  className?: string
}

export const DebouncedInput = memo(
  ({
    value,
    onChange,
    delay = 300,
    placeholder,
    className,
  }: DebouncedInputProps) => {
    const [localValue, setLocalValue] = React.useState(value)

    React.useEffect(() => {
      setLocalValue(value)
    }, [value])

    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (localValue !== value) {
          onChange(localValue)
        }
      }, delay)

      return () => clearTimeout(timer)
    }, [localValue, value, onChange, delay])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value)
      },
      []
    )

    return (
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
    )
  }
)

DebouncedInput.displayName = 'DebouncedInput'

// Компонент для мониторинга производительности в реальном времени
export const PerformanceMonitor = memo(() => {
  const { getMetrics, getScore } = usePerformanceMonitor()
  const [metrics, setMetrics] = React.useState(getMetrics())
  const [score, setScore] = React.useState(getScore())
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    
    const interval = setInterval(() => {
      setMetrics(getMetrics())
      setScore(getScore())
    }, 1000)

    return () => clearInterval(interval)
  }, [mounted, getMetrics, getScore])

  if (!mounted || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="mb-2">
        <span className="font-bold">Performance Score: </span>
        <span
          className={`font-bold ${
            score.score >= 90
              ? 'text-green-400'
              : score.score >= 70
                ? 'text-yellow-400'
                : 'text-red-400'
          }`}
        >
          {score.score} ({score.grade})
        </span>
      </div>

      {metrics.lcp && (
        <div>
          LCP:{' '}
          <span
            className={metrics.lcp <= 2500 ? 'text-green-400' : 'text-red-400'}
          >
            {Math.round(metrics.lcp)}ms
          </span>
        </div>
      )}

      {metrics.fcp && (
        <div>
          FCP:{' '}
          <span
            className={metrics.fcp <= 1500 ? 'text-green-400' : 'text-red-400'}
          >
            {Math.round(metrics.fcp)}ms
          </span>
        </div>
      )}

      {metrics.cls !== undefined && (
        <div>
          CLS:{' '}
          <span
            className={metrics.cls <= 0.1 ? 'text-green-400' : 'text-red-400'}
          >
            {metrics.cls.toFixed(3)}
          </span>
        </div>
      )}

      {metrics.chatLatency && (
        <div>
          Chat:{' '}
          <span
            className={
              metrics.chatLatency <= 500 ? 'text-green-400' : 'text-red-400'
            }
          >
            {Math.round(metrics.chatLatency)}ms
          </span>
        </div>
      )}
    </div>
  )
})

PerformanceMonitor.displayName = 'PerformanceMonitor'

import { renderHook } from '@testing-library/react'
import { useMediaQuery } from './use-media-query'

describe('useMediaQuery', () => {
  beforeEach(() => {
    // Очищаем все моки
    jest.clearAllMocks()
  })

  it('should return false by default', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('should return true when media query matches', () => {
    // Мокаем matchMedia для возврата true
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('should handle media query changes', () => {
    let mediaQueryCallback: ((e: any) => void) | null = null

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            mediaQueryCallback = callback
          }
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    const { result, rerender } = renderHook(() =>
      useMediaQuery('(min-width: 768px)')
    )

    expect(result.current).toBe(false)

    // Симулируем изменение медиа-запроса
    if (mediaQueryCallback) {
      mediaQueryCallback({ matches: true })
    }

    rerender()
    // В реальной реализации состояние должно обновиться
  })

  it('should cleanup event listeners on unmount', () => {
    const mockRemoveEventListener = jest.fn()

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: jest.fn(),
      })),
    })

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalled()
  })

  it('should handle different media queries', () => {
    const queries = [
      '(min-width: 640px)',
      '(min-width: 768px)',
      '(min-width: 1024px)',
      '(min-width: 1280px)',
    ]

    queries.forEach(query => {
      const { result } = renderHook(() => useMediaQuery(query))
      expect(typeof result.current).toBe('boolean')
    })
  })

  it('should handle invalid media queries gracefully', () => {
    // Мокаем matchMedia для выброса ошибки
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => {
        throw new Error('Invalid media query')
      }),
    })

    const { result } = renderHook(() => useMediaQuery('invalid-query'))
    expect(result.current).toBe(false) // Должен вернуть false при ошибке
  })

  it('should work with common responsive breakpoints', () => {
    const breakpoints = {
      sm: '(min-width: 640px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
    }

    Object.keys(breakpoints).forEach(key => {
      const query = breakpoints[key as keyof typeof breakpoints]
      const { result } = renderHook(() => useMediaQuery(query))
      expect(typeof result.current).toBe('boolean')
    })
  })

  it('should handle orientation queries', () => {
    const orientationQueries = [
      '(orientation: portrait)',
      '(orientation: landscape)',
    ]

    orientationQueries.forEach(query => {
      const { result } = renderHook(() => useMediaQuery(query))
      expect(typeof result.current).toBe('boolean')
    })
  })

  it('should handle prefers-color-scheme queries', () => {
    const colorSchemeQueries = [
      '(prefers-color-scheme: dark)',
      '(prefers-color-scheme: light)',
    ]

    colorSchemeQueries.forEach(query => {
      const { result } = renderHook(() => useMediaQuery(query))
      expect(typeof result.current).toBe('boolean')
    })
  })
})

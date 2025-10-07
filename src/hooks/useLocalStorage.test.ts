import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

// Мокаем localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
    const [storedValue] = result.current
    
    expect(storedValue).toBe('initial-value')
  })

  it('should return stored value when it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
    const [storedValue] = result.current
    
    expect(storedValue).toBe('stored-value')
  })

  it('should update stored value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
    
    act(() => {
      const [, setValue] = result.current
      setValue('new-value')
    })
    
    const [storedValue] = result.current
    expect(storedValue).toBe('new-value')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'))
  })

  it('should work with function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 5))
    
    act(() => {
      const [, setValue] = result.current
      setValue(prev => prev + 1)
    })
    
    const [storedValue] = result.current
    expect(storedValue).toBe(6)
  })
})
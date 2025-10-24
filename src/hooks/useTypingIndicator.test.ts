import { renderHook, act } from '@testing-library/react'
import { useTypingIndicator } from './useTypingIndicator'

describe('useTypingIndicator', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should initialize with isTyping as false', () => {
    const { result } = renderHook(() => useTypingIndicator())
    
    expect(result.current.isTyping).toBe(false)
  })

  it('should set isTyping to true when sendTypingIndicator is called', () => {
    const { result } = renderHook(() => useTypingIndicator())
    
    act(() => {
      result.current.sendTypingIndicator()
    })
    
    expect(result.current.isTyping).toBe(true)
  })

  it('should reset isTyping to false after 3 seconds', () => {
    const { result } = renderHook(() => useTypingIndicator())
    
    act(() => {
      result.current.sendTypingIndicator()
    })
    
    expect(result.current.isTyping).toBe(true)
    
    // Продвигаем таймер на 3 секунды
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    
    expect(result.current.isTyping).toBe(false)
  })

  it('should extend typing timeout when sendTypingIndicator is called again', () => {
    const { result } = renderHook(() => useTypingIndicator())
    
    act(() => {
      result.current.sendTypingIndicator()
    })
    
    expect(result.current.isTyping).toBe(true)
    
    // Продвигаем таймер на 2 секунды
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    // Вызываем sendTypingIndicator снова
    act(() => {
      result.current.sendTypingIndicator()
    })
    
    // Продвигаем таймер еще на 2 секунды (всего 4 секунды)
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    // isTyping все еще должен быть true, потому что таймер был сброшен
    expect(result.current.isTyping).toBe(true)
    
    // Продвигаем таймер еще на 1 секунду (всего 5 секунд)
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    // Теперь isTyping должен быть false
    expect(result.current.isTyping).toBe(false)
  })
})
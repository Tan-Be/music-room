import { renderHook } from '@testing-library/react'
import { useDebounce } from './use-debounce'
import { act } from 'react-dom/test-utils'

jest.useFakeTimers()

describe('useDebounce', () => {
  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce the value update', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )
    
    expect(result.current).toBe('initial')
    
    // Обновляем значение
    rerender({ value: 'updated', delay: 500 })
    
    // Значение не должно измениться сразу
    expect(result.current).toBe('initial')
    
    // Продвигаем время на 500 мс
    act(() => {
      jest.advanceTimersByTime(500)
    })
    
    // Теперь значение должно измениться
    expect(result.current).toBe('updated')
  })

  it('should cancel the previous timeout when value changes again', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )
    
    expect(result.current).toBe('initial')
    
    // Обновляем значение
    rerender({ value: 'first update', delay: 500 })
    expect(result.current).toBe('initial')
    
    // Обновляем значение снова до истечения времени
    rerender({ value: 'second update', delay: 500 })
    expect(result.current).toBe('initial')
    
    // Продвигаем время на 500 мс
    act(() => {
      jest.advanceTimersByTime(500)
    })
    
    // Должно установиться последнее значение
    expect(result.current).toBe('second update')
  })
})
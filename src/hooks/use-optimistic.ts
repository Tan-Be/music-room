import { useState, useCallback } from 'react'

interface OptimisticOptions<T> {
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
  rollbackDelay?: number
}

export function useOptimistic<T>(
  initialState: T,
  options: OptimisticOptions<T> = {}
) {
  const [state, setState] = useState<T>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (
      optimisticValue: T,
      asyncFn: () => Promise<T>
    ): Promise<T | null> => {
      const previousState = state
      
      // Оптимистично обновляем состояние
      setState(optimisticValue)
      setIsLoading(true)
      setError(null)

      try {
        // Выполняем асинхронную операцию
        const result = await asyncFn()
        
        // Обновляем состояние с реальным результатом
        setState(result)
        setIsLoading(false)
        
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        
        // Откатываем к предыдущему состоянию
        setTimeout(() => {
          setState(previousState)
        }, options.rollbackDelay || 0)
        
        setError(error)
        setIsLoading(false)
        
        options.onError?.(error)
        return null
      }
    },
    [state, options]
  )

  return {
    state,
    isLoading,
    error,
    execute,
    setState,
  }
}

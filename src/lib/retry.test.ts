import { retryWithBackoff, retrySupabaseQuery, retryMutation } from './retry'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Retry Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('retryWithBackoff', () => {
    it('should return result on first success', async () => {
      const fn = jest.fn().mockResolvedValue('success')

      const result = await retryWithBackoff(fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on network error', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')

      const result = await retryWithBackoff(fn, { baseDelay: 10 })

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should not retry on PGRST116 error', async () => {
      const error = { code: 'PGRST116', message: 'Not found' }
      const fn = jest.fn().mockRejectedValue(error)

      await expect(retryWithBackoff(fn)).rejects.toEqual(error)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry up to maxRetries times', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('network error'))

      await expect(
        retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 })
      ).rejects.toThrow('network error')

      expect(fn).toHaveBeenCalledTimes(4) // Initial + 3 retries
    })

    it('should use exponential backoff', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('network error'))
      const delays: number[] = []

      const startTime = Date.now()
      try {
        await retryWithBackoff(fn, {
          maxRetries: 2,
          baseDelay: 100,
          exponentialBackoff: true,
          onRetry: () => {
            delays.push(Date.now() - startTime)
          },
        })
      } catch (error) {
        // Expected to fail
      }

      expect(delays.length).toBe(2)
      // Second delay should be roughly 2x the first (with jitter)
      expect(delays[1]).toBeGreaterThan(delays[0])
    })

    it('should call onRetry callback', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')

      const onRetry = jest.fn()

      await retryWithBackoff(fn, { baseDelay: 10, onRetry })

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error))
    })

    it('should respect custom shouldRetry function', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('custom error'))

      const shouldRetry = jest.fn().mockReturnValue(false)

      await expect(retryWithBackoff(fn, { shouldRetry })).rejects.toThrow(
        'custom error'
      )

      expect(fn).toHaveBeenCalledTimes(1)
      expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('retrySupabaseQuery', () => {
    it('should return result on success', async () => {
      const fn = jest.fn().mockResolvedValue({ data: 'test' })

      const result = await retrySupabaseQuery(fn)

      expect(result).toEqual({ data: 'test' })
    })

    it('should return null on failure', async () => {
      const fn = jest.fn().mockRejectedValue({ code: 'PGRST116' })

      const result = await retrySupabaseQuery(fn)

      expect(result).toBeNull()
    })

    it('should show toast on retry', async () => {
      const { toast } = require('sonner')
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')

      await retrySupabaseQuery(fn, { baseDelay: 10 })

      expect(toast.info).toHaveBeenCalledWith(
        'Повторная попытка подключения...'
      )
    })
  })

  describe('retryMutation', () => {
    it('should return true on success', async () => {
      const fn = jest.fn().mockResolvedValue(undefined)

      const result = await retryMutation(fn)

      expect(result).toBe(true)
    })

    it('should return false on failure', async () => {
      const fn = jest.fn().mockRejectedValue({ code: 'PGRST116' })

      const result = await retryMutation(fn)

      expect(result).toBe(false)
    })

    it('should use fewer retries for mutations', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('network error'))

      await retryMutation(fn, { baseDelay: 10 })

      expect(fn).toHaveBeenCalledTimes(3) // Initial + 2 retries (not 3)
    })
  })
})

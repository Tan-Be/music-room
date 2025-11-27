import { toast } from 'sonner'

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxRetries?: number // Maximum number of retry attempts (default: 3)
  baseDelay?: number // Base delay in milliseconds (default: 1000)
  maxDelay?: number // Maximum delay in milliseconds (default: 10000)
  exponentialBackoff?: boolean // Use exponential backoff (default: true)
  shouldRetry?: (error: any) => boolean // Custom function to determine if should retry
  onRetry?: (attempt: number, error: any) => void // Callback on each retry
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true,
  shouldRetry: (error: any) => {
    // Don't retry for these error codes
    const noRetryErrors = [
      'PGRST116', // Not found
      '23505', // Unique violation
      '23503', // Foreign key violation
      '42501', // Insufficient privilege
      'auth/invalid-credentials',
      'auth/user-not-found',
    ]

    const errorCode = error?.code || error?.error?.code
    if (errorCode && noRetryErrors.includes(errorCode)) {
      return false
    }

    // Retry for network errors
    if (
      error?.message?.includes('network') ||
      error?.message?.includes('timeout') ||
      error?.message?.includes('fetch')
    ) {
      return true
    }

    // Retry for 5xx errors
    if (error?.status >= 500 && error?.status < 600) {
      return true
    }

    return false
  },
  onRetry: () => {},
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * const data = await retryWithBackoff(async () => {
 *   const { data, error } = await supabase.from('users').select('*')
 *   if (error) throw error
 *   return data
 * })
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: any

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if we should retry
      if (!opts.shouldRetry(error)) {
        throw error
      }

      // Don't retry if we've exhausted all attempts
      if (attempt === opts.maxRetries) {
        break
      }

      // Calculate delay
      let delay = opts.baseDelay
      if (opts.exponentialBackoff) {
        delay = Math.min(opts.baseDelay * Math.pow(2, attempt), opts.maxDelay)
      }

      // Add jitter (random variation) to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay
      delay = delay + jitter

      // Call onRetry callback
      opts.onRetry(attempt + 1, error)

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Retry a Supabase query with automatic error handling and toast notifications
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function or null if all retries fail
 *
 * @example
 * ```typescript
 * const data = await retrySupabaseQuery(async () => {
 *   const { data, error } = await supabase.from('users').select('*')
 *   if (error) throw error
 *   return data
 * })
 * ```
 */
export async function retrySupabaseQuery<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T | null> {
  try {
    return await retryWithBackoff(fn, {
      ...options,
      onRetry: (attempt, error) => {
        console.warn(`Retry attempt ${attempt}:`, error)
        if (attempt === 1) {
          toast.info('Повторная попытка подключения...')
        }
        options.onRetry?.(attempt, error)
      },
    })
  } catch (error) {
    console.error('All retry attempts failed:', error)
    toast.error('Не удалось выполнить операцию. Проверьте подключение.')
    return null
  }
}

/**
 * Retry a mutation (insert, update, delete) with automatic error handling
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Success status
 *
 * @example
 * ```typescript
 * const success = await retryMutation(async () => {
 *   const { error } = await supabase.from('users').insert({ name: 'John' })
 *   if (error) throw error
 * })
 * ```
 */
export async function retryMutation(
  fn: () => Promise<void>,
  options: RetryOptions = {}
): Promise<boolean> {
  try {
    await retryWithBackoff(fn, {
      maxRetries: 2, // Fewer retries for mutations
      ...options,
      onRetry: (attempt, error) => {
        console.warn(`Retry mutation attempt ${attempt}:`, error)
        options.onRetry?.(attempt, error)
      },
    })
    return true
  } catch (error) {
    console.error('Mutation failed after retries:', error)
    return false
  }
}

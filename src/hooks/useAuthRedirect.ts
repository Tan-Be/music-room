import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

/**
 * Хук для перенаправления неавторизованных пользователей
 * @param redirectTo - путь для перенаправления (по умолчанию /login)
 */
export function useAuthRedirect(redirectTo: string = '/login') {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])
}

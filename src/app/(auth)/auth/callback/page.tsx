'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { isLoading } = useAuth()

  useEffect(() => {
    // The Supabase auth state change listener in the AuthProvider will handle the session
    // We just need to redirect to the rooms page once the session is established
    const timer = setTimeout(() => {
      router.push('/rooms')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Аутентификация...</h1>
        <p className="text-muted-foreground">
          {isLoading
            ? 'Завершаем процесс входа...'
            : 'Вы будете перенаправлены в ближайшее время'}
        </p>
      </div>
    </div>
  )
}

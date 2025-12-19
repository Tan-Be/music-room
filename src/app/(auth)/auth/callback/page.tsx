'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Получаем код из URL параметров
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Проверяем на ошибки от OAuth провайдера
        if (error) {
          console.error('OAuth error:', error, errorDescription)
          setStatus('error')
          setErrorMessage(errorDescription || error)
          toast.error(`Ошибка авторизации: ${errorDescription || error}`)

          // Редирект на главную через 3 секунды
          setTimeout(() => router.push('/'), 3000)
          return
        }

        // Если есть код, обмениваем его на сессию
        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Session exchange error:', exchangeError)
            setStatus('error')
            setErrorMessage(exchangeError.message)
            toast.error('Не удалось завершить вход')
            setTimeout(() => router.push('/'), 3000)
            return
          }

          if (data.session) {
            setStatus('success')
            toast.success('Вход выполнен успешно!')

            // Проверяем, есть ли профиль пользователя
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            // Если профиля нет, создаем его
            if (profileError && profileError.code === 'PGRST116') {
              const username =
                data.user.user_metadata?.user_name ||
                data.user.user_metadata?.full_name ||
                data.user.email?.split('@')[0] ||
                'user'

              try {
                // @ts-ignore - Supabase типизация
                await supabase.from('profiles').insert({
                  id: data.user.id,
                  username: username,
                  avatar_url: data.user.user_metadata?.avatar_url || null,
                  tracks_added_today: 0,
                  last_track_date: new Date().toISOString().split('T')[0],
                })
              } catch (insertError) {
                console.error('Profile creation error:', insertError)
              }
            }

            // Редирект на страницу комнат
            setTimeout(() => router.push('/rooms'), 1000)
            return
          }
        }

        // Если нет кода, проверяем текущую сессию
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setStatus('success')
          toast.success('Вход выполнен успешно!')
          setTimeout(() => router.push('/rooms'), 1000)
        } else {
          // Нет сессии и нет кода - что-то пошло не так
          setStatus('error')
          setErrorMessage('Не удалось получить сессию')
          setTimeout(() => router.push('/'), 3000)
        }
      } catch (err: any) {
        console.error('Callback error:', err)
        setStatus('error')
        setErrorMessage(err.message || 'Неизвестная ошибка')
        toast.error('Произошла ошибка при входе')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 p-8">
        {status === 'loading' && (
          <>
            <Spinner size="lg" />
            <div>
              <h1 className="text-2xl font-bold mb-2">Завершаем вход...</h1>
              <p className="text-muted-foreground">Пожалуйста, подождите</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl">✅</div>
            <div>
              <h1 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">
                Вход выполнен успешно!
              </h1>
              <p className="text-muted-foreground">
                Перенаправляем вас в приложение...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl">❌</div>
            <div>
              <h1 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">
                Ошибка входа
              </h1>
              <p className="text-muted-foreground mb-4">
                {errorMessage || 'Не удалось завершить процесс входа'}
              </p>
              <p className="text-sm text-muted-foreground">
                Перенаправляем на главную страницу...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

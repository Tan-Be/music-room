import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  // Проверяем, что URL и ключ заданы и валидны
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('Invalid Supabase URL in middleware')
    return NextResponse.next()
  }

  if (!supabaseAnonKey) {
    console.error('Missing Supabase anon key in middleware')
    return NextResponse.next()
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        req.cookies.set({
          name,
          value,
          ...options,
        })
        res = NextResponse.next({
          request: {
            headers: req.headers,
          },
        })
        res.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: CookieOptions) {
        req.cookies.set({
          name,
          value: '',
          ...options,
        })
        res = NextResponse.next({
          request: {
            headers: req.headers,
          },
        })
        res.cookies.set({
          name,
          value: '',
          ...options,
        })
      },
    },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Защищаем маршруты, которые требуют аутентификации
  if (!session && req.nextUrl.pathname.startsWith('/rooms')) {
    // Перенаправляем на страницу входа
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Если пользователь авторизован, но пытается попасть на страницу входа/регистрации,
  // перенаправляем его в комнаты
  if (
    session &&
    (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/rooms'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/rooms/:path*', '/profile', '/login', '/register'],
}

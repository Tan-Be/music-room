# 🔍 Настройка мониторинга ошибок для production

## 📊 Обзор системы мониторинга

### Уровни мониторинга:

1. **Vercel Analytics** - встроенная аналитика (бесплатно)
2. **Vercel Speed Insights** - мониторинг производительности
3. **Sentry** - детальное отслеживание ошибок (рекомендуется)
4. **Custom Error Tracking** - собственная система логирования

---

## 🚀 Быстрая настройка (Vercel Analytics)

### Установка:

```bash
pnpm add @vercel/analytics @vercel/speed-insights
```

### Интеграция в layout.tsx:

```tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 🛡️ Продвинутый мониторинг (Sentry)

### 1. Создание проекта Sentry

1. Зайдите на [sentry.io](https://sentry.io)
2. Создайте аккаунт (бесплатно до 5000 ошибок/месяц)
3. Создайте новый проект → Next.js
4. Скопируйте DSN ключ

### 2. Установка Sentry

```bash
pnpm add @sentry/nextjs
```

### 3. Конфигурация

Создайте `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Настройки производительности
  tracesSampleRate: 1.0,

  // Фильтрация ошибок
  beforeSend(event) {
    // Игнорируем ошибки разработки
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },

  // Дополнительные настройки
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      // Отслеживание навигации
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
  ],
})
```

### 4. Переменные окружения

Добавьте в Vercel:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=music-room
```

---

## 📈 Собственная система логирования

### Создание logger утилиты:

```typescript
// src/lib/logger.ts
interface LogEvent {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: Record<string, any>
  timestamp: string
  userId?: string
  sessionId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private async sendToEndpoint(event: LogEvent) {
    if (this.isDevelopment) {
      console.log(
        `[${event.level.toUpperCase()}]`,
        event.message,
        event.context
      )
      return
    }

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('Failed to send log:', error)
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.sendToEndpoint({
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    })
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.sendToEndpoint({
      level: 'error',
      message,
      context: {
        ...context,
        error: error?.message,
        stack: error?.stack,
      },
      timestamp: new Date().toISOString(),
    })
  }

  warn(message: string, context?: Record<string, any>) {
    this.sendToEndpoint({
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString(),
    })
  }
}

export const logger = new Logger()
```

### API endpoint для логов:

```typescript
// src/app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const logEvent = await request.json()

    // Сохранение в Supabase (опционально)
    await supabase.from('application_logs').insert({
      level: logEvent.level,
      message: logEvent.message,
      context: logEvent.context,
      timestamp: logEvent.timestamp,
      user_agent: request.headers.get('user-agent'),
      ip_address: request.ip,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Log endpoint error:', error)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
}
```

---

## 🔧 Интеграция в компоненты

### Error Boundary с логированием:

```tsx
// src/components/common/monitored-error-boundary.tsx
'use client'

import React from 'react'
import { logger } from '@/lib/logger'
import * as Sentry from '@sentry/nextjs'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
}

interface State {
  hasError: boolean
  error?: Error
}

export class MonitoredErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логирование в Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    // Собственное логирование
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <h2 className="text-lg font-semibold text-red-800">
        Что-то пошло не так
      </h2>
      <p className="text-red-600">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Перезагрузить страницу
      </button>
    </div>
  )
}
```

### Хук для отслеживания ошибок:

```tsx
// src/hooks/use-error-tracking.ts
import { useCallback } from 'react'
import { logger } from '@/lib/logger'
import * as Sentry from '@sentry/nextjs'

export function useErrorTracking() {
  const trackError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      logger.error('Application error', error, context)
      Sentry.captureException(error, { extra: context })
    },
    []
  )

  const trackEvent = useCallback(
    (event: string, data?: Record<string, any>) => {
      logger.info(`User event: ${event}`, data)
      Sentry.addBreadcrumb({
        message: event,
        data,
        level: 'info',
      })
    },
    []
  )

  return { trackError, trackEvent }
}
```

---

## 📊 Настройка дашбордов

### Vercel Analytics Dashboard

1. Перейдите в Vercel Dashboard → Analytics
2. Настройте цели (Goals):
   - Регистрация пользователей
   - Создание комнат
   - Добавление треков

### Sentry Dashboard

1. Настройте алерты для критических ошибок
2. Создайте дашборды для:
   - Частота ошибок по страницам
   - Производительность API
   - Пользовательские сессии

---

## 🚨 Алерты и уведомления

### Настройка Slack уведомлений (Sentry):

1. В Sentry → Settings → Integrations
2. Добавьте Slack интеграцию
3. Настройте правила алертов:
   - Новые ошибки
   - Превышение лимита ошибок
   - Критические ошибки производительности

### Email уведомления:

```typescript
// src/lib/alert-system.ts
export async function sendCriticalAlert(error: Error, context: any) {
  if (process.env.NODE_ENV !== 'production') return

  const alertData = {
    subject: `🚨 Critical Error in Music Room`,
    message: `
      Error: ${error.message}
      Stack: ${error.stack}
      Context: ${JSON.stringify(context, null, 2)}
      Time: ${new Date().toISOString()}
    `,
  }

  // Отправка через API (например, SendGrid, Resend)
  await fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData),
  })
}
```

---

## 📈 Метрики для отслеживания

### Ключевые метрики:

1. **Error Rate** - процент ошибок от общих запросов
2. **MTTR** - среднее время восстановления
3. **User Impact** - количество затронутых пользователей
4. **Performance** - время отклика API и загрузки страниц

### Custom Events:

```typescript
// Отслеживание бизнес-метрик
trackEvent('room_created', { roomType: 'public' })
trackEvent('track_added', { source: 'search' })
trackEvent('user_joined_room', { roomSize: participants.length })
```

---

## ✅ Чек-лист мониторинга

- [ ] Vercel Analytics подключен
- [ ] Speed Insights настроен
- [ ] Sentry проект создан (опционально)
- [ ] Error boundaries добавлены
- [ ] Логирование настроено
- [ ] Алерты сконфигурированы
- [ ] Дашборды созданы
- [ ] Тестирование ошибок проведено

---

**🎯 Результат: Полная видимость состояния приложения в production с автоматическими алертами при проблемах.**

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export type NotificationPermission = 'default' | 'granted' | 'denied'

interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  actions?: { action: string; title: string; icon?: string }[]
}

interface UseNotificationsReturn {
  permission: NotificationPermission
  isSupported: boolean
  requestPermission: () => Promise<NotificationPermission>
  showNotification: (options: NotificationOptions) => Promise<void>
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Проверяем поддержку уведомлений
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }

    // Загружаем настройки из localStorage
    const savedSettings = localStorage.getItem('notification_settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setIsEnabled(settings.enabled ?? true)
      } catch (error) {
        console.error('Error parsing notification settings:', error)
      }
    }
  }, [mounted])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      toast.error('Уведомления не поддерживаются в этом браузере')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        toast.success('Уведомления разрешены!')
      } else if (result === 'denied') {
        toast.error('Уведомления заблокированы')
      }

      return result
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Ошибка при запросе разрешений')
      return 'denied'
    }
  }, [isSupported])

  const showNotification = useCallback(
    async (options: NotificationOptions): Promise<void> => {
      if (!isSupported) {
        console.warn('Notifications not supported')
        return
      }

      if (!isEnabled) {
        console.log('Notifications disabled by user')
        return
      }

      if (permission !== 'granted') {
        console.warn('Notification permission not granted')
        return
      }

      try {
        // Проверяем, активна ли вкладка
        if (document.visibilityState === 'visible') {
          // Если вкладка активна, показываем toast вместо уведомления
          toast.info(options.body || options.title, {
            description: options.body ? options.title : undefined,
          })
          return
        }

        // Вибрация (если поддерживается)
        if (options.vibrate && 'vibrate' in navigator) {
          navigator.vibrate(options.vibrate)
        }

        // Создаем уведомление
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/icon-96x96.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
        })

        // Автоматически закрываем через 5 секунд
        setTimeout(() => {
          notification.close()
        }, 5000)

        // Обработчик клика по уведомлению
        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      } catch (error) {
        console.error('Error showing notification:', error)
      }
    },
    [isSupported, isEnabled, permission]
  )

  const setEnabledWithStorage = useCallback((enabled: boolean) => {
    if (!mounted) return
    
    setIsEnabled(enabled)

    // Сохраняем в localStorage
    const currentSettings = localStorage.getItem('notification_settings')
    let settings = {}

    try {
      settings = currentSettings ? JSON.parse(currentSettings) : {}
    } catch (error) {
      console.error('Error parsing notification settings:', error)
    }

    const newSettings = { ...settings, enabled }
    localStorage.setItem('notification_settings', JSON.stringify(newSettings))
  }, [mounted])

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    isEnabled,
    setEnabled: setEnabledWithStorage,
  }
}
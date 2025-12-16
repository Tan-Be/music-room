'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, X, BellOff } from 'lucide-react'

export function NotificationPermissionBanner() {
  const { permission, isSupported, requestPermission } = useNotifications()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Показываем баннер только если:
    // 1. Уведомления поддерживаются
    // 2. Разрешение не дано
    // 3. Пользователь не отклонил баннер
    const dismissed = localStorage.getItem('notification-banner-dismissed')
    
    if (isSupported && permission === 'default' && !dismissed) {
      // Показываем через 5 секунд после загрузки
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isSupported, permission])

  const handleRequestPermission = async () => {
    const result = await requestPermission()
    if (result !== 'default') {
      setShowBanner(false)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setIsDismissed(true)
    localStorage.setItem('notification-banner-dismissed', 'true')
  }

  if (!showBanner || isDismissed || !isSupported || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-40 animate-in slide-in-from-top-5">
      <Card className="p-4 shadow-lg border-2 border-blue-500/20 bg-blue-50/95 dark:bg-blue-950/95 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-100">
              Включить уведомления?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Получайте уведомления о новых сообщениях и треках, даже когда вкладка неактивна
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRequestPermission} 
                size="sm" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Разрешить
              </Button>
              <Button 
                onClick={handleDismiss} 
                size="sm" 
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Компонент для показа статуса уведомлений
export function NotificationStatus() {
  const { permission, isSupported } = useNotifications()

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="h-4 w-4" />
        <span>Уведомления не поддерживаются</span>
      </div>
    )
  }

  const getStatusInfo = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <Bell className="h-4 w-4 text-green-600" />,
          text: 'Уведомления включены',
          color: 'text-green-600'
        }
      case 'denied':
        return {
          icon: <BellOff className="h-4 w-4 text-red-600" />,
          text: 'Уведомления заблокированы',
          color: 'text-red-600'
        }
      default:
        return {
          icon: <Bell className="h-4 w-4 text-yellow-600" />,
          text: 'Разрешение не запрошено',
          color: 'text-yellow-600'
        }
    }
  }

  const status = getStatusInfo()

  return (
    <div className={`flex items-center gap-2 text-sm ${status.color}`}>
      {status.icon}
      <span>{status.text}</span>
    </div>
  )
}
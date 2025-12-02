'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { toast } from 'sonner'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    // Проверяем начальное состояние
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
      toast.success('Соединение восстановлено', {
        icon: <Wifi className="h-4 w-4" />,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
      toast.error('Нет подключения к интернету', {
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showOffline) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5">
      <WifiOff className="h-5 w-5" />
      <div>
        <p className="font-medium">Нет подключения</p>
        <p className="text-sm opacity-90">Проверьте интернет-соединение</p>
      </div>
    </div>
  )
}

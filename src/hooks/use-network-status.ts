'use client'

import { useState, useEffect } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Проверяем начальное состояние
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // Можно добавить логику переподключения
        window.location.reload()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}

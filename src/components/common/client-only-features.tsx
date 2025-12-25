'use client'

import { NetworkStatus } from '@/components/common/network-status'
import { PWAInstall } from '@/components/common/pwa-install'
import { NotificationManager } from '@/components/common/notification-manager'
import { NotificationPermissionBanner } from '@/components/common/notification-permission-banner'
import { PerformanceMonitor } from '@/components/common/performance-optimized'
import { useEffect, useState } from 'react'

export function ClientOnlyFeatures() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <NetworkStatus />
      <PWAInstall />
      <NotificationManager />
      <NotificationPermissionBanner />
      <PerformanceMonitor />
    </>
  )
}
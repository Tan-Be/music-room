'use client'

import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { cn } from '@/lib/utils'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1">
        {user && <Sidebar />}

        <main className={cn('flex-1', user ? 'md:ml-64' : '')}>
          <div className="container py-6">{children}</div>
        </main>
      </div>

      {user && (
        <div className="md:hidden fixed bottom-4 left-4">
          <MobileNav />
        </div>
      )}
    </div>
  )
}

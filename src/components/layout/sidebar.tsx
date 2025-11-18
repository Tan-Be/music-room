'use client'

import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigationItems = [
  {
    title: 'Главная',
    href: '/',
    icon: Icons.music,
  },
  {
    title: 'Комнаты',
    href: '/rooms',
    icon: Icons.users,
  },
  {
    title: 'Профиль',
    href: '/profile',
    icon: Icons.user,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Если пользователь не авторизован, не показываем sidebar
  if (!user) {
    return null
  }

  return (
    <div className="hidden md:flex flex-col border-r w-64 fixed h-full">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navigationItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                  pathname === item.href
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/rooms/create">
            <Icons.music className="mr-2 h-4 w-4" />
            Создать комнату
          </Link>
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Icons.menu className="h-6 w-6" />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link href="/" className="flex items-center">
          <Icons.music className="mr-2 h-4 w-4" />
          <span className="font-bold">Music Room</span>
        </Link>
        
        <div className="my-4 h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="flex flex-col space-y-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    pathname === item.href
                      ? 'bg-muted'
                      : 'hover:bg-muted hover:text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>
          
          {user && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/rooms/create" onClick={() => setOpen(false)}>
                  <Icons.music className="mr-2 h-4 w-4" />
                  Создать комнату
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
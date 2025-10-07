"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onLogin?: () => void
  onLogout?: () => void
}

export function Header({ user, onLogin, onLogout }: HeaderProps) {
  const pathname = usePathname()
  
  const navItems = [
    { name: "Главная", href: "/" },
    { name: "Комнаты", href: "/rooms" },
    { name: "Профиль", href: "/profile" },
  ]
  
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded">
              MR
            </span>
            <span>Music Room</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Badge variant="secondary" className="hidden sm:flex">
                Бесплатный аккаунт
              </Badge>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user.name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <Button onClick={onLogin}>Войти</Button>
          )}
        </div>
      </div>
    </header>
  )
}
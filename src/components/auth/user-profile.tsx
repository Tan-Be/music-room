'use client'

import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'

export function UserProfile() {
  const { user, profile, signOut } = useAuth()

  if (!user || !profile) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
        <CardDescription>Информация о вашем аккаунте</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={profile.avatar_url || undefined}
              alt={profile.username}
            />
            <AvatarFallback>
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{profile.username}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Дата регистрации</p>
            <p className="text-sm text-muted-foreground">
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : 'Не указана'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Последний вход</p>
            <p className="text-sm text-muted-foreground">
              {user.last_sign_in_at
                ? formatRelativeTime(new Date(user.last_sign_in_at))
                : 'Неизвестно'}
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={signOut} className="w-full">
          Выйти
        </Button>
      </CardContent>
    </Card>
  )
}

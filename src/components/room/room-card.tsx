'use client'

import { memo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Lock, Globe, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { rooms } from '@/lib/rooms'
import { toast } from 'sonner'

interface Room {
  id: string
  name: string
  description?: string
  privacy: 'public' | 'unlisted' | 'private'
  participantCount: number
  maxParticipants: number
  owner: {
    name: string
  }
  createdAt: Date
}

interface RoomCardProps {
  room: Room
  className?: string
}

// Функция для проверки равенства пропсов
function arePropsEqual(prevProps: RoomCardProps, nextProps: RoomCardProps) {
  return (
    prevProps.room.id === nextProps.room.id &&
    prevProps.room.name === nextProps.room.name &&
    prevProps.room.description === nextProps.room.description &&
    prevProps.room.privacy === nextProps.room.privacy &&
    prevProps.room.participantCount === nextProps.room.participantCount &&
    prevProps.room.maxParticipants === nextProps.room.maxParticipants &&
    prevProps.room.owner.name === nextProps.room.owner.name &&
    prevProps.className === nextProps.className
  )
}

const RoomCardComponent = memo(({ room, className }: RoomCardProps) => {
  const router = useRouter()
  const { user, profile } = useAuth()

  const getPrivacyIcon = () => {
    switch (room.privacy) {
      case 'public':
        return <Globe className="h-4 w-4" />
      case 'unlisted':
        return <LinkIcon className="h-4 w-4" />
      case 'private':
        return <Lock className="h-4 w-4" />
    }
  }

  const getPrivacyLabel = () => {
    switch (room.privacy) {
      case 'public':
        return 'Публичная'
      case 'unlisted':
        return 'По ссылке'
      case 'private':
        return 'Приватная'
    }
  }

  // Функция для присоединения к комнате
  const handleJoinRoom = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      // Проверяем лимит участников
      const { isLimitReached, maxCount } = await rooms.checkParticipantLimit(
        room.id
      )

      if (isLimitReached) {
        toast.error(`Доступ запрещен: достигнут лимит участников (${maxCount})`)
        return
      }

      // Добавляем пользователя в комнату
      const response = await rooms.addParticipant({
        room_id: room.id,
        user_id: user.id,
        role: 'member',
      })

      if (response.error) {
        // Если пользователь уже участник, просто переходим в комнату
        if (response.error.includes('duplicate key value')) {
          router.push(`/room/${room.id}`)
          return
        }
        throw new Error(response.error)
      }

      // Переходим в комнату
      router.push(`/room/${room.id}`)
    } catch (error) {
      console.error('Error joining room:', error)
      toast.error('Не удалось присоединиться к комнате')
    }
  }

  return (
    <Card className={cn('w-full hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {room.name}
              <Badge variant="secondary" className="text-xs">
                {getPrivacyIcon()}
                {getPrivacyLabel()}
              </Badge>
            </CardTitle>
            {room.description && (
              <CardDescription className="mt-1">
                {room.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground min-w-0">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {room.participantCount}/{room.maxParticipants}
              </span>
            </div>
            <span className="truncate">от {room.owner.name}</span>
          </div>

          <Button onClick={handleJoinRoom} className="ml-2 flex-shrink-0">
            Присоединиться
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}, arePropsEqual)

RoomCardComponent.displayName = 'RoomCard'

export { RoomCardComponent as RoomCard }

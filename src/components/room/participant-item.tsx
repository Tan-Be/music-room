'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'

interface Participant {
  id: string
  name: string
  avatar?: string
  role: 'owner' | 'moderator' | 'member'
  isOnline: boolean
  userId: string
}

interface ParticipantItemProps {
  participant: Participant
  currentUserId: string
  currentUserRole: 'owner' | 'moderator' | 'member'
  onRemove?: (participantId: string) => void
  onMakeModerator?: (participantId: string) => void
  onRemoveModerator?: (participantId: string) => void
  className?: string
}

export function ParticipantItem({
  participant,
  currentUserId,
  currentUserRole,
  onRemove,
  onMakeModerator,
  onRemoveModerator,
  className,
}: ParticipantItemProps) {
  const getRoleBadge = () => {
    switch (participant.role) {
      case 'owner':
        return <Badge variant="default">Владелец</Badge>
      case 'moderator':
        return <Badge variant="secondary">Модератор</Badge>
      default:
        return null
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove(participant.id)
    }
  }

  const handleMakeModerator = () => {
    if (onMakeModerator) {
      onMakeModerator(participant.id)
    }
  }

  const handleRemoveModerator = () => {
    if (onRemoveModerator) {
      onRemoveModerator(participant.id)
    }
  }

  // Показываем меню действий только если текущий пользователь имеет права
  const canManageParticipant = 
    (currentUserRole === 'owner' && participant.role !== 'owner') ||
    (currentUserRole === 'moderator' && participant.role === 'member')

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg hover:bg-muted',
        className
      )}
    >
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={participant.avatar} alt={participant.name} />
          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {participant.isOnline && (
          <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-background"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{participant.name}</span>
          {getRoleBadge()}
        </div>
      </div>

      {canManageParticipant && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icons.moreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {participant.role === 'member' && currentUserRole === 'owner' && (
              <DropdownMenuItem onClick={handleMakeModerator}>
                <Icons.user className="h-4 w-4 mr-2" />
                Назначить модератором
              </DropdownMenuItem>
            )}
            {participant.role === 'moderator' && currentUserRole === 'owner' && (
              <DropdownMenuItem onClick={handleRemoveModerator}>
                <Icons.user className="h-4 w-4 mr-2" />
                Разжаловать модератора
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={handleRemove}
              className="text-destructive focus:text-destructive"
            >
              <Icons.user className="h-4 w-4 mr-2" />
              Исключить из комнаты
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
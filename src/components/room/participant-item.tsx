"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Participant {
  id: string
  name: string
  avatar?: string
  role: "owner" | "moderator" | "member"
  isOnline: boolean
}

interface ParticipantItemProps {
  participant: Participant
  className?: string
}

export function ParticipantItem({ participant, className }: ParticipantItemProps) {
  const getRoleBadge = () => {
    switch (participant.role) {
      case "owner":
        return <Badge variant="default">Владелец</Badge>
      case "moderator":
        return <Badge variant="secondary">Модератор</Badge>
      default:
        return null
    }
  }
  
  return (
    <div className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-muted", className)}>
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
    </div>
  )
}
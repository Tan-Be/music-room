'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { ParticipantItem } from '@/components/room/participant-item'
import { TrackQueue } from '@/components/room/track-queue'
import { Chat } from '@/components/room/chat'
import { TrackSearchDialog } from '@/components/room/track-search-dialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { rooms } from '@/lib/rooms'
import { supabase } from '@/lib/supabase'
import { chatRealtimeService, ChatMessageWithUserInfo } from '@/lib/chat-realtime'
import { useChatRealtime } from '@/hooks/useChatRealtime'
import { systemMessages } from '@/lib/system-messages'
import { fetchRoomTracks } from '@/lib/track-queue'

// Types
interface Room {
  id: string
  name: string
  description?: string
  privacy: 'public' | 'unlisted' | 'private'
  participantCount: number
  maxParticipants: number
  owner: { 
    id: string
    name: string 
  }
  createdAt: Date
  isPlaying: boolean
  currentTrack?: Track
  progress: number
}

interface Participant {
  id: string
  name: string
  avatar?: string
  role: 'owner' | 'moderator' | 'member'
  isOnline: boolean
  userId: string
}

interface Track {
  id: string
  title: string
  artist: string
  duration: number // в секундах
  thumbnailUrl?: string
  votesUp: number
  votesDown: number
  addedBy: {
    name: string
    avatar?: string
    id: string
  }
  isPlaying?: boolean
  position?: number
}

// Тип для пользовательских сообщений
interface UserMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  type: 'user'
}

// Тип для системных сообщений
interface SystemMessage {
  id: string
  content: string
  timestamp: Date
  type: 'system'
}

// Объединенный тип для всех сообщений
type ChatMessage = UserMessage | SystemMessage

// Mock data for demonstration
const mockRoom: Room = {
  id: '1',
  name: 'Chill Vibes',
  description: 'Расслабляющая музыка для работы и отдыха',
  privacy: 'public',
  participantCount: 12,
  maxParticipants: 20,
  owner: { 
    id: '1',
    name: 'Alex_Music' 
  },
  createdAt: new Date(),
  isPlaying: true,
  currentTrack: {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    duration: 244, // seconds
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    votesUp: 15,
    votesDown: 2,
    addedBy: {
      name: 'Alex_Music',
      id: '1'
    },
    isPlaying: true
  },
  progress: 120, // seconds
}

const mockParticipants: Participant[] = [
  { id: '1', name: 'Alex_Music', userId: '1', role: 'owner', isOnline: true },
  { id: '2', name: 'DJ_Master', userId: '2', role: 'moderator', isOnline: true },
  { id: '3', name: 'MusicLover22', userId: '3', role: 'member', isOnline: true },
  { id: '4', name: 'PartyStarter', userId: '4', role: 'member', isOnline: false },
  { id: '5', name: 'ChillVibes', userId: '5', role: 'member', isOnline: true },
]

const mockQueue: Track[] = [
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: 200,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    votesUp: 5,
    votesDown: 1,
    addedBy: {
      name: 'DJ_Master',
      id: '2'
    },
    position: 0
  },
  {
    id: '3',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    duration: 215,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    votesUp: 3,
    votesDown: 0,
    addedBy: {
      name: 'MusicLover22',
      id: '3'
    },
    position: 1
  },
  {
    id: '4',
    title: 'Take My Breath',
    artist: 'The Weeknd',
    duration: 339,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    votesUp: 2,
    votesDown: 0,
    addedBy: {
      name: 'ChillVibes',
      id: '5'
    },
    position: 2
  },
]

export default function RoomPage({ params }: { params: { id: string } }) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { messages, isLoading, isSubscribed, sendMessage, sendSystemMessage } = useChatRealtime(params.id)
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants)
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'moderator' | 'member'>('member')
  const [isTyping, setIsTyping] = useState(false)
  const [queue, setQueue] = useState<Track[]>(mockQueue)

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Определение роли текущего пользователя
  useEffect(() => {
    if (user && profile) {
      const participant = mockParticipants.find(p => p.userId === user.id)
      if (participant) {
        setCurrentUserRole(participant.role)
      }
    }
  }, [user, profile])

  // Отправка системного сообщения о присоединении пользователя
  useEffect(() => {
    if (user && profile && params.id) {
      // Отправляем системное сообщение о присоединении
      sendSystemMessage(
        'user_joined',
        systemMessages.generateUserJoinedMessage(profile.username || 'Пользователь')
      )
    }
    
    // Отправляем системное сообщение о покидании комнаты при размонтировании
    return () => {
      if (user && profile && params.id) {
        sendSystemMessage(
          'user_left',
          systemMessages.generateUserLeftMessage(profile.username || 'Пользователь')
        )
      }
    }
  }, [user, profile, params.id, sendSystemMessage])

  // Присоединение к комнате
  const joinRoom = async () => {
    if (!user) return
    
    try {
      // Проверяем лимит участников
      const { isLimitReached, currentCount, maxCount } = await rooms.checkParticipantLimit(params.id)
      
      if (isLimitReached) {
        toast.error(`Достигнут лимит участников (${maxCount})`)
        return
      }
      
      // Добавляем пользователя в комнату
      const response = await rooms.addParticipant({
        room_id: params.id,
        user_id: user.id,
        role: 'member'
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast.success('Вы успешно присоединились к комнате!')
      
      // Обновляем список участников (в реальной реализации нужно получить данные из БД)
      const newParticipant: Participant = {
        id: `temp-${Date.now()}`, // временный ID
        name: profile?.username || 'Anonymous',
        userId: user.id,
        role: 'member',
        isOnline: true
      }
      setParticipants([...participants, newParticipant])
    } catch (error) {
      console.error('Error joining room:', error)
      toast.error('Не удалось присоединиться к комнате')
    }
  }

  // Покидание комнаты
  const leaveRoom = async () => {
    if (!user) return
    
    try {
      // Находим участника в комнате
      const participant = participants.find(p => p.userId === user.id)
      
      if (!participant) {
        toast.error('Вы не являетесь участником этой комнаты')
        return
      }
      
      // Удаляем участника из комнаты
      const response = await rooms.removeParticipant(participant.id)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast.success('Вы покинули комнату')
      
      // Обновляем список участников
      const updatedParticipants = participants.filter(p => p.id !== participant.id)
      setParticipants(updatedParticipants)
      
      // Перенаправляем на страницу комнат
      router.push('/rooms')
    } catch (error) {
      console.error('Error leaving room:', error)
      toast.error('Не удалось покинуть комнату')
    }
  }

  // Назначение модератора
  const makeModerator = async (participantId: string) => {
    try {
      const response = await rooms.updateParticipantRole(participantId, 'moderator')
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast.success('Пользователь назначен модератором')
      
      // Обновляем список участников
      const updatedParticipants = participants.map(p => 
        p.id === participantId ? { ...p, role: 'moderator' } : p
      ) as Participant[]
      setParticipants(updatedParticipants)
    } catch (error) {
      console.error('Error making moderator:', error)
      toast.error('Не удалось назначить модератором')
    }
  }

  // Разжалование модератора
  const removeModerator = async (participantId: string) => {
    try {
      const response = await rooms.updateParticipantRole(participantId, 'member')
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast.success('Пользователь разжалован')
      
      // Обновляем список участников
      const updatedParticipants = participants.map(p => 
        p.id === participantId ? { ...p, role: 'member' } : p
      ) as Participant[]
      setParticipants(updatedParticipants)
    } catch (error) {
      console.error('Error removing moderator:', error)
      toast.error('Не удалось разжаловать модератора')
    }
  }

  // Исключение участника
  const removeParticipant = async (participantId: string) => {
    try {
      const response = await rooms.removeParticipant(participantId)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast.success('Пользователь исключен из комнаты')
      
      // Обновляем список участников
      const updatedParticipants = participants.filter(p => p.id !== participantId)
      setParticipants(updatedParticipants)
    } catch (error) {
      console.error('Error removing participant:', error)
      toast.error('Не удалось исключить пользователя')
    }
  }

  // Обработка изменения порядка треков
  const handleReorderQueue = (newOrder: Track[]) => {
    // В реальной реализации здесь будет вызов API для обновления порядка треков
    setQueue(newOrder)
    toast.success('Порядок треков обновлен')
  }

  // Обработка удаления трека
  const handleDeleteTrack = (trackId: string) => {
    // В реальной реализации здесь будет вызов API для удаления трека
    const updatedQueue = queue.filter(track => track.id !== trackId)
    setQueue(updatedQueue)
    toast.success('Трек удален из очереди')
  }

  // Обработка воспроизведения трека
  const handlePlayTrack = (trackId: string) => {
    // В реальной реализации здесь будет вызов API для воспроизведения трека
    toast.success('Трек поставлен на воспроизведение')
  }

  // Обработка голосования "за" трек
  const handleVoteUp = (trackId: string) => {
    // В реальной реализации здесь будет вызов API для голосования
    const updatedQueue = queue.map(track => 
      track.id === trackId 
        ? { ...track, votesUp: track.votesUp + 1 } 
        : track
    )
    setQueue(updatedQueue)
    toast.success('Голос учтен')
  }

  // Обработка голосования "против" трек
  const handleVoteDown = (trackId: string) => {
    // В реальной реализации здесь будет вызов API для голосования
    const updatedQueue = queue.map(track => 
      track.id === trackId 
        ? { ...track, votesDown: track.votesDown + 1 } 
        : track
    )
    setQueue(updatedQueue)
    toast.success('Голос учтен')
  }
  
  // Обработка изменения голосов
  const handleVoteChange = async () => {
    // В реальной реализации здесь будет вызов API для получения обновленной очереди
    // Для now, мы просто покажем уведомление
    toast.success('Очередь треков обновлена')
  }

  if (!user) {
    return null // or a loading spinner
  }

  // Проверяем, является ли пользователь участником комнаты
  const isParticipant = participants.some(p => p.userId === user.id)
  
  // Если пользователь не участник, показываем кнопку присоединения
  if (!isParticipant) {
    return (
      <div className="container py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Присоединиться к комнате</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Вы не являетесь участником этой комнаты. Хотите присоединиться?</p>
            <Button onClick={joinRoom} className="w-full">
              Присоединиться к комнате
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Room header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.music className="h-6 w-6" />
                    {mockRoom.name}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    {mockRoom.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Icons.users className="h-4 w-4 mr-2" />
                    Участники ({mockRoom.participantCount}/{mockRoom.maxParticipants})
                  </Button>
                  <Button variant="outline" size="sm" onClick={leaveRoom}>
                    <Icons.logout className="h-4 w-4 mr-2" />
                    Покинуть комнату
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Current track */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.play className="h-5 w-5" />
                Сейчас играет
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mockRoom.currentTrack ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <img 
                      src={mockRoom.currentTrack.thumbnailUrl} 
                      alt={mockRoom.currentTrack.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                    />
                    <Button 
                      size="icon" 
                      className="absolute bottom-2 right-2 rounded-full"
                    >
                      <Icons.play className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{mockRoom.currentTrack.title}</h3>
                    <p className="text-muted-foreground">{mockRoom.currentTrack.artist}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                        <span>
                          {Math.floor(mockRoom.progress / 60)}:
                          {(mockRoom.progress % 60).toString().padStart(2, '0')}
                        </span>
                        <span>
                          {Math.floor(mockRoom.currentTrack.duration / 60)}:
                          {(mockRoom.currentTrack.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(mockRoom.progress / mockRoom.currentTrack.duration) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <Icons.skipBack className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        <Icons.pause className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icons.skipForward className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icons.music className="h-12 w-12 mx-auto mb-4" />
                  <p>Ничего не играет</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Track queue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icons.list className="h-5 w-5" />
                  Очередь треков
                </CardTitle>
                <TrackSearchDialog roomId={params.id} userId={user.id} />
              </div>
            </CardHeader>
            <CardContent>
              <TrackQueue
                tracks={queue}
                roomId={params.id}
                currentUserId={user.id}
                currentUserRole={currentUserRole}
                onReorder={handleReorderQueue}
                onDelete={handleDeleteTrack}
                onPlay={handlePlayTrack}
                onVoteUp={handleVoteUp}
                onVoteDown={handleVoteDown}
                onVoteChange={handleVoteChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.users className="h-5 w-5" />
                Участники
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <ParticipantItem 
                    key={participant.id} 
                    participant={participant} 
                    currentUserId={user.id}
                    currentUserRole={currentUserRole}
                    onRemove={removeParticipant}
                    onMakeModerator={makeModerator}
                    onRemoveModerator={removeModerator}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="h-[500px]">
            <Chat 
              messages={messages} 
              currentUser={{
                id: user.id,
                name: profile?.username || 'Anonymous',
                avatar: profile?.avatar_url || undefined
              }}
              onSendMessage={sendMessage}
              isTyping={isTyping}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
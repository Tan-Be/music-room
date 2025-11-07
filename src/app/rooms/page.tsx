'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoomCard } from '@/components/room/room-card'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Тип данных для RoomCard
interface RoomCardData {
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

// Тип данных для комнаты из Supabase
interface SupabaseRoom {
  id: string
  name: string
  description: string | null
  is_public: boolean
  max_participants: number
  created_at: string
  owner_id: string
  profiles?: {
    username: string | null
  } | null
}

export default function RoomsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [rooms, setRooms] = useState<RoomCardData[]>([])
  const [filteredRooms, setFilteredRooms] = useState<RoomCardData[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка списка комнат
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        
        // Получаем публичные комнаты и комнаты, где пользователь является владельцем
        const { data, error } = await supabase
          .from('rooms')
          .select(`
            id,
            name,
            description,
            is_public,
            max_participants,
            created_at,
            owner_id,
            profiles (username)
          `)
          .or(`is_public.eq.true,owner_id.eq.${user?.id || '0'}`)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw new Error(error.message)
        }
        
        // Получаем количество участников для каждой комнаты
        const roomsWithParticipants = await Promise.all(
          (data as SupabaseRoom[]).map(async (room) => {
            const { count } = await supabase
              .from('room_participants')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id)
            
            return {
              id: room.id,
              name: room.name,
              description: room.description || undefined,
              privacy: room.is_public ? 'public' : 'private',
              participantCount: count || 0,
              maxParticipants: room.max_participants,
              owner: {
                name: room.profiles?.username || 'Неизвестный'
              },
              createdAt: new Date(room.created_at)
            } as RoomCardData
          })
        )
        
        setRooms(roomsWithParticipants)
        setFilteredRooms(roomsWithParticipants)
      } catch (error) {
        console.error('Error fetching rooms:', error)
        toast.error('Не удалось загрузить список комнат')
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchRooms()
    }
  }, [user])

  // Фильтрация комнат по поисковому запросу
  useEffect(() => {
    const filtered = rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredRooms(filtered)
  }, [searchQuery, rooms])

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Доступ ограничен</h1>
        <p className="text-muted-foreground mb-6">
          Для просмотра комнат необходимо войти в систему
        </p>
        <Button asChild>
          <Link href="/login">Войти</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.music className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Музыкальные комнаты</h1>
          <p className="text-muted-foreground">
            Присоединяйтесь к публичным комнатам или создайте свою
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/rooms/create">
            <Icons.music className="mr-2 h-4 w-4" />
            Создать комнату
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Input
            placeholder="Поиск комнат..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Icons.music className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Комнаты не найдены</h3>
          <p className="text-muted-foreground mb-4">
            Попробуйте изменить поисковый запрос или создайте новую комнату
          </p>
          <Button asChild>
            <Link href="/rooms/create">Создать комнату</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
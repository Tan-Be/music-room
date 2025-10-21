'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoomCard } from '@/components/room/room-card'
import { Icons } from '@/components/icons'
import Link from 'next/link'

// Тип данных для RoomCard
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

// Моковые данные для демонстрации
const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Chill Vibes',
    description: 'Расслабляющая музыка для работы и отдыха',
    privacy: 'public',
    participantCount: 12,
    maxParticipants: 20,
    owner: { name: 'Alex_Music' },
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Party Hits',
    description: 'Лучшие хиты для вечеринок',
    privacy: 'public',
    participantCount: 8,
    maxParticipants: 15,
    owner: { name: 'DJ_Master' },
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Indie Discoveries',
    description: 'Новые инди-треки и артисты',
    privacy: 'private',
    participantCount: 5,
    maxParticipants: 10,
    owner: { name: 'Indie_Fan' },
    createdAt: new Date(),
  },
]

export default function RoomsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(mockRooms)

  useEffect(() => {
    // Фильтрация комнат по поисковому запросу
    const filtered = mockRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredRooms(filtered)
  }, [searchQuery])

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
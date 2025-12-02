'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoomCard } from '@/components/room/room-card'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/common/animated-background'
import { BackgroundMusic } from '@/components/common/background-music'




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
    privacy: 'public',
    participantCount: 5,
    maxParticipants: 10,
    owner: { name: 'Indie_Fan' },
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Jazz Lounge',
    description: 'Классический джаз для уютной атмосферы',
    privacy: 'public',
    participantCount: 7,
    maxParticipants: 12,
    owner: { name: 'Jazz_Lover' },
    createdAt: new Date(),
  },
]

export default function Home() {
  const { user, profile } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(mockRooms)

  useEffect(() => {
    // Фильтрация комнат по поисковому запросу
    const filtered = mockRooms.filter(
      room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.description &&
          room.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredRooms(filtered)
  }, [searchQuery])

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 relative">
      {/* Анимированный фон с фиолетовыми волнами */}
      <AnimatedBackground />
      
      {/* Фоновая музыка */}
      <BackgroundMusic />

      <div className="relative z-10 w-full items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-border/50 bg-background/95 backdrop-blur-md pb-6 pt-8 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-card/95 lg:p-4 shadow-lg">
          Добро пожаловать в&nbsp;
          <code className="font-mono font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Music Room</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-background via-background lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="#"
            rel="noopener noreferrer"
          >
            By{' '}
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              Music Room
            </span>
          </a>
        </div>
      </div>

      <div className="relative z-10 flex place-items-center mb-8">
        <div className="bg-background/80 backdrop-blur-md rounded-2xl p-8 border-2 border-primary/20 shadow-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="block bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              Music Room
            </span>
            <span className="block text-2xl md:text-3xl mt-4 text-foreground/90">
              Совместное прослушивание музыки
            </span>
          </h1>
        </div>
      </div>

      {/* Статистика пользователя */}
      {user && profile && (
        <div className="relative z-10 w-full max-w-4xl mb-8">
          <div className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 rounded-xl border-2 border-primary/20 p-6 shadow-lg backdrop-blur-md bg-background/60">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  👋 Добро пожаловать, {profile.username}!
                </h2>
                <p className="text-muted-foreground mt-1">
                  Ваша статистика и активность
                </p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="text-center bg-card/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-primary/20 hover:border-primary transition-all hover:scale-105">
                  <p className="text-3xl font-bold text-primary">
                    {profile.tracks_added_today}
                    <span className="text-muted-foreground text-lg">/8</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Треков сегодня
                  </p>
                </div>
                <div className="text-center bg-card/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-blue-500/20 hover:border-blue-500 transition-all hover:scale-105">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Комнат создано
                  </p>
                </div>
                <div className="text-center bg-card/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-green-500/20 hover:border-green-500 transition-all hover:scale-105">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">12</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Участие в комнатах
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Поиск по комнатам */}
      <div className="relative z-10 w-full max-w-4xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 bg-background/80 backdrop-blur-md rounded-xl p-6 border border-border/50">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Популярные комнаты
            </h2>
            <p className="text-muted-foreground mt-1">
              Присоединяйтесь к публичным комнатам или создайте свою
            </p>
          </div>
          {user ? (
            <Button 
              asChild 
              size="lg"
              className="mt-4 md:mt-0 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Link href="/rooms/create">
                <Icons.music className="mr-2 h-5 w-5" />
                Создать комнату
              </Link>
            </Button>
          ) : (
            <Button 
              asChild 
              size="lg"
              variant="outline"
              className="mt-4 md:mt-0 shadow-lg border-2 border-primary"
            >
              <Link href="/login">
                Войти для создания комнаты
              </Link>
            </Button>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Input
              placeholder="🔍 Поиск комнат по названию или описанию..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-2 focus:border-primary transition-all"
            />
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card/95 backdrop-blur-md rounded-xl border-2 border-dashed border-muted-foreground/30">
            <div className="relative">
              <Icons.music className="h-20 w-20 text-primary mb-6 animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-center">Комнаты не найдены</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Попробуйте изменить поисковый запрос или создайте новую комнату прямо сейчас
            </p>
            {user ? (
              <Button asChild size="lg" className="shadow-lg">
                <Link href="/rooms/create">
                  <Icons.music className="mr-2 h-5 w-5" />
                  Создать первую комнату
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="shadow-lg border-2">
                <Link href="/login">
                  Войти для создания комнаты
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-5 lg:text-left gap-4">
        <a
          href="/rooms"
          className="group rounded-xl border border-primary/20 bg-card px-6 py-6 transition-all duration-300 hover:border-primary hover:bg-primary/5 cursor-pointer"
        >
          <h2 className="mb-3 text-2xl font-bold text-primary">
            🎵 Комнаты{' '}
            <span className="inline-block transition-transform group-hover:translate-x-2 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-muted-foreground">
            Присоединяйтесь к публичным комнатам или создайте свою.
          </p>
        </a>

        <a
          href="/login"
          className="group rounded-xl border-2 border-blue-500/20 bg-card/95 backdrop-blur-md px-6 py-6 transition-all duration-300 hover:border-blue-500 hover:bg-blue-500/5 hover:shadow-xl hover:scale-105 cursor-pointer"
        >
          <h2 className="mb-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
            🔐 Войти{' '}
            <span className="inline-block transition-transform group-hover:translate-x-2 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-muted-foreground">
            Войдите в свой аккаунт для доступа ко всем функциям.
          </p>
        </a>

        <a
          href="/register"
          className="group rounded-xl border-2 border-green-500/20 bg-card/95 backdrop-blur-md px-6 py-6 transition-all duration-300 hover:border-green-500 hover:bg-green-500/5 hover:shadow-xl hover:scale-105 cursor-pointer"
        >
          <h2 className="mb-3 text-2xl font-bold text-green-600 dark:text-green-400">
            ✨ Регистрация{' '}
            <span className="inline-block transition-transform group-hover:translate-x-2 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-muted-foreground">
            Создайте новый аккаунт и начните слушать музыку вместе.
          </p>
        </a>

        <a
          href="/rooms"
          className="group rounded-xl border-2 border-purple-500/20 bg-card/95 backdrop-blur-md px-6 py-6 transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/5 hover:shadow-xl hover:scale-105 cursor-pointer"
        >
          <h2 className="mb-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
            🎵 Все комнаты{' '}
            <span className="inline-block transition-transform group-hover:translate-x-2 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-muted-foreground">
            Просмотрите все доступные музыкальные комнаты.
          </p>
        </a>

        <a
          href="/rooms/create"
          className="group rounded-xl border-2 border-orange-500/20 bg-card/95 backdrop-blur-md px-6 py-6 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500/5 hover:shadow-xl hover:scale-105 cursor-pointer"
        >
          <h2 className="mb-3 text-2xl font-bold text-orange-600 dark:text-orange-400">
            ➕ Создать комнату{' '}
            <span className="inline-block transition-transform group-hover:translate-x-2 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-muted-foreground">
            Создайте свою музыкальную комнату прямо сейчас.
          </p>
        </a>
      </div>
    </main>
  )
}

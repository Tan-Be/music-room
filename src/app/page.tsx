'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoomCard } from '@/components/room/room-card'
import { Icons } from '@/components/icons'
import Link from 'next/link'

// Предопределенные позиции и размеры для музыкальных нот
const notePositions = [
  { left: 10, top: 20, size: 24, delay: 0 },
  { left: 25, top: 60, size: 18, delay: 1 },
  { left: 40, top: 30, size: 20, delay: 2 },
  { left: 55, top: 70, size: 22, delay: 3 },
  { left: 70, top: 40, size: 16, delay: 4 },
  { left: 85, top: 80, size: 24, delay: 5 },
  { left: 15, top: 50, size: 20, delay: 0.5 },
  { left: 30, top: 25, size: 18, delay: 1.5 },
  { left: 45, top: 65, size: 22, delay: 2.5 },
  { left: 60, top: 35, size: 16, delay: 3.5 },
  { left: 75, top: 75, size: 24, delay: 4.5 },
  { left: 90, top: 45, size: 20, delay: 5.5 },
  { left: 5, top: 15, size: 18, delay: 1 },
  { left: 20, top: 55, size: 22, delay: 2 },
  { left: 35, top: 25, size: 16, delay: 3 },
  { left: 50, top: 65, size: 24, delay: 4 },
  { left: 65, top: 35, size: 20, delay: 5 },
  { left: 80, top: 75, size: 18, delay: 0 },
  { left: 95, top: 45, size: 22, delay: 1 },
  { left: 10, top: 85, size: 16, delay: 2 },
]

// Musical Notes Component
function MusicalNotes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      {/* Purple musical notes on black background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Animated musical notes */}
      {notePositions.map((pos, i) => (
        <div
          key={i}
          className="absolute text-purple-500 opacity-20"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            fontSize: `${pos.size}px`,
            animation: `float ${10 + (i % 5)}s infinite ease-in-out`,
            animationDelay: `${pos.delay}s`,
          }}
        >
          <Icons.music className="h-full w-full" />
        </div>
      ))}
      
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

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
      (room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredRooms(filtered)
  }, [searchQuery])

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 relative">
      {/* Musical Notes Background */}
      <MusicalNotes />
      
      <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Добро пожаловать в&nbsp;
          <code className="font-mono font-bold">Music Room</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              Music Room
            </span>
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-purple-400 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-purple-500 after:via-purple-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-purple-700 before:dark:opacity-10 after:dark:from-purple-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          <span className="block text-purple-600 dark:text-purple-400">
            Music Room
          </span>
          <span className="block text-2xl md:text-3xl mt-4 text-gray-600 dark:text-gray-300">
            Совместное прослушивание музыки
          </span>
        </h1>
      </div>

      {/* Статистика пользователя */}
      {user && profile && (
        <div className="w-full max-w-4xl mb-8">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Добро пожаловать, {profile.username}!</h2>
                <p className="text-muted-foreground">
                  Здесь отображается ваша статистика и активность
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.tracks_added_today}</p>
                  <p className="text-sm text-muted-foreground">Треков сегодня</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Комнат создано</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Участие в комнатах</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Поиск по комнатам */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Популярные комнаты</h2>
            <p className="text-muted-foreground">
              Присоединяйтесь к публичным комнатам или создайте свою
            </p>
          </div>
          {user && (
            <Button asChild className="mt-4 md:mt-0">
              <Link href="/rooms/create">
                <Icons.music className="mr-2 h-4 w-4" />
                Создать комнату
              </Link>
            </Button>
          )}
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
            {user && (
              <Button asChild>
                <Link href="/rooms/create">Создать комнату</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="/rooms"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Комнаты{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Присоединяйтесь к публичным комнатам или создайте свою.
          </p>
        </a>

        <a
          href="/auth"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Войти{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Создайте аккаунт или войдите для доступа ко всем функциям.
          </p>
        </a>

        <a
          href="/profile"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Профиль{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Управляйте своим профилем и настройками.
          </p>
        </a>

        <a
          href="/docs"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Документация{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Техническая документация и руководства.
          </p>
        </a>
      </div>
    </main>
  )
}
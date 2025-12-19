'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import {
  History,
  Music,
  TrendingUp,
  Clock,
  Users,
  Calendar,
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface RoomHistory {
  id: string
  room_id: string
  joined_at: string
  room: {
    name: string
    description: string
    is_public: boolean
  }
}

interface TrackHistory {
  id: string
  track_id: string
  added_at: string
  track: {
    title: string
    artist: string
    duration: number
  }
  room: {
    name: string
  }
}

interface Analytics {
  totalRooms: number
  totalTracks: number
  totalTime: number
  favoriteGenre: string
  mostActiveDay: string
  averageTracksPerDay: number
}

export default function HistoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  const [roomHistory, setRoomHistory] = useState<RoomHistory[]>([])
  const [trackHistory, setTrackHistory] = useState<TrackHistory[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRooms: 0,
    totalTracks: 0,
    totalTime: 0,
    favoriteGenre: 'Не определен',
    mostActiveDay: 'Не определен',
    averageTracksPerDay: 0,
  })

  const loadHistory = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Загружаем историю комнат
      const { data: rooms, error: roomsError } = await supabase
        .from('room_participants')
        .select(
          `
          id,
          room_id,
          joined_at,
          room:rooms (
            name,
            description,
            is_public
          )
        `
        )
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(20)

      if (roomsError) throw roomsError
      setRoomHistory(rooms || [])

      // Загружаем историю треков
      const { data: tracks, error: tracksError } = await supabase
        .from('room_queue')
        .select(
          `
          id,
          track_id,
          added_at,
          track:tracks (
            title,
            artist,
            duration
          ),
          room:rooms (
            name
          )
        `
        )
        .eq('added_by', user.id)
        .order('added_at', { ascending: false })
        .limit(50)

      if (tracksError) throw tracksError
      setTrackHistory(tracks || [])

      // Вычисляем аналитику
      calculateAnalytics(rooms || [], tracks || [])
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    loadHistory()
  }, [user, router, loadHistory])

  const calculateAnalytics = (rooms: any[], tracks: any[]) => {
    // Общее количество
    const totalRooms = rooms.length
    const totalTracks = tracks.length

    // Общее время прослушивания (в минутах)
    const totalTime =
      tracks.reduce((sum, t) => sum + (t.track?.duration || 0), 0) / 60

    // Самый активный день недели
    const dayCount: { [key: string]: number } = {}
    tracks.forEach(t => {
      const day = format(new Date(t.added_at), 'EEEE', { locale: ru })
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    const mostActiveDay =
      Object.keys(dayCount).length > 0
        ? Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0][0]
        : 'Не определен'

    // Среднее количество треков в день
    const daysActive = new Set(
      tracks.map(t => format(new Date(t.added_at), 'yyyy-MM-dd'))
    ).size
    const averageTracksPerDay = daysActive > 0 ? totalTracks / daysActive : 0

    setAnalytics({
      totalRooms,
      totalTracks,
      totalTime: Math.round(totalTime),
      favoriteGenre: 'Разное', // Можно расширить если добавить жанры
      mostActiveDay,
      averageTracksPerDay: Math.round(averageTracksPerDay * 10) / 10,
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: ru })
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <History className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">История активности</h1>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Аналитика
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <Users className="h-4 w-4 mr-2" />
            Комнаты
          </TabsTrigger>
          <TabsTrigger value="tracks">
            <Music className="h-4 w-4 mr-2" />
            Треки
          </TabsTrigger>
        </TabsList>

        {/* Вкладка: Аналитика */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-purple-500" />
                <Badge variant="secondary">{analytics.totalRooms}</Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Посещено комнат
              </h3>
              <p className="text-2xl font-bold mt-2">{analytics.totalRooms}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Music className="h-8 w-8 text-blue-500" />
                <Badge variant="secondary">{analytics.totalTracks}</Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Добавлено треков
              </h3>
              <p className="text-2xl font-bold mt-2">{analytics.totalTracks}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-green-500" />
                <Badge variant="secondary">{analytics.totalTime} мин</Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Время прослушивания
              </h3>
              <p className="text-2xl font-bold mt-2">
                {Math.floor(analytics.totalTime / 60)}ч{' '}
                {analytics.totalTime % 60}м
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Самый активный день
              </h3>
              <p className="text-xl font-bold mt-2">
                {analytics.mostActiveDay}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Треков в день (среднее)
              </h3>
              <p className="text-2xl font-bold mt-2">
                {analytics.averageTracksPerDay}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Music className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Любимый жанр
              </h3>
              <p className="text-xl font-bold mt-2">
                {analytics.favoriteGenre}
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка: Комнаты */}
        <TabsContent value="rooms" className="space-y-4">
          {roomHistory.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет истории комнат</h3>
              <p className="text-muted-foreground mb-4">
                Вы еще не посещали комнаты
              </p>
              <Button onClick={() => router.push('/rooms')}>
                Найти комнаты
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {roomHistory.map(item => (
                <Card
                  key={item.id}
                  className="p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{item.room.name}</h3>
                        <Badge
                          variant={
                            item.room.is_public ? 'default' : 'secondary'
                          }
                        >
                          {item.room.is_public ? 'Публичная' : 'Приватная'}
                        </Badge>
                      </div>
                      {item.room.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.room.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.joined_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/room/${item.room_id}`)}
                    >
                      Открыть
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Вкладка: Треки */}
        <TabsContent value="tracks" className="space-y-4">
          {trackHistory.length === 0 ? (
            <Card className="p-12 text-center">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет истории треков</h3>
              <p className="text-muted-foreground mb-4">
                Вы еще не добавляли треки
              </p>
              <Button onClick={() => router.push('/rooms')}>
                Добавить треки
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {trackHistory.map(item => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {item.track.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.track.artist}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(item.track.duration)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {item.room.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.added_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Music, Plus } from 'lucide-react'
import { mockTracks } from '@/lib/mock-tracks'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDebounce } from '@/hooks/use-debounce'
import { useAuth } from '@/contexts/auth-context'
import { checkTrackLimit, getTrackLimitMessage } from '@/lib/track-limits'
import { toast } from 'sonner'

interface TrackSearchProps {
  onAddToQueue?: (trackId: string) => void
  className?: string
}

export function TrackSearch({ onAddToQueue, className }: TrackSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [remainingTracks, setRemainingTracks] = useState<number | null>(null)
  const { user } = useAuth()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const itemsPerPage = 10

  // Check track limit when component mounts
  useEffect(() => {
    const fetchTrackLimit = async () => {
      if (user?.id) {
        const { remainingTracks } = await checkTrackLimit(user.id)
        setRemainingTracks(remainingTracks)
      }
    }

    fetchTrackLimit()
  }, [user?.id])

  // Фильтрация треков по поисковому запросу
  const filteredTracks = useMemo(() => {
    if (!debouncedSearchQuery) {
      return mockTracks
    }

    const query = debouncedSearchQuery.toLowerCase()
    return mockTracks.filter(
      track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        (track.genre && track.genre.toLowerCase().includes(query))
    )
  }, [debouncedSearchQuery])

  // Пагинация
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage)
  const paginatedTracks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTracks.slice(startIndex, endIndex)
  }, [filteredTracks, currentPage])

  // Сброс текущей страницы при изменении поискового запроса
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  const handleAddToQueue = async (trackId: string) => {
    // Check track limit before adding
    if (user?.id) {
      const { hasLimitReached, remainingTracks: newRemainingTracks } =
        await checkTrackLimit(user.id)

      if (hasLimitReached) {
        toast.error('Вы достигли лимита треков на сегодня')
        return
      }

      setRemainingTracks(newRemainingTracks)
    }

    if (onAddToQueue) {
      onAddToQueue(trackId)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Track limit info */}
        {remainingTracks !== null && (
          <div className="mb-4 p-3 bg-secondary rounded-md text-sm">
            {getTrackLimitMessage(remainingTracks)}
          </div>
        )}

        {/* Поле поиска */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск треков по названию, исполнителю или жанру..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Результаты поиска */}
        {paginatedTracks.length > 0 ? (
          <div className="space-y-2">
            <ScrollArea className="h-[400px] pr-4">
              {paginatedTracks.map(track => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={track.thumbnail_url}
                        alt={track.title}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Music className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{track.title}</h3>
                      <p className="text-muted-foreground text-xs">
                        {track.artist}
                      </p>
                      {track.genre && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded mt-1 inline-block">
                          {track.genre}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(track.duration / 60)}:
                      {(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAddToQueue(track.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Назад
                </Button>

                <span className="text-sm text-muted-foreground">
                  Страница {currentPage} из {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Вперед
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4" />
            <p>Треки не найдены</p>
            <p className="text-sm mt-1">Попробуйте изменить поисковый запрос</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

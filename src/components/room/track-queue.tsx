'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { TrackItem } from '@/components/room/track-item'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Track {
  id: string
  title: string
  artist: string
  duration: number
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

interface TrackQueueProps {
  tracks: Track[]
  roomId: string
  currentUserId: string
  currentUserRole: 'owner' | 'moderator' | 'member'
  onReorder?: (newOrder: Track[]) => void
  onDelete?: (trackId: string) => void
  onPlay?: (trackId: string) => void
  onVoteUp?: (trackId: string) => void
  onVoteDown?: (trackId: string) => void
  onVoteChange?: () => void
  className?: string
}

export function TrackQueue({
  tracks,
  roomId,
  currentUserId,
  currentUserRole,
  onReorder,
  onDelete,
  onPlay,
  onVoteUp,
  onVoteDown,
  onVoteChange,
  className,
}: TrackQueueProps) {
  const [queueTracks, setQueueTracks] = useState<Track[]>(tracks)
  const [draggedItem, setDraggedItem] = useState<Track | null>(null)

  useEffect(() => {
    setQueueTracks(tracks)
  }, [tracks])

  const handleDragStart = (e: React.DragEvent, track: Track) => {
    // Только модераторы и владельцы могут перетаскивать треки
    if (currentUserRole !== 'owner' && currentUserRole !== 'moderator') {
      e.preventDefault()
      return
    }
    
    setDraggedItem(track)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetTrack: Track) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetTrack.id) {
      return
    }

    // Только модераторы и владельцы могут перетаскивать треки
    if (currentUserRole !== 'owner' && currentUserRole !== 'moderator') {
      toast.error('Только модераторы могут изменять порядок треков')
      return
    }

    const newTracks = [...queueTracks]
    const draggedIndex = newTracks.findIndex(t => t.id === draggedItem.id)
    const targetIndex = newTracks.findIndex(t => t.id === targetTrack.id)
    
    // Удаляем перетаскиваемый элемент
    newTracks.splice(draggedIndex, 1)
    // Вставляем его на новую позицию
    newTracks.splice(targetIndex, 0, draggedItem)
    
    // Обновляем позиции
    const updatedTracks = newTracks.map((track, index) => ({
      ...track,
      position: index
    }))
    
    setQueueTracks(updatedTracks)
    
    if (onReorder) {
      onReorder(updatedTracks)
    }
    
    setDraggedItem(null)
  }

  const handleDelete = (trackId: string) => {
    // Проверяем права на удаление
    const track = queueTracks.find(t => t.id === trackId)
    if (!track) return
    
    // Владелец может удалить любой трек
    // Модератор может удалить треки участников
    // Участник может удалить только свои треки
    const canDelete = 
      currentUserRole === 'owner' ||
      (currentUserRole === 'moderator' && track.addedBy.id !== currentUserId) ||
      track.addedBy.id === currentUserId
    
    if (!canDelete) {
      toast.error('У вас нет прав для удаления этого трека')
      return
    }
    
    if (onDelete) {
      onDelete(trackId)
    }
  }

  const handleVoteUp = (trackId: string) => {
    if (onVoteUp) {
      onVoteUp(trackId)
    }
  }

  const handleVoteDown = (trackId: string) => {
    if (onVoteDown) {
      onVoteDown(trackId)
    }
  }

  const handlePlay = (trackId: string) => {
    if (onPlay) {
      onPlay(trackId)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {queueTracks.length > 0 ? (
        <AnimatePresence>
          {queueTracks.map((track, index) => (
            <motion.div
              key={track.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              draggable={currentUserRole === 'owner' || currentUserRole === 'moderator'}
              onDragStart={(e) => handleDragStart(e, track)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, track)}
              className={cn(
                'relative group',
                (currentUserRole === 'owner' || currentUserRole === 'moderator') && 'cursor-move'
              )}
            >
              {/* Drag handle for moderators */}
              {(currentUserRole === 'owner' || currentUserRole === 'moderator') && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              <TrackItem
                track={track}
                roomId={roomId}
                onVoteUp={() => handleVoteUp(track.id)}
                onVoteDown={() => handleVoteDown(track.id)}
                onPlay={() => handlePlay(track.id)}
                onVoteChange={onVoteChange}
                className={cn(
                  track.isPlaying && 'border-primary',
                  (currentUserRole === 'owner' || currentUserRole === 'moderator') && 'pl-6'
                )}
              />
              
              {/* Delete button for owners/moderators or track owners */}
              {(
                currentUserRole === 'owner' || 
                currentUserRole === 'moderator' || 
                track.addedBy.id === currentUserId
              ) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(track.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Очередь пуста</p>
        </div>
      )}
    </div>
  )
}
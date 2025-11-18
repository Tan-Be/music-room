'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TrackSearch } from '@/components/track/track-search'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { checkTrackLimit, incrementTrackCount } from '@/lib/track-limits'
import { useAuth } from '@/contexts/auth-context'

interface TrackSearchDialogProps {
  roomId: string
  userId: string
  onTrackAdded?: (trackId: string) => void
  children?: React.ReactNode
}

export function TrackSearchDialog({
  roomId,
  userId,
  onTrackAdded,
  children,
}: TrackSearchDialogProps) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  const handleAddToQueue = async (trackId: string) => {
    try {
      // Check if user has reached their daily track limit
      if (user?.id) {
        const { hasLimitReached, remainingTracks } = await checkTrackLimit(
          user.id
        )

        if (hasLimitReached) {
          toast.error('Вы достигли лимита треков на сегодня')
          return
        }
      }

      // Here would be the logic to add the track to the queue
      // For now, just show a notification
      toast.success('Трек добавлен в очередь')

      // Increment the user's track count for the day
      if (user?.id) {
        await incrementTrackCount(user.id)
      }

      if (onTrackAdded) {
        onTrackAdded(trackId)
      }

      // Close the dialog after adding
      setOpen(false)
    } catch (error) {
      console.error('Error adding track to queue:', error)
      toast.error('Не удалось добавить трек в очередь')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onOpen={() => setOpen(true)}>
        {children || (
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Поиск треков
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Поиск треков</DialogTitle>
        </DialogHeader>
        <TrackSearch onAddToQueue={handleAddToQueue} />
      </DialogContent>
    </Dialog>
  )
}

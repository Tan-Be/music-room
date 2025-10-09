'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThumbsUp, ThumbsDown, Play, Pause, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  }
  isPlaying?: boolean
}

interface TrackItemProps {
  track: Track
  onVoteUp?: () => void
  onVoteDown?: () => void
  onPlay?: () => void
  className?: string
}

export function TrackItem({
  track,
  onVoteUp,
  onVoteDown,
  onPlay,
  className,
}: TrackItemProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const voteScore = track.votesUp - track.votesDown

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Thumbnail or placeholder */}
          <div className="relative">
            {track.thumbnailUrl ? (
              <img
                src={track.thumbnailUrl}
                alt={track.title}
                className="w-16 h-16 rounded-md object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <div className="text-white font-bold text-lg">
                  {track.title.charAt(0)}
                </div>
              </div>
            )}
            {track.isPlaying && (
              <div className="absolute inset-0 bg-black/30 rounded-md flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {track.artist}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs">
                  {track.addedBy.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {track.addedBy.name}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDuration(track.duration)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onVoteUp}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <span
                className={cn(
                  'text-xs font-medium',
                  voteScore > 0
                    ? 'text-green-500'
                    : voteScore < 0
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                )}
              >
                {voteScore > 0 ? `+${voteScore}` : voteScore}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onVoteDown}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onPlay}
            >
              {track.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

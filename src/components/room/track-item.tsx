'use client'

import { useState, useEffect, memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThumbsUp, ThumbsDown, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { getUserVote, voteForTrack, VoteValue, reorderTracksByVotes } from '@/lib/track-voting'
import { toast } from 'sonner'

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
  roomId: string
  onVoteUp?: () => void
  onVoteDown?: () => void
  onPlay?: () => void
  onVoteChange?: () => void
  className?: string
}

// Функция для проверки равенства пропсов
function arePropsEqual(prevProps: TrackItemProps, nextProps: TrackItemProps) {
  return (
    prevProps.track.id === nextProps.track.id &&
    prevProps.track.title === nextProps.track.title &&
    prevProps.track.artist === nextProps.track.artist &&
    prevProps.track.duration === nextProps.track.duration &&
    prevProps.track.thumbnailUrl === nextProps.track.thumbnailUrl &&
    prevProps.track.votesUp === nextProps.track.votesUp &&
    prevProps.track.votesDown === nextProps.track.votesDown &&
    prevProps.track.isPlaying === nextProps.track.isPlaying &&
    prevProps.roomId === nextProps.roomId &&
    prevProps.className === nextProps.className
  )
}

export const TrackItem = memo(({
  track,
  roomId,
  onVoteUp,
  onVoteDown,
  onPlay,
  onVoteChange,
  className,
}: TrackItemProps) => {
  const { user } = useAuth()
  const [userVote, setUserVote] = useState<VoteValue | null>(null)
  const [votesUp, setVotesUp] = useState(track.votesUp)
  const [votesDown, setVotesDown] = useState(track.votesDown)
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const voteScore = votesUp - votesDown

  // Fetch user's current vote when component mounts or when user/track changes
  useEffect(() => {
    const fetchUserVote = async () => {
      if (user?.id && roomId) {
        const vote = await getUserVote(user.id, roomId, track.id)
        setUserVote(vote)
      }
    }

    fetchUserVote()
  }, [user?.id, roomId, track.id])

  const handleVote = async (voteValue: VoteValue) => {
    if (!user?.id || !roomId) {
      toast.error('Необходимо войти в систему для голосования')
      return
    }

    // If user is clicking the same vote they already have, toggle it off
    const newVoteValue = userVote === voteValue ? null : voteValue
    
    const success = await voteForTrack(user.id, roomId, track.id, voteValue)
    
    if (success) {
      // Update local state
      setUserVote(newVoteValue)
      
      // Update vote counts
      if (voteValue === 1) {
        if (userVote === 1) {
          // Removing upvote
          setVotesUp(votesUp - 1)
        } else if (userVote === -1) {
          // Changing from downvote to upvote
          setVotesDown(votesDown - 1)
          setVotesUp(votesUp + 1)
        } else {
          // Adding new upvote
          setVotesUp(votesUp + 1)
        }
      } else {
        if (userVote === -1) {
          // Removing downvote
          setVotesDown(votesDown - 1)
        } else if (userVote === 1) {
          // Changing from upvote to downvote
          setVotesUp(votesUp - 1)
          setVotesDown(votesDown + 1)
        } else {
          // Adding new downvote
          setVotesDown(votesDown + 1)
        }
      }
      
      // Reorder tracks based on vote scores
      await reorderTracksByVotes(roomId)
      
      // Call parent handlers if provided
      if (voteValue === 1 && onVoteUp) {
        onVoteUp()
      } else if (voteValue === -1 && onVoteDown) {
        onVoteDown()
      }
      
      // Notify parent that votes have changed
      if (onVoteChange) {
        onVoteChange()
      }
    }
  }

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
                className={cn("h-8 w-8", userVote === 1 && "text-green-500")}
                onClick={() => handleVote(1)}
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
                className={cn("h-8 w-8", userVote === -1 && "text-red-500")}
                onClick={() => handleVote(-1)}
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}, arePropsEqual)
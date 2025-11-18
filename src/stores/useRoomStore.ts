import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Room {
  id: string
  name: string
  description?: string
  privacy: 'public' | 'unlisted' | 'private'
  participantCount: number
  maxParticipants: number
  owner: {
    id: string
    name: string
  }
  isPlaying: boolean
  currentTrack?: Track
  progress: number
  createdAt: Date
}

interface Track {
  id: string
  title: string
  artist: string
  duration: number
  thumbnailUrl?: string
  votesUp: number
  votesDown: number
  addedBy: {
    id: string
    name: string
    avatar?: string
  }
  position: number
}

interface Participant {
  id: string
  userId: string
  name: string
  avatar?: string
  role: 'owner' | 'moderator' | 'member'
  isOnline: boolean
}

interface RoomState {
  currentRoom: Room | null
  queue: Track[]
  participants: Participant[]
  isParticipant: boolean
  setCurrentRoom: (room: Room | null) => void
  setQueue: (queue: Track[]) => void
  setParticipants: (participants: Participant[]) => void
  setIsParticipant: (isParticipant: boolean) => void
  addTrack: (track: Track) => void
  removeTrack: (trackId: string) => void
  updateTrackVotes: (
    trackId: string,
    votesUp: number,
    votesDown: number
  ) => void
  addParticipant: (participant: Participant) => void
  removeParticipant: (participantId: string) => void
  updateParticipant: (
    participantId: string,
    updates: Partial<Participant>
  ) => void
  clearRoom: () => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      currentRoom: null,
      queue: [],
      participants: [],
      isParticipant: false,
      setCurrentRoom: currentRoom => set({ currentRoom }),
      setQueue: queue => set({ queue }),
      setParticipants: participants => set({ participants }),
      setIsParticipant: isParticipant => set({ isParticipant }),
      addTrack: track => set(state => ({ queue: [...state.queue, track] })),
      removeTrack: trackId =>
        set(state => ({
          queue: state.queue.filter(track => track.id !== trackId),
        })),
      updateTrackVotes: (trackId, votesUp, votesDown) =>
        set(state => ({
          queue: state.queue.map(track =>
            track.id === trackId ? { ...track, votesUp, votesDown } : track
          ),
        })),
      addParticipant: participant =>
        set(state => ({
          participants: [...state.participants, participant],
        })),
      removeParticipant: participantId =>
        set(state => ({
          participants: state.participants.filter(p => p.id !== participantId),
        })),
      updateParticipant: (participantId, updates) =>
        set(state => ({
          participants: state.participants.map(participant =>
            participant.id === participantId
              ? { ...participant, ...updates }
              : participant
          ),
        })),
      clearRoom: () =>
        set({
          currentRoom: null,
          queue: [],
          participants: [],
          isParticipant: false,
        }),
    }),
    {
      name: 'room-storage',
    }
  )
)

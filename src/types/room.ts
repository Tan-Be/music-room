export interface User {
  id: string
  name: string
  avatar?: string
  isHost?: boolean
}

export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number // в миллисекундах
  imageUrl?: string
  addedBy: User
  addedAt: Date
  source: 'spotify' | 'youtube' | 'uploaded'
  url: string
}

export interface ChatMessage {
  id: string
  user: User
  content: string
  timestamp: Date
}

export interface Vote {
  userId: string
  trackId: string
  value: number // 1 для голоса "за", -1 для голоса "против"
}

export type RoomPrivacy = 'public' | 'unlisted' | 'private'

export interface Room {
  id: string
  name: string
  description?: string
  privacy: RoomPrivacy
  host: User
  participants: User[]
  tracks: Track[]
  currentTrack?: Track
  currentTime?: number // в миллисекундах
  isPlaying: boolean
  createdAt: Date
  password?: string // только для приватных комнат
  maxParticipants?: number
  votes: Vote[]
  chatMessages: ChatMessage[]
}

export interface CreateRoomData {
  name: string
  description?: string
  privacy: RoomPrivacy
  password?: string
  maxParticipants?: number
}
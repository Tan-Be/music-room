import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  volume: number
  isMuted: boolean
  playbackRate: number
  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTime: (currentTime: number) => void
  setVolume: (volume: number) => void
  setIsMuted: (isMuted: boolean) => void
  setPlaybackRate: (playbackRate: number) => void
  togglePlay: () => void
  toggleMute: () => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentTime: 0,
      volume: 100,
      isMuted: false,
      playbackRate: 1.0,
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setVolume: (volume) => set({ volume }),
      setIsMuted: (isMuted) => set({ isMuted }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    {
      name: 'player-storage',
    }
  )
)
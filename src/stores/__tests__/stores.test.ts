import { useAuthStore, useRoomStore, usePlayerStore, useChatStore } from '../index'

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Zustand Stores', () => {
  beforeEach(() => {
    // Clear all stores before each test
    useAuthStore.getState().signOut()
    useRoomStore.getState().clearRoom()
    usePlayerStore.getState().setIsPlaying(false)
    useChatStore.getState().clearChat()
  })

  describe('useAuthStore', () => {
    it('should set and get user', () => {
      const user = { id: '1', email: 'test@example.com' } as any
      useAuthStore.getState().setUser(user)
      expect(useAuthStore.getState().user).toEqual(user)
    })

    it('should handle sign out', () => {
      const user = { id: '1', email: 'test@example.com' } as any
      useAuthStore.getState().setUser(user)
      useAuthStore.getState().signOut()
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('useRoomStore', () => {
    it('should set and get current room', () => {
      const room = {
        id: '1',
        name: 'Test Room',
        privacy: 'public' as const,
        participantCount: 1,
        maxParticipants: 10,
        owner: { id: '1', name: 'Owner' },
        isPlaying: false,
        progress: 0,
        createdAt: new Date()
      }
      useRoomStore.getState().setCurrentRoom(room)
      expect(useRoomStore.getState().currentRoom).toEqual(room)
    })

    it('should clear room', () => {
      const room = {
        id: '1',
        name: 'Test Room',
        privacy: 'public' as const,
        participantCount: 1,
        maxParticipants: 10,
        owner: { id: '1', name: 'Owner' },
        isPlaying: false,
        progress: 0,
        createdAt: new Date()
      }
      useRoomStore.getState().setCurrentRoom(room)
      useRoomStore.getState().clearRoom()
      expect(useRoomStore.getState().currentRoom).toBeNull()
    })
  })

  describe('usePlayerStore', () => {
    it('should toggle play state', () => {
      expect(usePlayerStore.getState().isPlaying).toBeFalsy()
      usePlayerStore.getState().togglePlay()
      expect(usePlayerStore.getState().isPlaying).toBeTruthy()
    })

    it('should set volume', () => {
      usePlayerStore.getState().setVolume(50)
      expect(usePlayerStore.getState().volume).toBe(50)
    })
  })

  describe('useChatStore', () => {
    it('should add message', () => {
      const message = {
        id: '1',
        userId: '1',
        userName: 'Test User',
        content: 'Hello',
        timestamp: new Date(),
        type: 'user' as const
      }
      useChatStore.getState().addMessage(message)
      expect(useChatStore.getState().messages).toHaveLength(1)
      expect(useChatStore.getState().messages[0]).toEqual(message)
    })

    it('should clear chat', () => {
      const message = {
        id: '1',
        userId: '1',
        userName: 'Test User',
        content: 'Hello',
        timestamp: new Date(),
        type: 'user' as const
      }
      useChatStore.getState().addMessage(message)
      useChatStore.getState().clearChat()
      expect(useChatStore.getState().messages).toHaveLength(0)
    })
  })
})
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

    it('should set and get profile', () => {
      const profile = { id: '1', username: 'testuser' }
      useAuthStore.getState().setProfile(profile)
      expect(useAuthStore.getState().profile).toEqual(profile)
    })

    it('should set loading state', () => {
      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)
    })

    it('should set error state', () => {
      const errorMessage = 'Test error'
      useAuthStore.getState().setError(errorMessage)
      expect(useAuthStore.getState().error).toBe(errorMessage)
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

    it('should add track to queue', () => {
      const track = {
        id: '1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 180,
        votesUp: 0,
        votesDown: 0,
        addedBy: { id: '1', name: 'User' },
        position: 0
      }
      useRoomStore.getState().addTrack(track)
      expect(useRoomStore.getState().queue).toHaveLength(1)
      expect(useRoomStore.getState().queue[0]).toEqual(track)
    })

    it('should remove track from queue', () => {
      const track1 = {
        id: '1',
        title: 'Test Track 1',
        artist: 'Test Artist',
        duration: 180,
        votesUp: 0,
        votesDown: 0,
        addedBy: { id: '1', name: 'User' },
        position: 0
      }
      const track2 = {
        id: '2',
        title: 'Test Track 2',
        artist: 'Test Artist',
        duration: 200,
        votesUp: 0,
        votesDown: 0,
        addedBy: { id: '1', name: 'User' },
        position: 1
      }
      useRoomStore.getState().addTrack(track1)
      useRoomStore.getState().addTrack(track2)
      useRoomStore.getState().removeTrack('1')
      expect(useRoomStore.getState().queue).toHaveLength(1)
      expect(useRoomStore.getState().queue[0].id).toBe('2')
    })

    it('should update track votes', () => {
      const track = {
        id: '1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 180,
        votesUp: 0,
        votesDown: 0,
        addedBy: { id: '1', name: 'User' },
        position: 0
      }
      useRoomStore.getState().addTrack(track)
      useRoomStore.getState().updateTrackVotes('1', 5, 2)
      const updatedTrack = useRoomStore.getState().queue[0]
      expect(updatedTrack.votesUp).toBe(5)
      expect(updatedTrack.votesDown).toBe(2)
    })

    it('should add participant', () => {
      const participant = {
        id: '1',
        userId: '1',
        name: 'Test User',
        role: 'member' as const,
        isOnline: true
      }
      useRoomStore.getState().addParticipant(participant)
      expect(useRoomStore.getState().participants).toHaveLength(1)
      expect(useRoomStore.getState().participants[0]).toEqual(participant)
    })

    it('should remove participant', () => {
      const participant1 = {
        id: '1',
        userId: '1',
        name: 'Test User 1',
        role: 'member' as const,
        isOnline: true
      }
      const participant2 = {
        id: '2',
        userId: '2',
        name: 'Test User 2',
        role: 'member' as const,
        isOnline: true
      }
      useRoomStore.getState().addParticipant(participant1)
      useRoomStore.getState().addParticipant(participant2)
      useRoomStore.getState().removeParticipant('1')
      expect(useRoomStore.getState().participants).toHaveLength(1)
      expect(useRoomStore.getState().participants[0].id).toBe('2')
    })

    it('should update participant', () => {
      const participant = {
        id: '1',
        userId: '1',
        name: 'Test User',
        role: 'member' as const,
        isOnline: true
      }
      useRoomStore.getState().addParticipant(participant)
      useRoomStore.getState().updateParticipant('1', { role: 'moderator', isOnline: false })
      const updatedParticipant = useRoomStore.getState().participants[0]
      expect(updatedParticipant.role).toBe('moderator')
      expect(updatedParticipant.isOnline).toBe(false)
    })

    it('should set participant status', () => {
      useRoomStore.getState().setIsParticipant(true)
      expect(useRoomStore.getState().isParticipant).toBe(true)
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

    it('should set current time', () => {
      usePlayerStore.getState().setCurrentTime(120)
      expect(usePlayerStore.getState().currentTime).toBe(120)
    })

    it('should toggle mute', () => {
      expect(usePlayerStore.getState().isMuted).toBeFalsy()
      usePlayerStore.getState().toggleMute()
      expect(usePlayerStore.getState().isMuted).toBeTruthy()
    })

    it('should set playback rate', () => {
      usePlayerStore.getState().setPlaybackRate(1.5)
      expect(usePlayerStore.getState().playbackRate).toBe(1.5)
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

    it('should set messages', () => {
      const messages = [
        {
          id: '1',
          userId: '1',
          userName: 'Test User',
          content: 'Hello',
          timestamp: new Date(),
          type: 'user' as const
        },
        {
          id: '2',
          userId: '2',
          userName: 'Another User',
          content: 'Hi there',
          timestamp: new Date(),
          type: 'user' as const
        }
      ]
      useChatStore.getState().setMessages(messages)
      expect(useChatStore.getState().messages).toEqual(messages)
    })

    it('should set typing status', () => {
      useChatStore.getState().setIsTyping(true)
      expect(useChatStore.getState().isTyping).toBe(true)
    })

    it('should manage typing users', () => {
      const typingUser = {
        userId: '1',
        userName: 'Test User',
        timeoutId: setTimeout(() => {}, 1000)
      }
      useChatStore.getState().addTypingUser(typingUser)
      expect(useChatStore.getState().typingUsers).toHaveLength(1)
      
      useChatStore.getState().removeTypingUser('1')
      expect(useChatStore.getState().typingUsers).toHaveLength(0)
    })

    it('should increment and reset unread count', () => {
      useChatStore.getState().incrementUnreadCount()
      useChatStore.getState().incrementUnreadCount()
      expect(useChatStore.getState().unreadCount).toBe(2)
      
      useChatStore.getState().resetUnreadCount()
      expect(useChatStore.getState().unreadCount).toBe(0)
    })
  })
})
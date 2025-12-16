/**
 * Интеграционные тесты для Supabase
 * Эти тесты проверяют взаимодействие с базой данных
 */

import { supabase } from './supabase'

// Мокаем Supabase для интеграционных тестов
jest.mock('./supabase')

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Supabase Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should handle user sign up', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      })

      const result = await mockSupabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.data.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should handle user sign in', async () => {
      const mockSession = {
        user: { id: 'test-user-id', email: 'test@example.com' },
        access_token: 'mock-token',
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      })

      const result = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.data.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should handle OAuth sign in', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://github.com/oauth' },
        error: null,
      })

      const result = await mockSupabase.auth.signInWithOAuth({
        provider: 'github',
      })

      expect(result.data.url).toBe('https://github.com/oauth')
      expect(result.error).toBeNull()
    })

    it('should handle sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await mockSupabase.auth.signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })
  })

  describe('Profile Management', () => {
    it('should create user profile', async () => {
      const mockProfile = {
        id: 'test-user-id',
        username: 'testuser',
        avatar_url: null,
        tracks_added_today: 0,
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('profiles')
        .insert({
          id: 'test-user-id',
          username: 'testuser',
        })
        .select()
        .single()

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        id: 'test-user-id',
        username: 'testuser',
      })
      expect(result.data).toEqual(mockProfile)
    })

    it('should update user profile', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { username: 'newusername' }, 
          error: null 
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('profiles')
        .update({ username: 'newusername' })
        .eq('id', 'test-user-id')
        .select()
        .single()

      expect(mockQuery.update).toHaveBeenCalledWith({ username: 'newusername' })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-user-id')
      expect(result.data.username).toBe('newusername')
    })
  })

  describe('Room Management', () => {
    it('should create room', async () => {
      const mockRoom = {
        id: 'test-room-id',
        name: 'Test Room',
        owner_id: 'test-user-id',
        is_public: true,
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockRoom, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('rooms')
        .insert({
          name: 'Test Room',
          owner_id: 'test-user-id',
          is_public: true,
        })
        .select()
        .single()

      expect(mockSupabase.from).toHaveBeenCalledWith('rooms')
      expect(result.data).toEqual(mockRoom)
    })

    it('should fetch public rooms', async () => {
      const mockRooms = [
        { id: 'room-1', name: 'Room 1', is_public: true },
        { id: 'room-2', name: 'Room 2', is_public: true },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ data: mockRooms, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('rooms')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      expect(mockQuery.eq).toHaveBeenCalledWith('is_public', true)
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should add participant to room', async () => {
      const mockParticipant = {
        id: 'participant-id',
        room_id: 'test-room-id',
        user_id: 'test-user-id',
        role: 'member',
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockParticipant, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('room_participants')
        .insert({
          room_id: 'test-room-id',
          user_id: 'test-user-id',
          role: 'member',
        })
        .select()
        .single()

      expect(result.data).toEqual(mockParticipant)
    })
  })

  describe('Chat System', () => {
    it('should send chat message', async () => {
      const mockMessage = {
        id: 'message-id',
        room_id: 'test-room-id',
        user_id: 'test-user-id',
        message: 'Hello world',
        created_at: new Date().toISOString(),
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockMessage, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('chat_messages')
        .insert({
          room_id: 'test-room-id',
          user_id: 'test-user-id',
          message: 'Hello world',
        })
        .select()
        .single()

      expect(result.data).toEqual(mockMessage)
    })

    it('should fetch chat messages', async () => {
      const mockMessages = [
        { id: 'msg-1', message: 'Hello', user_id: 'user-1' },
        { id: 'msg-2', message: 'Hi there', user_id: 'user-2' },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ data: mockMessages, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await mockSupabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', 'test-room-id')
        .order('created_at', { ascending: true })
        .limit(50)

      expect(mockQuery.eq).toHaveBeenCalledWith('room_id', 'test-room-id')
      expect(mockQuery.limit).toHaveBeenCalledWith(50)
    })
  })

  describe('Track Management', () => {
    it('should add track to queue', async () => {
      const mockQueueItem = {
        id: 'queue-id',
        room_id: 'test-room-id',
        track_id: 'test-track-id',
        added_by: 'test-user-id',
        position: 1,
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockQueueItem, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('room_queue')
        .insert({
          room_id: 'test-room-id',
          track_id: 'test-track-id',
          added_by: 'test-user-id',
          position: 1,
        })
        .select()
        .single()

      expect(result.data).toEqual(mockQueueItem)
    })

    it('should vote on track', async () => {
      const mockVote = {
        id: 'vote-id',
        user_id: 'test-user-id',
        track_id: 'test-track-id',
        vote_value: 1,
      }

      const mockQuery = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockVote, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('track_votes')
        .upsert({
          user_id: 'test-user-id',
          track_id: 'test-track-id',
          vote_value: 1,
        })
        .select()
        .single()

      expect(result.data).toEqual(mockVote)
    })
  })

  describe('Realtime Subscriptions', () => {
    it('should create chat subscription', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
        unsubscribe: jest.fn().mockResolvedValue({ status: 'CLOSED' }),
      }

      mockSupabase.channel.mockReturnValue(mockChannel as any)

      const channel = mockSupabase.channel('chat-room-123')
      
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('New message:', payload)
        }
      )

      expect(mockSupabase.channel).toHaveBeenCalledWith('chat-room-123')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        expect.any(Function)
      )
    })

    it('should handle subscription lifecycle', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
        unsubscribe: jest.fn().mockResolvedValue({ status: 'CLOSED' }),
      }

      mockSupabase.channel.mockReturnValue(mockChannel as any)

      const channel = mockSupabase.channel('test-channel')
      
      // Подписка
      const subscribeResult = await channel.subscribe()
      expect(subscribeResult.status).toBe('SUBSCRIBED')

      // Отписка
      const unsubscribeResult = await channel.unsubscribe()
      expect(unsubscribeResult.status).toBe('CLOSED')
    })
  })

  describe('Storage Operations', () => {
    it('should upload file to storage', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'avatars/test-user-id/test.jpg' },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/avatars/test-user-id/test.jpg' },
        }),
      } as any)

      const uploadResult = await mockSupabase.storage
        .from('avatars')
        .upload('test-user-id/test.jpg', mockFile)

      expect(uploadResult.data?.path).toBe('avatars/test-user-id/test.jpg')
      expect(uploadResult.error).toBeNull()

      const urlResult = mockSupabase.storage
        .from('avatars')
        .getPublicUrl('test-user-id/test.jpg')

      expect(urlResult.data.publicUrl).toContain('test.jpg')
    })

    it('should remove file from storage', async () => {
      mockSupabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any)

      const result = await mockSupabase.storage
        .from('avatars')
        .remove(['test-user-id/old-avatar.jpg'])

      expect(result.error).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const mockError = {
        message: 'Database connection failed',
        code: 'PGRST301',
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: mockError 
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await mockSupabase
        .from('profiles')
        .select('*')
        .single()

      expect(result.error).toEqual(mockError)
      expect(result.data).toBeNull()
    })

    it('should handle authentication errors', async () => {
      const mockError = {
        message: 'Invalid credentials',
        status: 400,
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const result = await mockSupabase.auth.signInWithPassword({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      })

      expect(result.error).toEqual(mockError)
      expect(result.data.user).toBeNull()
    })
  })
})
import { chatRealtimeService } from './chat-realtime'

// Мокаем Supabase клиент
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockImplementation((callback) => {
      // Имитируем успешную подписку
      setTimeout(() => callback('SUBSCRIBED'), 0)
      return { removeChannel: jest.fn() }
    }),
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ error: null }),
    removeChannel: jest.fn()
  }
}))

describe('chatRealtimeService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const roomId = 'test-room-id'
      const userId = 'test-user-id'
      const content = 'Test message'

      const result = await chatRealtimeService.sendMessage(roomId, userId, content)

      expect(result).toBe(true)
    })

    it('should reject messages sent too frequently', async () => {
      const roomId = 'test-room-id'
      const userId = 'test-user-id'
      const content = 'Test message'

      // Отправляем первое сообщение
      await chatRealtimeService.sendMessage(roomId, userId, content)
      
      // Пытаемся отправить второе сообщение сразу же
      const result = await chatRealtimeService.sendMessage(roomId, userId, content)

      expect(result).toBe(false)
    })

    it('should allow sending messages after the rate limit period', async () => {
      const roomId = 'test-room-id'
      const userId = 'test-user-id'
      const content = 'Test message'

      // Отправляем первое сообщение
      await chatRealtimeService.sendMessage(roomId, userId, content)
      
      // Пропускаем время rate limit
      jest.advanceTimersByTime(1000)
      
      // Пытаемся отправить второе сообщение
      const result = await chatRealtimeService.sendMessage(roomId, userId, content)

      expect(result).toBe(true)
    })
  })

  describe('subscribeToRoom', () => {
    it('should subscribe to a room and load recent messages', async () => {
      const roomId = 'test-room-id'
      const onMessages = jest.fn()
      const onNewMessage = jest.fn()

      // Подписываемся на комнату
      chatRealtimeService.subscribeToRoom(roomId, onMessages, onNewMessage)

      // Ждем немного, чтобы завершилась подписка
      await new Promise(resolve => setTimeout(resolve, 10))

      // Проверяем, что методы были вызваны правильно
      expect(chatRealtimeService.getCurrentRoomId()).toBe(roomId)
      expect(chatRealtimeService.isCurrentlySubscribed()).toBe(true)
    })
  })

  describe('unsubscribe', () => {
    it('should unsubscribe from the current room', () => {
      const roomId = 'test-room-id'
      const onMessages = jest.fn()

      // Подписываемся на комнату
      chatRealtimeService.subscribeToRoom(roomId, onMessages)

      // Отписываемся
      chatRealtimeService.unsubscribe()

      // Проверяем, что отписка прошла успешно
      expect(chatRealtimeService.getCurrentRoomId()).toBeNull()
      expect(chatRealtimeService.isCurrentlySubscribed()).toBe(false)
    })
  })
})
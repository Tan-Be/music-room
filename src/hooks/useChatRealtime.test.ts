import { renderHook, act } from '@testing-library/react'
import { useChatRealtime } from './useChatRealtime'

// Мокаем зависимости
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    profile: { username: 'TestUser' }
  })
}))

jest.mock('@/lib/chat-realtime', () => ({
  chatRealtimeService: {
    subscribeToRoom: jest.fn(),
    unsubscribe: jest.fn(),
    isCurrentlySubscribed: jest.fn(),
    sendMessage: jest.fn()
  }
}))

describe('useChatRealtime', () => {
  const mockSubscribeToRoom = jest.fn()
  const mockUnsubscribe = jest.fn()
  const mockIsCurrentlySubscribed = jest.fn()
  const mockSendMessage = jest.fn()

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    mockSubscribeToRoom.mockClear()
    mockUnsubscribe.mockClear()
    mockIsCurrentlySubscribed.mockClear()
    mockSendMessage.mockClear()

    // Устанавливаем моки для chatRealtimeService
    const { chatRealtimeService } = require('@/lib/chat-realtime')
    chatRealtimeService.subscribeToRoom = mockSubscribeToRoom
    chatRealtimeService.unsubscribe = mockUnsubscribe
    chatRealtimeService.isCurrentlySubscribed = mockIsCurrentlySubscribed
    chatRealtimeService.sendMessage = mockSendMessage
  })

  it('should subscribe to room when user and roomId are provided', () => {
    renderHook(() => useChatRealtime('test-room-id'))

    expect(mockSubscribeToRoom).toHaveBeenCalledWith(
      'test-room-id',
      expect.any(Function),
      expect.any(Function)
    )
  })

  it('should unsubscribe when component unmounts', () => {
    const { unmount } = renderHook(() => useChatRealtime('test-room-id'))

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should call chatRealtimeService.sendMessage when sendMessage is called', async () => {
    mockSendMessage.mockResolvedValue(true)

    const { result } = renderHook(() => useChatRealtime('test-room-id'))
    
    let success = false
    await act(async () => {
      success = await result.current.sendMessage('Test message')
    })

    expect(mockSendMessage).toHaveBeenCalledWith(
      'test-room-id',
      'test-user-id',
      'Test message'
    )
    expect(success).toBe(true)
  })

  it('should return isSubscribed status from chatRealtimeService', () => {
    mockIsCurrentlySubscribed.mockReturnValue(true)

    const { result } = renderHook(() => useChatRealtime('test-room-id'))

    expect(result.current.isSubscribed).toBe(true)
    expect(mockIsCurrentlySubscribed).toHaveBeenCalled()
  })

  it('should not subscribe if user is not available', () => {
    // Мокаем useAuth для возврата null user
    jest.mock('@/contexts/auth-context', () => ({
      useAuth: () => ({
        user: null,
        profile: null
      })
    }))

    renderHook(() => useChatRealtime('test-room-id'))

    expect(mockSubscribeToRoom).not.toHaveBeenCalled()
  })
})
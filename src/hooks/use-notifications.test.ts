import { renderHook, act } from '@testing-library/react'
import { useNotifications } from './use-notifications'

// Мок для toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    // Мок для Notification API
    Object.defineProperty(window, 'Notification', {
      value: class MockNotification {
        static permission = 'default'
        static requestPermission = jest.fn(() => Promise.resolve('granted'))
        constructor() {}
        close = jest.fn()
        onclick = jest.fn()
      },
      writable: true,
    })
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useNotifications())

    expect(result.current.permission).toBe('default')
    expect(result.current.isSupported).toBe(true)
    expect(result.current.isEnabled).toBe(true)
  })

  it('should detect notification support', () => {
    // Удаляем Notification API
    const originalNotification = (window as any).Notification
    delete (window as any).Notification

    const { result } = renderHook(() => useNotifications())
    expect(result.current.isSupported).toBe(false)

    // Восстанавливаем
    ;(window as any).Notification = originalNotification
  })

  it('should request permission successfully', async () => {
    const { result } = renderHook(() => useNotifications())

    await act(async () => {
      const permission = await result.current.requestPermission()
      expect(permission).toBe('granted')
    })

    expect(window.Notification.requestPermission).toHaveBeenCalled()
  })

  it('should handle permission denial', async () => {
    window.Notification.requestPermission = jest.fn(() =>
      Promise.resolve('denied')
    )

    const { result } = renderHook(() => useNotifications())

    await act(async () => {
      const permission = await result.current.requestPermission()
      expect(permission).toBe('denied')
    })
  })

  it('should show notification when conditions are met', async () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'granted',
      writable: true,
    })

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    })

    const mockNotification = jest.fn()
    ;(window as any).Notification = mockNotification

    const { result } = renderHook(() => useNotifications())

    await act(async () => {
      await result.current.showNotification({
        title: 'Test Notification',
        body: 'Test body',
      })
    })

    expect(mockNotification).toHaveBeenCalledWith('Test Notification', {
      body: 'Test body',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: undefined,
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
    })
  })

  it('should show toast when page is visible', async () => {
    const { toast } = require('sonner')

    Object.defineProperty(Notification, 'permission', {
      value: 'granted',
      writable: true,
    })

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
    })

    const { result } = renderHook(() => useNotifications())

    await act(async () => {
      await result.current.showNotification({
        title: 'Test Notification',
        body: 'Test body',
      })
    })

    expect(toast.info).toHaveBeenCalledWith('Test body', {
      description: 'Test Notification',
    })
  })

  it('should not show notification when disabled', async () => {
    const mockNotification = jest.fn()
    ;(window as any).Notification = mockNotification

    const { result } = renderHook(() => useNotifications())

    act(() => {
      result.current.setEnabled(false)
    })

    await act(async () => {
      await result.current.showNotification({
        title: 'Test Notification',
      })
    })

    expect(mockNotification).not.toHaveBeenCalled()
  })

  it('should save enabled state to localStorage', () => {
    const { result } = renderHook(() => useNotifications())

    act(() => {
      result.current.setEnabled(false)
    })

    const saved = localStorage.getItem('notification_settings')
    expect(saved).toBeTruthy()

    const parsed = JSON.parse(saved!)
    expect(parsed.enabled).toBe(false)
  })

  it('should load enabled state from localStorage', () => {
    localStorage.setItem(
      'notification_settings',
      JSON.stringify({ enabled: false })
    )

    const { result } = renderHook(() => useNotifications())
    expect(result.current.isEnabled).toBe(false)
  })

  it('should handle localStorage errors gracefully', () => {
    const originalGetItem = localStorage.getItem
    localStorage.getItem = jest.fn(() => {
      throw new Error('localStorage error')
    })

    const { result } = renderHook(() => useNotifications())
    expect(result.current.isEnabled).toBe(true) // default value

    localStorage.getItem = originalGetItem
  })

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('notification_settings', 'invalid json')

    const { result } = renderHook(() => useNotifications())
    expect(result.current.isEnabled).toBe(true) // default value
  })

  it('should handle notification creation errors', async () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'granted',
      writable: true,
    })

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    })

    // Мок конструктора, который выбрасывает ошибку
    ;(window as any).Notification = jest.fn(() => {
      throw new Error('Notification creation failed')
    })

    const { result } = renderHook(() => useNotifications())

    // Не должно выбрасывать ошибку
    await act(async () => {
      await expect(
        result.current.showNotification({
          title: 'Test Notification',
        })
      ).resolves.toBeUndefined()
    })
  })

  it('should auto-close notifications after 5 seconds', async () => {
    jest.useFakeTimers()

    Object.defineProperty(Notification, 'permission', {
      value: 'granted',
      writable: true,
    })

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    })

    const mockClose = jest.fn()
    const mockNotification = jest.fn(() => ({
      close: mockClose,
      onclick: null,
    }))
    ;(window as any).Notification = mockNotification

    const { result } = renderHook(() => useNotifications())

    await act(async () => {
      await result.current.showNotification({
        title: 'Test Notification',
      })
    })

    // Проверяем, что уведомление создано
    expect(mockNotification).toHaveBeenCalled()

    // Перематываем время на 5 секунд
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Проверяем, что close был вызван
    expect(mockClose).toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('should focus window on notification click', async () => {
    Object.defineProperty(Notification, 'permission', {
      value: 'granted',
      writable: true,
    })

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    })

    const mockClose = jest.fn()
    const mockFocus = jest.fn()
    Object.defineProperty(window, 'focus', {
      value: mockFocus,
      writable: true,
    })

    let notificationInstance: any
    const mockNotification = jest.fn((title, options) => {
      notificationInstance = {
        close: mockClose,
        onclick: null,
      }
      return notificationInstance
    })
    ;(window as any).Notification = mockNotification

    const { result } = renderHook(() => useNotifications())

    await act(async () => {
      await result.current.showNotification({
        title: 'Test Notification',
      })
    })

    // Симулируем клик по уведомлению
    act(() => {
      if (notificationInstance && notificationInstance.onclick) {
        notificationInstance.onclick()
      }
    })

    expect(mockFocus).toHaveBeenCalled()
    expect(mockClose).toHaveBeenCalled()
  })
})

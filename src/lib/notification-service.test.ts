import { NotificationService, notificationService } from './notification-service'

// Мок для Notification API
const mockNotification = jest.fn()
Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  writable: true,
})

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(() => {
    service = NotificationService.getInstance()
    localStorage.clear()
    jest.clearAllMocks()
    
    // Мок для Notification.permission
    Object.defineProperty(Notification, 'permission', {
      value: 'default',
      writable: true,
    })
    
    // Мок для Notification.requestPermission
    Object.defineProperty(Notification, 'requestPermission', {
      value: jest.fn(() => Promise.resolve('granted')),
      writable: true,
    })
  })

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = NotificationService.getInstance()
      const instance2 = NotificationService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should export singleton instance', () => {
      expect(notificationService).toBeInstanceOf(NotificationService)
    })
  })

  describe('Permission management', () => {
    it('should check notification permission', async () => {
      const permission = await service.checkPermission()
      expect(permission).toBe('default')
    })

    it('should request notification permission', async () => {
      const permission = await service.requestPermission()
      expect(Notification.requestPermission).toHaveBeenCalled()
      expect(permission).toBe('granted')
    })

    it('should return denied if Notification is not supported', async () => {
      // Временно удаляем Notification из window
      const originalNotification = (window as any).Notification
      delete (window as any).Notification

      const permission = await service.checkPermission()
      expect(permission).toBe('denied')

      // Восстанавливаем Notification
      ;(window as any).Notification = originalNotification
    })
  })

  describe('Settings management', () => {
    it('should load default settings', () => {
      const settings = service.getSettings()
      expect(settings).toEqual({
        enabled: true,
        newMessages: true,
        trackAdded: true,
        trackStarted: true,
        roomInvites: true,
        systemUpdates: false,
      })
    })

    it('should update settings', () => {
      service.updateSettings({ newMessages: false })
      const settings = service.getSettings()
      expect(settings.newMessages).toBe(false)
    })

    it('should save settings to localStorage', () => {
      service.updateSettings({ trackAdded: false })
      const saved = localStorage.getItem('notification_settings')
      expect(saved).toBeTruthy()
      
      const parsed = JSON.parse(saved!)
      expect(parsed.trackAdded).toBe(false)
    })

    it('should load settings from localStorage', () => {
      const testSettings = {
        enabled: false,
        newMessages: false,
        trackAdded: true,
        trackStarted: false,
        roomInvites: true,
        systemUpdates: true,
      }
      
      localStorage.setItem('notification_settings', JSON.stringify(testSettings))
      
      // Создаем новый экземпляр для загрузки настроек
      const newService = new (NotificationService as any)()
      const settings = newService.getSettings()
      
      expect(settings).toEqual(testSettings)
    })

    it('should enable/disable notifications', () => {
      service.setEnabled(false)
      expect(service.getSettings().enabled).toBe(false)
      
      service.setEnabled(true)
      expect(service.getSettings().enabled).toBe(true)
    })
  })

  describe('Notification display', () => {
    beforeEach(() => {
      // Мок для document.visibilityState
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      })
      
      // Мок для Notification constructor
      mockNotification.mockImplementation(() => ({
        close: jest.fn(),
        onclick: null,
      }))
      
      Object.defineProperty(Notification, 'permission', {
        value: 'granted',
        writable: true,
      })
    })

    it('should show new message notification', async () => {
      await service.notifyNewMessage({
        username: 'TestUser',
        message: 'Hello world',
        roomName: 'Test Room',
        roomId: 'room-123',
      })

      expect(mockNotification).toHaveBeenCalledWith('💬 Новое сообщение', {
        body: 'TestUser в Test Room: Hello world',
        icon: '/icons/icon-192x192.png',
        tag: 'chat-room-123',
        vibrate: [200, 100, 200],
      })
    })

    it('should show track added notification', async () => {
      await service.notifyTrackAdded({
        trackTitle: 'Test Song',
        trackArtist: 'Test Artist',
        username: 'TestUser',
        roomName: 'Test Room',
        roomId: 'room-123',
      })

      expect(mockNotification).toHaveBeenCalledWith('🎵 Новый трек добавлен', {
        body: 'TestUser добавил "Test Song" от Test Artist в Test Room',
        icon: '/icons/icon-192x192.png',
        tag: 'track-added-room-123',
        vibrate: [100, 50, 100],
      })
    })

    it('should show track started notification', async () => {
      await service.notifyTrackStarted({
        trackTitle: 'Test Song',
        trackArtist: 'Test Artist',
        roomName: 'Test Room',
        roomId: 'room-123',
      })

      expect(mockNotification).toHaveBeenCalledWith('▶️ Начал играть трек', {
        body: '"Test Song" от Test Artist в Test Room',
        icon: '/icons/icon-192x192.png',
        tag: 'track-started-room-123',
        requireInteraction: false,
        vibrate: [300],
      })
    })

    it('should show room invite notification', async () => {
      await service.notifyRoomInvite({
        roomName: 'Test Room',
        inviterName: 'TestUser',
        roomId: 'room-123',
      })

      expect(mockNotification).toHaveBeenCalledWith('🎉 Приглашение в комнату', {
        body: 'TestUser приглашает вас в "Test Room"',
        icon: '/icons/icon-192x192.png',
        tag: 'invite-room-123',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
      })
    })

    it('should not show notification if disabled', async () => {
      service.setEnabled(false)
      
      await service.notifyNewMessage({
        username: 'TestUser',
        message: 'Hello world',
        roomName: 'Test Room',
        roomId: 'room-123',
      })

      expect(mockNotification).not.toHaveBeenCalled()
    })

    it('should not show notification if specific type is disabled', async () => {
      service.updateSettings({ newMessages: false })
      
      await service.notifyNewMessage({
        username: 'TestUser',
        message: 'Hello world',
        roomName: 'Test Room',
        roomId: 'room-123',
      })

      expect(mockNotification).not.toHaveBeenCalled()
    })

    it('should not show notification if permission is not granted', async () => {
      Object.defineProperty(Notification, 'permission', {
        value: 'denied',
        writable: true,
      })
      
      await service.notifyNewMessage({
        username: 'TestUser',
        message: 'Hello world',
        roomName: 'Test Room',
        roomId: 'room-123',
      })

      expect(mockNotification).not.toHaveBeenCalled()
    })

    it('should not show notification if page is visible', async () => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      })
      
      await service.notifyNewMessage({
        username: 'TestUser',
        message: 'Hello world',
        roomName: 'Test Room',
        roomId: 'room-123',
      })

      expect(mockNotification).not.toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Мок для localStorage.getItem, который выбрасывает ошибку
      const originalGetItem = localStorage.getItem
      localStorage.getItem = jest.fn(() => {
        throw new Error('localStorage error')
      })

      // Создаем новый экземпляр, который попытается загрузить настройки
      const newService = new (NotificationService as any)()
      const settings = newService.getSettings()

      // Должны получить настройки по умолчанию
      expect(settings.enabled).toBe(true)

      // Восстанавливаем localStorage
      localStorage.getItem = originalGetItem
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('notification_settings', 'invalid json')
      
      const newService = new (NotificationService as any)()
      const settings = newService.getSettings()

      // Должны получить настройки по умолчанию
      expect(settings.enabled).toBe(true)
    })
  })
})
// Сервис для управления уведомлениями
export class NotificationService {
  private static instance: NotificationService
  private isEnabled: boolean = true
  private settings: Record<string, boolean> = {}

  private constructor() {
    this.loadSettings()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private loadSettings() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('notification_settings')
      if (saved) {
        const settings = JSON.parse(saved)
        this.isEnabled = settings.enabled ?? true
        this.settings = {
          newMessages: settings.newMessages ?? true,
          trackAdded: settings.trackAdded ?? true,
          trackStarted: settings.trackStarted ?? true,
          roomInvites: settings.roomInvites ?? true,
          systemUpdates: settings.systemUpdates ?? false,
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return

    const settings = {
      enabled: this.isEnabled,
      ...this.settings,
    }
    localStorage.setItem('notification_settings', JSON.stringify(settings))
  }

  // Проверка разрешений
  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission
  }

  // Запрос разрешений
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Показать уведомление о новом сообщении
  async notifyNewMessage(data: {
    username: string
    message: string
    roomName: string
    roomId: string
  }) {
    if (!this.isEnabled || !this.settings.newMessages) return

    const permission = await this.checkPermission()
    if (permission !== 'granted') return

    // Не показываем если вкладка активна
    if (document.visibilityState === 'visible') return

    // Вибрация
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }

    new Notification('💬 Новое сообщение', {
      body: `${data.username} в ${data.roomName}: ${data.message}`,
      icon: '/icons/icon-192x192.png',
      tag: `chat-${data.roomId}`,
    })
  }

  // Показать уведомление о добавлении трека
  async notifyTrackAdded(data: {
    trackTitle: string
    trackArtist: string
    username: string
    roomName: string
    roomId: string
  }) {
    if (!this.isEnabled || !this.settings.trackAdded) return

    const permission = await this.checkPermission()
    if (permission !== 'granted') return

    if (document.visibilityState === 'visible') return

    // Вибрация
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }

    new Notification('🎵 Новый трек добавлен', {
      body: `${data.username} добавил "${data.trackTitle}" от ${data.trackArtist} в ${data.roomName}`,
      icon: '/icons/icon-192x192.png',
      tag: `track-added-${data.roomId}`,
    })
  }

  // Показать уведомление о начале трека
  async notifyTrackStarted(data: {
    trackTitle: string
    trackArtist: string
    roomName: string
    roomId: string
  }) {
    if (!this.isEnabled || !this.settings.trackStarted) return

    const permission = await this.checkPermission()
    if (permission !== 'granted') return

    if (document.visibilityState === 'visible') return

    // Вибрация
    if ('vibrate' in navigator) {
      navigator.vibrate([300])
    }

    new Notification('▶️ Начал играть трек', {
      body: `"${data.trackTitle}" от ${data.trackArtist} в ${data.roomName}`,
      icon: '/icons/icon-192x192.png',
      tag: `track-started-${data.roomId}`,
      requireInteraction: false,
    })
  }

  // Показать уведомление о приглашении в комнату
  async notifyRoomInvite(data: {
    roomName: string
    inviterName: string
    roomId: string
  }) {
    if (!this.isEnabled || !this.settings.roomInvites) return

    const permission = await this.checkPermission()
    if (permission !== 'granted') return

    // Вибрация
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }

    new Notification('🎉 Приглашение в комнату', {
      body: `${data.inviterName} приглашает вас в "${data.roomName}"`,
      icon: '/icons/icon-192x192.png',
      tag: `invite-${data.roomId}`,
      requireInteraction: true,
    })
  }

  // Обновить настройки
  updateSettings(newSettings: Partial<Record<string, boolean>>) {
    Object.keys(newSettings).forEach(key => {
      const value = newSettings[key]
      if (value !== undefined) {
        this.settings[key] = value
      }
    })
    this.saveSettings()
  }

  // Включить/выключить уведомления
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    this.saveSettings()
  }

  // Получить текущие настройки
  getSettings() {
    return {
      enabled: this.isEnabled,
      ...this.settings,
    }
  }
}

// Экспортируем singleton instance
export const notificationService = NotificationService.getInstance()

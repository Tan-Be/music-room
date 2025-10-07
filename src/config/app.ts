export const APP_CONFIG = {
  // Базовые настройки приложения
  NAME: 'Music Room',
  DESCRIPTION: 'Платформа для совместного прослушивания музыки в реальном времени',
  VERSION: '0.1.0',
  
  // Ограничения приложения
  TRACK_LIMIT_PER_USER: 8, // Количество треков на пользователя в день
  MAX_PARTICIPANTS_PER_ROOM: 10, // Максимальное количество участников в комнате
  MAX_TRACK_DURATION: 6 * 60 * 1000, // Максимальная длительность трека (6 минут в миллисекундах)
  TRACK_METADATA_CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // Срок кэширования метаданных треков (7 дней)
  
  // Настройки синхронизации
  SYNC_ACCURACY_THRESHOLD: 500, // Точность синхронизации в миллисекундах
  
  // Настройки комнаты
  DEFAULT_ROOM_MAX_PARTICIPANTS: 10,
  
  // API настройки
  API_TIMEOUT: 10000, // Таймаут для API запросов (10 секунд)
  
  // Настройки уведомлений
  NOTIFICATION_DURATION: 5000, // Длительность отображения уведомлений (5 секунд)
  
  // Темы
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  }
} as const
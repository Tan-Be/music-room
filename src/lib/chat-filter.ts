// Базовая фильтрация контента для чата

// Список нецензурных слов (в реальном приложении этот список должен быть более полным)
const PROFANITY_WORDS = [
  'бля',
  'блядь',
  'блять',
  'ебать',
  'ебаный',
  'ебана',
  'хуй',
  'хуёвый',
  'хуевый',
  'пизда',
  'пиздец',
  'сука',
  'сучка',
  'говно',
  'говённый',
  'говенный',
  'жопа',
  'жополиз',
  'дрочить',
  'дрочь',
  'мудак',
  'мудень',
  'мудила',
  'залупа',
  'чмо',
  'черт',
  'чёрт',
]

// Максимальная длина сообщения
export const MAX_MESSAGE_LENGTH = 500

// Минимальный интервал между сообщениями (в миллисекундах)
export const MIN_MESSAGE_INTERVAL = 1000 // 1 секунда

// Максимальное количество сообщений в минуту
export const MAX_MESSAGES_PER_MINUTE = 10

// Rate limiting для пользователей
const userMessageTimes = new Map<string, number[]>()

// Проверка rate limiting
export function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userTimes = userMessageTimes.get(userId) || []

  // Удаляем старые записи (старше минуты)
  const recentTimes = userTimes.filter(time => now - time < 60000)

  // Проверяем лимит сообщений в минуту
  if (recentTimes.length >= MAX_MESSAGES_PER_MINUTE) {
    return false
  }

  // Добавляем текущее время
  recentTimes.push(now)
  userMessageTimes.set(userId, recentTimes)

  return true
}

// Проверка интервала между сообщениями
export function checkMessageInterval(
  userId: string,
  lastMessageTime: number
): boolean {
  const now = Date.now()
  return now - lastMessageTime >= MIN_MESSAGE_INTERVAL
}

// Фильтрация нецензурной лексики
export function filterProfanity(text: string): string {
  let filteredText = text

  // Заменяем нецензурные слова на звездочки
  PROFANITY_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    filteredText = filteredText.replace(regex, '*'.repeat(word.length))
  })

  return filteredText
}

// Проверка длины сообщения
export function isMessageTooLong(text: string): boolean {
  return text.length > MAX_MESSAGE_LENGTH
}

// Проверка на слишком частую отправку сообщений
export function isSendingTooFast(lastMessageTime: number): boolean {
  const now = Date.now()
  return now - lastMessageTime < MIN_MESSAGE_INTERVAL
}

// Валидация сообщения
export function validateMessage(
  text: string,
  lastMessageTime: number,
  userId?: string
): { isValid: boolean; error?: string; filteredMessage?: string } {
  // Проверка на пустое сообщение
  if (!text.trim()) {
    return { isValid: false, error: 'Сообщение не может быть пустым' }
  }

  // Проверка длины сообщения
  if (isMessageTooLong(text)) {
    return {
      isValid: false,
      error: `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)`,
    }
  }

  // Проверка rate limiting
  if (userId && !checkRateLimit(userId)) {
    return {
      isValid: false,
      error: 'Слишком много сообщений. Подождите немного.',
    }
  }

  // Проверка частоты отправки
  if (isSendingTooFast(lastMessageTime)) {
    return {
      isValid: false,
      error: `Пожалуйста, подождите перед отправкой следующего сообщения`,
    }
  }

  // Фильтрация контента
  const filteredMessage = filterProfanity(text.trim())

  return {
    isValid: true,
    filteredMessage,
  }
}

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
  'чёрт'
]

// Максимальная длина сообщения
export const MAX_MESSAGE_LENGTH = 500

// Минимальный интервал между сообщениями (в миллисекундах)
export const MIN_MESSAGE_INTERVAL = 1000 // 1 секунда

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
  lastMessageTime: number
): { isValid: boolean; error?: string } {
  // Проверка на пустое сообщение
  if (!text.trim()) {
    return { isValid: false, error: 'Сообщение не может быть пустым' }
  }
  
  // Проверка длины сообщения
  if (isMessageTooLong(text)) {
    return { 
      isValid: false, 
      error: `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)` 
    }
  }
  
  // Проверка частоты отправки
  if (isSendingTooFast(lastMessageTime)) {
    return { 
      isValid: false, 
      error: `Пожалуйста, подождите перед отправкой следующего сообщения` 
    }
  }
  
  return { isValid: true }
}
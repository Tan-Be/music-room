import { useState, useEffect, useCallback } from 'react'

export function useTypingIndicator() {
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Функция для отправки индикатора "печатает"
  const sendTypingIndicator = useCallback(() => {
    // Устанавливаем состояние "печатает"
    setIsTyping(true)

    // Если уже есть таймер, очищаем его
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Устанавливаем новый таймер для сброса состояния через 3 секунды
    const timeout = setTimeout(() => {
      setIsTyping(false)
    }, 3000)

    // Сохраняем ссылку на таймер
    setTypingTimeout(timeout)
  }, [typingTimeout])

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [typingTimeout])

  return {
    isTyping,
    sendTypingIndicator
  }
}
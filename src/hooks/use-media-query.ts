'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Устанавливаем начальное значение
    setMatches(media.matches)

    // Создаем обработчик изменений
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Добавляем слушатель
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback для старых браузеров
      media.addListener(listener)
    }

    // Очистка при размонтировании
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

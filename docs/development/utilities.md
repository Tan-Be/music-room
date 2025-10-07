# Утилиты и хуки

## Утилиты

### Форматирование

#### `formatRelativeTime(date: Date | string): string`
Форматирует дату в относительное время (например, "2 часа назад").

```typescript
import { formatRelativeTime } from '@/lib/utils'

const date = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 часа назад
console.log(formatRelativeTime(date)) // "2 часов назад"
```

#### `formatDuration(ms: number): string`
Форматирует длительность в миллисекундах в формат MM:SS.

```typescript
import { formatDuration } from '@/lib/utils'

console.log(formatDuration(90000)) // "1:30" (1 минута 30 секунд)
```

#### `truncateString(str: string, maxLength: number): string`
Обрезает строку до заданной длины и добавляет многоточие.

```typescript
import { truncateString } from '@/lib/utils'

console.log(truncateString('Это очень длинная строка', 10)) // "Это очень д..."
```

### Генерация

#### `generateId(length: number = 8): string`
Генерирует случайный ID заданной длины.

```typescript
import { generateId } from '@/lib/utils'

console.log(generateId()) // "a1b2c3d4" (8 символов по умолчанию)
console.log(generateId(12)) // "a1b2c3d4e5f6" (12 символов)
```

### Проверки

#### `isEmpty(value: any): boolean`
Проверяет, является ли значение пустым (null, undefined, пустая строка, пустой массив, пустой объект).

```typescript
import { isEmpty } from '@/lib/utils'

console.log(isEmpty(null)) // true
console.log(isEmpty('')) // true
console.log(isEmpty([])) // true
console.log(isEmpty({})) // true
console.log(isEmpty('hello')) // false
```

### Классы

#### `cn(...inputs: ClassValue[]): string`
Объединяет классы с помощью `clsx` и `tailwind-merge`.

```typescript
import { cn } from '@/lib/utils'

const className = cn('text-red-500', 'bg-blue-500', { 'font-bold': true })
```

## Хуки

### `useTheme()`
Хук для управления темой приложения.

```typescript
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, isDarkMode, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      Переключить на {isDarkMode ? 'светлую' : 'темную'} тему
    </button>
  )
}
```

### `useMediaQuery(query: string): boolean`
Хук для работы с медиа запросами.

```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return (
    <div>
      {isMobile ? 'Мобильная версия' : 'Десктопная версия'}
    </div>
  )
}
```

### `useLoading()`
Хук для управления состоянием загрузки.

```typescript
import { useLoading } from '@/hooks/useLoading'

export function DataLoader() {
  const { loading, startLoading, stopLoading } = useLoading()
  
  const loadData = async () => {
    startLoading()
    try {
      // Загрузка данных
    } finally {
      stopLoading()
    }
  }
  
  return (
    <div>
      {loading ? 'Загрузка...' : <button onClick={loadData}>Загрузить</button>}
    </div>
  )
}
```

### `useLocalStorage<T>(key: string, initialValue: T)`
Хук для работы с localStorage.

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage'

export function Preferences() {
  const [volume, setVolume] = useLocalStorage('volume', 0.5)
  
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      value={volume}
      onChange={(e) => setVolume(parseFloat(e.target.value))}
    />
  )
}
```
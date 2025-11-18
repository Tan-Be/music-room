'use client'

import { useTheme } from '@/hooks/useTheme'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ThemeDemo() {
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const [savedValue, setSavedValue] = useLocalStorage(
    'demo-value',
    'initial value'
  )

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Демонстрация хуков</CardTitle>
        <CardDescription>Пример использования кастомных хуков</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Текущая тема:</span>
          <span className="font-medium">{theme}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Темный режим:</span>
          <span className="font-medium">
            {isDarkMode ? 'Включен' : 'Выключен'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Сохраненное значение:</span>
          <span className="font-medium">{savedValue}</span>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={toggleTheme}>Переключить тему</Button>

          <Button
            variant="outline"
            onClick={() => setSavedValue(`Значение обновлено`)}
          >
            Обновить сохраненное значение
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

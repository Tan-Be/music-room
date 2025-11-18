'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'
import { rooms } from '@/lib/rooms'

export default function CreateRoomPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [roomType, setRoomType] = useState('public')
  const [password, setPassword] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(10)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Название комнаты обязательно'
    } else if (name.length < 3) {
      newErrors.name = 'Название должно содержать минимум 3 символа'
    } else if (name.length > 50) {
      newErrors.name = 'Название не должно превышать 50 символов'
    }

    if (description && description.length > 200) {
      newErrors.description = 'Описание не должно превышать 200 символов'
    }

    if (roomType === 'password' && !password) {
      newErrors.password = 'Пароль обязателен для приватной комнаты'
    } else if (roomType === 'password' && password.length < 4) {
      newErrors.password = 'Пароль должен содержать минимум 4 символа'
    } else if (roomType === 'password' && password.length > 20) {
      newErrors.password = 'Пароль не должен превышать 20 символов'
    }

    if (maxParticipants < 2) {
      newErrors.maxParticipants = 'Минимум 2 участника'
    } else if (maxParticipants > 10) {
      newErrors.maxParticipants = 'Максимум 10 участников'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Создаем комнату в базе данных
      const roomResponse = await rooms.createRoom({
        name,
        description: description || null,
        is_public: roomType === 'public',
        password_hash: roomType === 'password' ? password : null,
        max_participants: maxParticipants,
        owner_id: user!.id,
      })

      if (roomResponse.error) {
        throw new Error(roomResponse.error)
      }

      // Получаем ID созданной комнаты
      const roomData = roomResponse.data
      if (!roomData?.id) {
        throw new Error('Не удалось создать комнату')
      }

      const roomId = roomData.id

      if (!roomId) {
        throw new Error('Не удалось получить ID созданной комнаты')
      }

      // Добавляем владельца как участника комнаты
      const participantResponse = await rooms.addParticipant({
        room_id: roomId,
        user_id: user!.id,
        role: 'owner',
      })

      if (participantResponse.error) {
        throw new Error(participantResponse.error)
      }

      toast.success('Комната успешно создана!')
      router.push(`/rooms`)
    } catch (error: any) {
      console.error('Error creating room:', error)
      toast.error('Ошибка при создании комнаты. Попробуйте еще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Только на клиенте мы можем использовать router
  if (!isClient) {
    return null
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Создать комнату</CardTitle>
          <CardDescription>
            Создайте новую музыкальную комнату для совместного прослушивания
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Название комнаты */}
            <div className="space-y-2">
              <Label htmlFor="name">Название комнаты *</Label>
              <Input
                id="name"
                placeholder="Введите название комнаты"
                value={name}
                onChange={e => setName(e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Опишите вашу комнату"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>

            {/* Тип комнаты */}
            <div className="space-y-2">
              <Label>Тип комнаты</Label>
              <RadioGroup value={roomType} onValueChange={setRoomType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Публичная</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Приватная (по ссылке)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="password" id="password" />
                  <Label htmlFor="password">С паролем</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Пароль для комнаты с паролем */}
            {roomType === 'password' && (
              <div className="space-y-2">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль для комнаты"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
            )}

            {/* Лимит участников */}
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">
                Максимум участников (2-10)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="maxParticipants"
                  type="number"
                  min="2"
                  max="10"
                  value={maxParticipants}
                  onChange={e =>
                    setMaxParticipants(
                      Math.min(10, Math.max(2, parseInt(e.target.value) || 2))
                    )
                  }
                  className={errors.maxParticipants ? 'border-red-500' : ''}
                />
                <div className="flex gap-1">
                  {[2, 5, 10].map(value => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMaxParticipants(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
              {errors.maxParticipants && (
                <p className="text-red-500 text-sm">{errors.maxParticipants}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Максимум 10 участников в комнате
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Icons.music className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                'Создать комнату'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

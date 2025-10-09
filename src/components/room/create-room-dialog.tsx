'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateRoom?: (data: {
    name: string
    description: string
    privacy: 'public' | 'unlisted' | 'private'
    password?: string
  }) => void
}

export function CreateRoomDialog({
  open,
  onOpenChange,
  onCreateRoom,
}: CreateRoomDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>(
    'public'
  )
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    onCreateRoom?.({
      name: name.trim(),
      description: description.trim(),
      privacy,
      ...(privacy === 'private' && password ? { password } : {}),
    })

    // Reset form
    setName('')
    setDescription('')
    setPrivacy('public')
    setPassword('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Создать комнату</DialogTitle>
            <DialogDescription>
              Создайте новую музыкальную комнату для совместного прослушивания
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название комнаты</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Например: Вечерний чилл"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Опишите тематику комнаты..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Приватность</Label>
              <RadioGroup
                value={privacy}
                onValueChange={(value: any) => setPrivacy(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Публичная (видна всем)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unlisted" id="unlisted" />
                  <Label htmlFor="unlisted">
                    По ссылке (только по приглашению)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Приватная (с паролем)</Label>
                </div>
              </RadioGroup>
            </div>

            {privacy === 'private' && (
              <div className="grid gap-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль для комнаты"
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Создать комнату</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

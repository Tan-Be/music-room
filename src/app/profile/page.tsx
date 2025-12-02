'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Upload, User, Bell, BarChart3, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Форма профиля
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // Настройки уведомлений
  const [notifications, setNotifications] = useState({
    newMessages: true,
    trackAdded: true,
    roomInvites: true,
    systemUpdates: false,
  })

  // Статистика
  const [stats, setStats] = useState({
    roomsJoined: 0,
    tracksAdded: 0,
    messagesCount: 0,
    tracksAddedToday: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    if (profile) {
      setUsername(profile.username || '')
      setAvatarUrl(profile.avatar_url || '')
    }

    loadStats()
    loadNotificationSettings()
  }, [user, profile, router])

  const loadStats = async () => {
    if (!user) return

    try {
      // Загружаем статистику
      const [roomsData, tracksData, messagesData] = await Promise.all([
        supabase
          .from('room_participants')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('room_queue')
          .select('id', { count: 'exact' })
          .eq('added_by', user.id),
        supabase
          .from('chat_messages')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
      ])

      setStats({
        roomsJoined: roomsData.count || 0,
        tracksAdded: tracksData.count || 0,
        messagesCount: messagesData.count || 0,
        tracksAddedToday: profile?.tracks_added_today || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadNotificationSettings = () => {
    // Загружаем из localStorage
    const saved = localStorage.getItem('notification_settings')
    if (saved) {
      setNotifications(JSON.parse(saved))
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    if (!username.trim()) {
      toast.error('Имя пользователя не может быть пустым')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      toast.success('Профиль обновлен')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Не удалось обновить профиль')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    
    // Проверка размера (макс 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 2MB')
      return
    }

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения')
      return
    }

    setIsUploadingAvatar(true)
    try {
      // Удаляем старый аватар если есть
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
        }
      }

      // Загружаем новый
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Получаем публичный URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const newAvatarUrl = data.publicUrl

      // Обновляем профиль
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(newAvatarUrl)
      await refreshProfile()
      toast.success('Аватар обновлен')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error('Не удалось загрузить аватар')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('notification_settings', JSON.stringify(notifications))
    toast.success('Настройки уведомлений сохранены')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      toast.success('Вы вышли из аккаунта')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Ошибка при выходе')
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Профиль</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Статистика
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Уведомления
          </TabsTrigger>
        </TabsList>

        {/* Вкладка: Профиль */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Редактирование профиля</h2>

            {/* Аватар */}
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className="text-2xl">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Upload className="h-4 w-4" />
                    Загрузить новый аватар
                  </div>
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG или GIF. Максимум 2MB.
                </p>
              </div>
            </div>

            {/* Имя пользователя */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите имя"
                disabled={isSaving}
              />
            </div>

            {/* Email (только чтение) */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email нельзя изменить
              </p>
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <Spinner size="sm" className="mr-2" />}
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </Card>
        </TabsContent>

        {/* Вкладка: Статистика */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Комнат посещено</p>
                  <p className="text-3xl font-bold mt-2">{stats.roomsJoined}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Треков добавлено</p>
                  <p className="text-3xl font-bold mt-2">{stats.tracksAdded}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Сообщений отправлено</p>
                  <p className="text-3xl font-bold mt-2">{stats.messagesCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Треков сегодня</p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.tracksAddedToday} / 8
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка: Уведомления */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Настройки уведомлений</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Новые сообщения</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления о новых сообщениях в чате
                  </p>
                </div>
                <Switch
                  checked={notifications.newMessages}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newMessages: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Добавление треков</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления когда кто-то добавляет трек
                  </p>
                </div>
                <Switch
                  checked={notifications.trackAdded}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, trackAdded: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Приглашения в комнаты</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления о приглашениях в комнаты
                  </p>
                </div>
                <Switch
                  checked={notifications.roomInvites}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, roomInvites: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Системные обновления</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления о новых функциях и обновлениях
                  </p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, systemUpdates: checked })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications} className="mt-6">
              Сохранить настройки
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

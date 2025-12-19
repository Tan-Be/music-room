'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/hooks/use-notifications'
import { supabase } from '@/lib/supabase'

export function NotificationManager() {
  const { user } = useAuth()
  const { showNotification, permission, requestPermission } = useNotifications()

  useEffect(() => {
    if (!user) return

    // Запрашиваем разрешение при первом входе
    if (permission === 'default') {
      const timer = setTimeout(() => {
        requestPermission()
      }, 3000) // Через 3 секунды после входа

      return () => clearTimeout(timer)
    }
  }, [user, permission, requestPermission])

  useEffect(() => {
    if (!user || permission !== 'granted') return

    // Загружаем настройки уведомлений
    const getNotificationSettings = () => {
      try {
        const saved = localStorage.getItem('notification_settings')
        if (saved) {
          return JSON.parse(saved)
        }
      } catch (error) {
        console.error('Error loading notification settings:', error)
      }
      return {
        newMessages: true,
        trackAdded: true,
        trackStarted: true,
        roomInvites: true,
        systemUpdates: false,
      }
    }

    const settings = getNotificationSettings()

    // Подписываемся на новые сообщения в чате
    const chatSubscription = supabase
      .channel('chat_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=neq.${user.id}`, // Не наши сообщения
        },
        async payload => {
          if (!settings.newMessages) return

          const message = payload.new as any

          // Получаем информацию о пользователе и комнате
          const { data: userData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', message.user_id)
            .single()

          const { data: roomData } = await supabase
            .from('rooms')
            .select('name')
            .eq('id', message.room_id)
            .single()

          const username = (userData as any)?.username || 'Пользователь'
          const roomName = (roomData as any)?.name || 'Комната'

          showNotification({
            title: '💬 Новое сообщение',
            body: `${username} в ${roomName}: ${message.message}`,
            tag: `chat-${message.room_id}`,
            icon: '/icons/icon-192x192.png',
            vibrate: [200, 100, 200],
          })
        }
      )
      .subscribe()

    // Подписываемся на добавление треков
    const trackSubscription = supabase
      .channel('track_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_queue',
          filter: `added_by=neq.${user.id}`, // Не наши треки
        },
        async payload => {
          if (!settings.trackAdded) return

          const queueItem = payload.new as any

          // Получаем информацию о треке, пользователе и комнате
          const [trackResult, userResult, roomResult] = await Promise.all([
            supabase
              .from('tracks')
              .select('title, artist')
              .eq('id', queueItem.track_id)
              .single(),
            supabase
              .from('profiles')
              .select('username')
              .eq('id', queueItem.added_by)
              .single(),
            supabase
              .from('rooms')
              .select('name')
              .eq('id', queueItem.room_id)
              .single(),
          ])

          const trackTitle = (trackResult.data as any)?.title || 'Трек'
          const trackArtist = (trackResult.data as any)?.artist || 'Исполнитель'
          const username = (userResult.data as any)?.username || 'Пользователь'
          const roomName = (roomResult.data as any)?.name || 'Комната'

          showNotification({
            title: '🎵 Новый трек добавлен',
            body: `${username} добавил "${trackTitle}" от ${trackArtist} в ${roomName}`,
            tag: `track-${queueItem.room_id}`,
            icon: '/icons/icon-192x192.png',
            vibrate: [100, 50, 100],
          })
        }
      )
      .subscribe()

    // Подписываемся на начало воспроизведения треков
    const playbackSubscription = supabase
      .channel('playback_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: 'is_playing=eq.true',
        },
        async payload => {
          if (!settings.trackStarted) return

          const room = payload.new as any

          // Получаем информацию о текущем треке
          if (room.current_track_id) {
            const { data: trackData } = await supabase
              .from('tracks')
              .select('title, artist')
              .eq('id', room.current_track_id)
              .single()

            if (trackData) {
              showNotification({
                title: '▶️ Начал играть трек',
                body: `"${(trackData as any).title}" от ${(trackData as any).artist} в ${(room as any).name}`,
                tag: `playback-${room.id}`,
                icon: '/icons/icon-192x192.png',
                requireInteraction: false,
                vibrate: [300],
              })
            }
          }
        }
      )
      .subscribe()

    // Подписываемся на приглашения в комнаты
    const inviteSubscription = supabase
      .channel('invite_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_participants',
          filter: `user_id=eq.${user.id}`, // Только наши приглашения
        },
        async payload => {
          if (!settings.roomInvites) return

          const participant = payload.new as any

          // Получаем информацию о комнате
          const { data: roomData } = await supabase
            .from('rooms')
            .select('name, owner_id, profiles!rooms_owner_id_fkey(username)')
            .eq('id', participant.room_id)
            .single()

          if (roomData) {
            const roomName = (roomData as any).name
            const inviterName =
              (roomData as any).profiles?.username || 'Пользователь'

            showNotification({
              title: '🎉 Приглашение в комнату',
              body: `${inviterName} приглашает вас в "${roomName}"`,
              tag: `invite-${participant.room_id}`,
              icon: '/icons/icon-192x192.png',
              requireInteraction: true,
              vibrate: [200, 100, 200, 100, 200],
            })
          }
        }
      )
      .subscribe()

    // Очистка подписок
    return () => {
      chatSubscription.unsubscribe()
      trackSubscription.unsubscribe()
      playbackSubscription.unsubscribe()
      inviteSubscription.unsubscribe()
    }
  }, [user, permission, showNotification])

  return null // Компонент не рендерит UI
}

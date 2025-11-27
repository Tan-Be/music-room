// @ts-nocheck
/**
 * Примеры использования retry логики для Supabase
 */

import { supabase } from './supabase'
import { retryWithBackoff, retrySupabaseQuery, retryMutation } from './retry'

// ============================================
// Пример 1: Базовое использование retryWithBackoff
// ============================================

export async function fetchUserWithRetry(userId: string) {
  return await retryWithBackoff(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  })
}

// ============================================
// Пример 2: Использование retrySupabaseQuery (рекомендуется)
// ============================================

export async function fetchRoomWithRetry(roomId: string) {
  return await retrySupabaseQuery(async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) throw error
    return data
  })
}

// ============================================
// Пример 3: Использование retryMutation для вставки
// ============================================

export async function addTrackWithRetry(track: any) {
  return await retryMutation(async () => {
    const { error } = await supabase.from('tracks').insert([track] as any)

    if (error) throw error
  })
}

// ============================================
// Пример 4: Кастомные настройки retry
// ============================================

export async function fetchTracksWithCustomRetry(roomId: string) {
  return await retryWithBackoff(
    async () => {
      const { data, error } = await supabase
        .from('room_queue')
        .select('*')
        .eq('room_id', roomId)

      if (error) throw error
      return data
    },
    {
      maxRetries: 5, // Больше попыток
      baseDelay: 500, // Меньшая начальная задержка
      onRetry: (attempt, error) => {
        console.log(`Попытка ${attempt} не удалась:`, error)
      },
    }
  )
}

// ============================================
// Пример 5: Кастомная логика shouldRetry
// ============================================

export async function fetchWithCustomRetryLogic(userId: string) {
  return await retryWithBackoff(
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    },
    {
      shouldRetry: error => {
        // Retry только для сетевых ошибок
        return (
          error?.message?.includes('network') ||
          error?.message?.includes('timeout')
        )
      },
    }
  )
}

// ============================================
// Пример 6: Обновление с retry
// ============================================

export async function updateUserProfileWithRetry(
  userId: string,
  updates: any
) {
  return await retryMutation(async () => {
    const { error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', userId)

    if (error) throw error
  })
}

// ============================================
// Пример 7: Удаление с retry
// ============================================

export async function deleteTrackWithRetry(trackId: string) {
  return await retryMutation(async () => {
    const { error } = await supabase.from('tracks').delete().eq('id', trackId) as any

    if (error) throw error
  })
}

// ============================================
// Пример 8: Множественные операции с retry
// ============================================

export async function addMultipleTracksWithRetry(tracks: any[]) {
  const results = await Promise.all(
    tracks.map(track => addTrackWithRetry(track))
  )

  const successCount = results.filter(Boolean).length
  const failCount = results.length - successCount

  return {
    success: successCount,
    failed: failCount,
    total: results.length,
  }
}

// ============================================
// Пример 9: Retry с прогрессом
// ============================================

export async function fetchLargeDatasetWithRetry(
  roomId: string,
  onProgress?: (progress: number) => void
) {
  let attempt = 0
  const maxRetries = 3

  return await retryWithBackoff(
    async () => {
      const { data, error } = await supabase
        .from('room_queue')
        .select('*')
        .eq('room_id', roomId)

      if (error) throw error
      return data
    },
    {
      maxRetries,
      onRetry: attemptNum => {
        attempt = attemptNum
        if (onProgress) {
          onProgress((attempt / maxRetries) * 100)
        }
      },
    }
  )
}

// ============================================
// Пример 10: Комбинация с другими утилитами
// ============================================

export async function voteForTrackWithRetry(
  userId: string,
  roomId: string,
  trackId: string,
  voteValue: 1 | -1
) {
  // Сначала проверяем существующий голос
  const existingVote = await retrySupabaseQuery(async () => {
    const { data, error } = await supabase
      .from('track_votes')
      .select('*')
      .match({ user_id: userId, room_id: roomId, track_id: trackId })
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  })

  // Затем добавляем или обновляем голос
  if (existingVote) {
    return await retryMutation(async () => {
      const { error } = await supabase
        .from('track_votes')
        .update({ vote_value: voteValue } as any)
        .eq('id', (existingVote as any).id)

      if (error) throw error
    })
  } else {
    return await retryMutation(async () => {
      const { error } = await supabase.from('track_votes').insert([
        {
          user_id: userId,
          room_id: roomId,
          track_id: trackId,
          vote_value: voteValue,
        },
      ] as any)

      if (error) throw error
    })
  }
}

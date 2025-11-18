import { supabase } from './supabase'
import { toast } from 'sonner'
import { Profile } from './supabase'

// Maximum tracks a user can add per day
export const MAX_TRACKS_PER_DAY = 8

// Check if user has reached their daily track limit
export async function checkTrackLimit(userId: string): Promise<{
  hasLimitReached: boolean
  tracksAddedToday: number
  remainingTracks: number
}> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('tracks_added_today, last_track_date')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Check if it's a new day and reset counter if needed
    const today = new Date().toISOString().split('T')[0]
    let tracksAddedToday = (profile as Profile).tracks_added_today

    // If last track date is not today, reset the counter
    if ((profile as Profile).last_track_date !== today) {
      tracksAddedToday = 0
    }

    const hasLimitReached = tracksAddedToday >= MAX_TRACKS_PER_DAY
    const remainingTracks = Math.max(0, MAX_TRACKS_PER_DAY - tracksAddedToday)

    return {
      hasLimitReached,
      tracksAddedToday,
      remainingTracks,
    }
  } catch (error) {
    console.error('Error checking track limit:', error)
    toast.error('Ошибка при проверке лимита треков')
    return {
      hasLimitReached: false,
      tracksAddedToday: 0,
      remainingTracks: MAX_TRACKS_PER_DAY,
    }
  }
}

// Increment user's track count for the day
export async function incrementTrackCount(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]

    // First, get current profile data
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('tracks_added_today, last_track_date')
      .eq('id', userId)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    // Determine new track count
    let newTrackCount = (profile as Profile).tracks_added_today
    if ((profile as Profile).last_track_date === today) {
      // Same day, increment count
      newTrackCount += 1
    } else {
      // New day, reset to 1
      newTrackCount = 1
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-ignore
      .update({
        tracks_added_today: newTrackCount,
        last_track_date: today,
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return true
  } catch (error) {
    console.error('Error incrementing track count:', error)
    toast.error('Ошибка при обновлении счетчика треков')
    return false
  }
}

// Reset all users' track counts at midnight
export async function resetDailyTrackLimits(): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      // @ts-ignore
      .update({
        tracks_added_today: 0,
      })
      .gt('tracks_added_today', 0)

    if (error) {
      throw new Error(error.message)
    }

    console.log('Daily track limits reset successfully')
  } catch (error) {
    console.error('Error resetting daily track limits:', error)
  }
}

// Get formatted track limit message
export function getTrackLimitMessage(remainingTracks: number): string {
  if (remainingTracks === 0) {
    return 'Вы достигли лимита треков на сегодня'
  }

  if (remainingTracks === 1) {
    return 'Вы можете добавить еще 1 трек сегодня'
  }

  return `Вы можете добавить еще ${remainingTracks} треков сегодня`
}

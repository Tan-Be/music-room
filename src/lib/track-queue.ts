import { supabase } from './supabase'
import { toast } from 'sonner'

// Fetch tracks for a room
export async function fetchRoomTracks(roomId: string) {
  try {
    const { data, error } = await (supabase as any)
      .from('room_queue')
      .select(`
        id,
        track_id,
        position,
        votes_up,
        votes_down,
        added_at,
        added_by,
        tracks (
          title,
          artist,
          duration,
          thumbnail_url
        )
      `)
      .eq('room_id', roomId)
      .order('position', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    // Transform the data to match the Track interface
    const tracks = data.map((item: any) => ({
      id: item.track_id,
      title: item.tracks?.title || 'Unknown Track',
      artist: item.tracks?.artist || 'Unknown Artist',
      duration: item.tracks?.duration || 0,
      thumbnailUrl: item.tracks?.thumbnail_url || undefined,
      votesUp: item.votes_up || 0,
      votesDown: item.votes_down || 0,
      addedBy: {
        id: item.added_by,
        name: 'User' // In a real implementation, we would fetch the user's name
      },
      position: item.position
    }))

    return tracks
  } catch (error) {
    console.error('Error fetching room tracks:', error)
    toast.error('Ошибка при загрузке очереди треков')
    return []
  }
}
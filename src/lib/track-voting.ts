import { supabase } from './supabase'
import { toast } from 'sonner'

// Type for vote value
export type VoteValue = 1 | -1

// Record a user's vote for a track
export async function voteForTrack(
  userId: string,
  roomId: string,
  trackId: string,
  voteValue: VoteValue
): Promise<boolean> {
  try {
    // First, check if user has already voted for this track
    const { data: existingVote, error: fetchError } = await (supabase as any)
      .from('track_votes')
      .select('id, vote_value')
      .match({
        user_id: userId,
        room_id: roomId,
        track_id: trackId,
      })
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      throw new Error(fetchError.message)
    }

    // If user has already voted with the same value, remove the vote (toggle off)
    if (existingVote && existingVote.vote_value === voteValue) {
      const { error: deleteError } = await (supabase as any)
        .from('track_votes')
        .delete()
        .match({
          id: existingVote.id,
        })

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      // Update track vote counts
      await updateTrackVoteCounts(roomId, trackId, voteValue, true) // Remove vote
      return true
    }

    // If user has voted with opposite value, update the vote
    if (existingVote) {
      const { error: updateError } = await (supabase as any)
        .from('track_votes')
        .update({ vote_value: voteValue })
        .match({
          id: existingVote.id,
        })

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Update track vote counts (remove old vote, add new vote)
      await updateTrackVoteCounts(
        roomId,
        trackId,
        existingVote.vote_value,
        true
      ) // Remove old vote
      await updateTrackVoteCounts(roomId, trackId, voteValue, false) // Add new vote
      return true
    }

    // If no existing vote, create a new one
    const { error: insertError } = await (supabase as any)
      .from('track_votes')
      .insert([
        {
          user_id: userId,
          room_id: roomId,
          track_id: trackId,
          vote_value: voteValue,
        },
      ])

    if (insertError) {
      throw new Error(insertError.message)
    }

    // Update track vote counts
    await updateTrackVoteCounts(roomId, trackId, voteValue, false) // Add vote
    return true
  } catch (error) {
    console.error('Error voting for track:', error)
    toast.error('Ошибка при голосовании за трек')
    return false
  }
}

// Update track vote counts in room_queue table
async function updateTrackVoteCounts(
  roomId: string,
  trackId: string,
  voteValue: VoteValue,
  remove: boolean
): Promise<void> {
  try {
    // Get current vote counts
    const { data: queueItem, error: fetchError } = await (supabase as any)
      .from('room_queue')
      .select('id, votes_up, votes_down')
      .match({
        room_id: roomId,
        track_id: trackId,
      })
      .single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    // Calculate new vote counts
    let newVotesUp = queueItem.votes_up
    let newVotesDown = queueItem.votes_down

    if (voteValue === 1) {
      newVotesUp = remove ? newVotesUp - 1 : newVotesUp + 1
    } else {
      newVotesDown = remove ? newVotesDown - 1 : newVotesDown + 1
    }

    // Update vote counts
    const { error: updateError } = await (supabase as any)
      .from('room_queue')
      .update({
        votes_up: newVotesUp,
        votes_down: newVotesDown,
      })
      .match({
        id: queueItem.id,
      })

    if (updateError) {
      throw new Error(updateError.message)
    }
  } catch (error) {
    console.error('Error updating track vote counts:', error)
    throw error
  }
}

// Get user's current vote for a track
export async function getUserVote(
  userId: string,
  roomId: string,
  trackId: string
): Promise<VoteValue | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('track_votes')
      .select('vote_value')
      .match({
        user_id: userId,
        room_id: roomId,
        track_id: trackId,
      })
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No vote found
        return null
      }
      throw new Error(error.message)
    }

    return data.vote_value
  } catch (error) {
    console.error('Error getting user vote:', error)
    return null
  }
}

// Reorder tracks based on vote scores (negative scores go to the end)
export async function reorderTracksByVotes(roomId: string): Promise<boolean> {
  try {
    // Get all tracks in the room queue
    const { data: tracks, error: fetchError } = await (supabase as any)
      .from('room_queue')
      .select('id, track_id, votes_up, votes_down, position')
      .eq('room_id', roomId)
      .order('position', { ascending: true })

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    // Calculate vote scores and sort tracks
    const sortedTracks = [...tracks].sort((a, b) => {
      const scoreA = a.votes_up - a.votes_down
      const scoreB = b.votes_up - b.votes_down

      // Negative scores go to the end
      if (scoreA < 0 && scoreB >= 0) return 1
      if (scoreB < 0 && scoreA >= 0) return -1

      // Both negative or both non-negative: sort by score descending
      return scoreB - scoreA
    })

    // Update positions
    const updates = sortedTracks.map((track, index) =>
      (supabase as any)
        .from('room_queue')
        .update({ position: index })
        .eq('id', track.id)
    )

    // Execute all updates
    const results = await Promise.all(updates)

    for (const result of results) {
      if (result.error) {
        throw new Error(result.error.message)
      }
    }

    return true
  } catch (error) {
    console.error('Error reordering tracks by votes:', error)
    toast.error('Ошибка при переупорядочивании треков')
    return false
  }
}

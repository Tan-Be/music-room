'use client'

import {
  useAuthStore,
  useRoomStore,
  usePlayerStore,
  useChatStore,
} from '@/stores'

// Example component showing how to use the stores
export function StoreUsageExample() {
  // Auth store usage
  const {
    user,
    profile,
    isLoading,
    error,
    setUser,
    setProfile,
    setLoading,
    setError,
    signOut,
  } = useAuthStore()

  // Room store usage
  const {
    currentRoom,
    queue,
    participants,
    isParticipant,
    setCurrentRoom,
    setQueue,
    setParticipants,
    setIsParticipant,
    addTrack,
    removeTrack,
    updateTrackVotes,
    addParticipant,
    removeParticipant,
    updateParticipant,
  } = useRoomStore()

  // Player store usage
  const {
    isPlaying,
    currentTime,
    volume,
    isMuted,
    playbackRate,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    setIsMuted,
    setPlaybackRate,
    togglePlay,
    toggleMute,
  } = usePlayerStore()

  // Chat store usage
  const {
    messages,
    isTyping,
    typingUsers,
    unreadCount,
    addMessage,
    setMessages,
    setIsTyping,
    addTypingUser,
    removeTypingUser,
    setTypingUsers,
    incrementUnreadCount,
    resetUnreadCount,
  } = useChatStore()

  // Example functions showing how to interact with the stores
  const handleLogin = (userData: any) => {
    setUser(userData)
    setProfile(userData.profile)
  }

  const handleLogout = () => {
    signOut()
  }

  const handlePlayPause = () => {
    togglePlay()
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
  }

  const handleAddMessage = (message: any) => {
    addMessage(message)
    incrementUnreadCount()
  }

  const handleAddTrack = (track: any) => {
    addTrack(track)
  }

  const handleRemoveTrack = (trackId: string) => {
    removeTrack(trackId)
  }

  const handleUpdateTrackVotes = (
    trackId: string,
    votesUp: number,
    votesDown: number
  ) => {
    updateTrackVotes(trackId, votesUp, votesDown)
  }

  const handleAddParticipant = (participant: any) => {
    addParticipant(participant)
  }

  const handleRemoveParticipant = (participantId: string) => {
    removeParticipant(participantId)
  }

  const handleUpdateParticipant = (participantId: string, updates: any) => {
    updateParticipant(participantId, updates)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Store Usage Example</h2>

      {/* Auth Section */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold">Auth State</h3>
        <p>User: {user ? user.email : 'Not logged in'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      {/* Room Section */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold">Room State</h3>
        <p>Current Room: {currentRoom ? currentRoom.name : 'None'}</p>
        <p>Participants: {participants.length}</p>
        <p>Queue Items: {queue.length}</p>
        <p>Is Participant: {isParticipant ? 'Yes' : 'No'}</p>
      </div>

      {/* Player Section */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold">Player State</h3>
        <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
        <p>Volume: {volume}</p>
        <p>Muted: {isMuted ? 'Yes' : 'No'}</p>
        <p>Current Time: {currentTime}</p>
        <p>Playback Rate: {playbackRate}</p>
      </div>

      {/* Chat Section */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold">Chat State</h3>
        <p>Messages: {messages.length}</p>
        <p>Unread: {unreadCount}</p>
        <p>Typing: {isTyping ? 'Yes' : 'No'}</p>
        <p>Typing Users: {typingUsers.length}</p>
      </div>
    </div>
  )
}

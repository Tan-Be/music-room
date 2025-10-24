# Zustand Stores

This directory contains all the Zustand stores used in the Music Room application.

## Stores

### useAuthStore
Manages authentication state including user data, profile, loading states, and errors.

### useRoomStore
Manages the current room state including room details, track queue, and participants.

### usePlayerStore
Manages the player state including playback status, current time, volume, and playback rate.

### useChatStore
Manages chat state including messages, typing indicators, and unread message counts.

## Usage

```typescript
import { useAuthStore, useRoomStore, usePlayerStore, useChatStore } from '@/stores'

// In a component
const user = useAuthStore(state => state.user)
const currentRoom = useRoomStore(state => state.currentRoom)
const isPlaying = usePlayerStore(state => state.isPlaying)
const messages = useChatStore(state => state.messages)
```
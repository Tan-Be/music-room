# Project Structure

## Directory Structure

```
src/
├── app/                 # Next.js App Router pages and layouts
│   ├── (auth)/         # Authentication routes (login, register, callback)
│   ├── room/[id]/      # Dynamic room page
│   ├── rooms/create/   # Room creation interface
│   └── ...             # Other pages
├── components/         # UI components organized by feature
│   ├── auth/           # Login forms, Spotify button, profile
│   ├── room/           # Chat, queue, search, participant management
│   ├── layout/         # Header, sidebar, navigation
│   ├── ui/             # shadcn/ui base components
│   └── ...             # Other component categories
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Core logic and utilities
├── stores/             # Zustand stores for state management
├── styles/             # Global styles and CSS
├── types/              # TypeScript type definitions
└── middleware.ts       # Next.js middleware
```

## Key Directories

### `src/app/`
Contains all Next.js App Router pages and layouts using the file-system based routing.

### `src/components/`
UI components organized by feature. Each subdirectory contains related components:
- `auth/` - Authentication related components
- `room/` - Room-specific components (chat, queue, etc.)
- `layout/` - Global layout components (header, sidebar)
- `ui/` - Reusable UI components (shadcn/ui)

### `src/contexts/`
React context providers for global state management.

### `src/hooks/`
Custom React hooks for reusable logic.

### `src/lib/`
Core application logic including:
- Supabase client configuration
- Authentication utilities
- Room management
- Realtime services
- Utility functions

### `src/stores/`
Zustand stores for client-side state management:
- `useAuthStore` - Authentication state
- `useRoomStore` - Room state (current room, queue, participants)
- `usePlayerStore` - Player state (playback, volume, etc.)
- `useChatStore` - Chat state (messages, typing indicators)

### `src/styles/`
Global styles and Tailwind CSS configuration.

### `src/types/`
TypeScript type definitions used throughout the application.

### `src/middleware.ts`
Next.js middleware for request handling and authentication.
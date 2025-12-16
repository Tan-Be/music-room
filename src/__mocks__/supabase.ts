// Улучшенный мок для Supabase
export const supabase = {
  auth: {
    getSession: jest.fn(() => Promise.resolve({ 
      data: { session: null }, 
      error: null 
    })),
    getUser: jest.fn(() => Promise.resolve({ 
      data: { user: null }, 
      error: null 
    })),
    signInWithPassword: jest.fn(() => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: null 
    })),
    signUp: jest.fn(() => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: null 
    })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: jest.fn(() => ({ 
      data: { 
        subscription: { 
          unsubscribe: jest.fn() 
        } 
      } 
    })),
    signInWithOAuth: jest.fn(() => Promise.resolve({ 
      data: { url: 'https://test-oauth-url.com' }, 
      error: null 
    })),
  },
  from: jest.fn((table: string) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ 
      data: getMockData(table), 
      error: null 
    })),
    maybeSingle: jest.fn(() => Promise.resolve({ 
      data: getMockData(table), 
      error: null 
    })),
    then: jest.fn((callback) => callback({ 
      data: [getMockData(table)], 
      error: null 
    })),
  })),
  channel: jest.fn((name: string) => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(() => Promise.resolve({ status: 'SUBSCRIBED' })),
    unsubscribe: jest.fn(() => Promise.resolve({ status: 'CLOSED' })),
    send: jest.fn(() => Promise.resolve()),
  })),
  storage: {
    from: jest.fn((bucket: string) => ({
      upload: jest.fn(() => Promise.resolve({ 
        data: { path: 'test-path/file.jpg' }, 
        error: null 
      })),
      remove: jest.fn(() => Promise.resolve({ 
        data: null, 
        error: null 
      })),
      getPublicUrl: jest.fn((path: string) => ({ 
        data: { publicUrl: `https://test.supabase.co/storage/v1/object/public/${bucket}/${path}` } 
      })),
      list: jest.fn(() => Promise.resolve({ 
        data: [], 
        error: null 
      })),
    })),
  },
}

// Функция для получения моковых данных по таблице
function getMockData(table: string) {
  const mockData: Record<string, any> = {
    profiles: {
      id: 'test-user-id',
      username: 'testuser',
      avatar_url: 'https://test.com/avatar.jpg',
      spotify_id: null,
      tracks_added_today: 0,
      last_track_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    rooms: {
      id: 'test-room-id',
      name: 'Test Room',
      description: 'Test room description',
      is_public: true,
      password_hash: null,
      max_participants: 10,
      owner_id: 'test-user-id',
      current_track_id: null,
      is_playing: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    tracks: {
      id: 'test-track-id',
      title: 'Test Track',
      artist: 'Test Artist',
      duration: 180,
      thumbnail_url: 'https://test.com/track.jpg',
      spotify_id: null,
      youtube_id: null,
      added_by: 'test-user-id',
      created_at: new Date().toISOString(),
    },
    chat_messages: {
      id: 'test-message-id',
      room_id: 'test-room-id',
      user_id: 'test-user-id',
      message: 'Test message',
      created_at: new Date().toISOString(),
    },
    room_participants: {
      id: 'test-participant-id',
      room_id: 'test-room-id',
      user_id: 'test-user-id',
      role: 'member',
      joined_at: new Date().toISOString(),
    },
    room_queue: {
      id: 'test-queue-id',
      room_id: 'test-room-id',
      track_id: 'test-track-id',
      added_by: 'test-user-id',
      position: 1,
      votes_up: 0,
      votes_down: 0,
      added_at: new Date().toISOString(),
    },
  }
  
  return mockData[table] || {}
}

// Экспорт типов для совместимости
export type Database = any
export type Profile = any
export type Room = any
export type Track = any

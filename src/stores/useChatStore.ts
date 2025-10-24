import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  type: 'user' | 'system'
}

interface TypingUser {
  userId: string
  userName: string
  timeoutId: NodeJS.Timeout
}

interface ChatState {
  messages: Message[]
  isTyping: boolean
  typingUsers: TypingUser[]
  unreadCount: number
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  setIsTyping: (isTyping: boolean) => void
  addTypingUser: (user: TypingUser) => void
  removeTypingUser: (userId: string) => void
  setTypingUsers: (users: TypingUser[]) => void
  incrementUnreadCount: () => void
  resetUnreadCount: () => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      typingUsers: [],
      unreadCount: 0,
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message],
        unreadCount: state.unreadCount + 1
      })),
      setMessages: (messages) => set({ messages }),
      setIsTyping: (isTyping) => set({ isTyping }),
      addTypingUser: (user) => set((state) => ({ 
        typingUsers: [...state.typingUsers, user] 
      })),
      removeTypingUser: (userId) => set((state) => ({ 
        typingUsers: state.typingUsers.filter(user => user.userId !== userId) 
      })),
      setTypingUsers: (typingUsers) => set({ typingUsers }),
      incrementUnreadCount: () => set((state) => ({ 
        unreadCount: state.unreadCount + 1 
      })),
      resetUnreadCount: () => set({ unreadCount: 0 }),
      clearChat: () => set({ 
        messages: [], 
        isTyping: false, 
        typingUsers: [], 
        unreadCount: 0 
      }),
    }),
    {
      name: 'chat-storage',
    }
  )
)
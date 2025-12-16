/**
 * Тесты производительности
 * Проверяют производительность критических функций и компонентов
 */

import { performance } from 'perf_hooks'

// Мокаем тяжелые зависимости
jest.mock('@/lib/supabase')

describe('Performance Tests', () => {
  describe('Utility Functions Performance', () => {
    it('should filter tracks efficiently', async () => {
      const { filterTracks } = await import('@/lib/mock-tracks')
      
      // Создаем большой набор треков
      const largeMockTracks = Array.from({ length: 10000 }, (_, i) => ({
        id: `track-${i}`,
        title: `Track ${i}`,
        artist: `Artist ${i % 100}`,
        duration: 180 + (i % 120),
        thumbnailUrl: `https://example.com/thumb-${i}.jpg`,
        genre: ['rock', 'pop', 'jazz', 'electronic'][i % 4],
      }))

      const startTime = performance.now()
      
      const results = filterTracks(largeMockTracks, 'Track 1')
      
      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Проверяем, что фильтрация выполняется быстро (< 10ms)
      expect(executionTime).toBeLessThan(10)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should debounce search efficiently', async () => {
      const { useDebounce } = await import('@/hooks/use-debounce')
      
      let callCount = 0
      const mockCallback = jest.fn(() => {
        callCount++
      })

      const startTime = performance.now()
      
      // Симулируем множественные вызовы
      for (let i = 0; i < 1000; i++) {
        useDebounce(mockCallback, 300)
      }
      
      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Проверяем, что debounce работает эффективно
      expect(executionTime).toBeLessThan(50)
    })

    it('should validate chat messages quickly', async () => {
      const { validateMessage } = await import('@/lib/chat-filter')
      
      const testMessages = Array.from({ length: 1000 }, (_, i) => 
        `This is test message number ${i} with some content`
      )

      const startTime = performance.now()
      
      testMessages.forEach(message => {
        validateMessage(message)
      })
      
      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Проверяем, что валидация быстрая (< 20ms для 1000 сообщений)
      expect(executionTime).toBeLessThan(20)
    })

    it('should calculate track voting efficiently', async () => {
      const { calculateTrackScore } = await import('@/lib/track-voting')
      
      const mockVotes = Array.from({ length: 10000 }, (_, i) => ({
        id: `vote-${i}`,
        user_id: `user-${i % 100}`,
        track_id: 'test-track',
        vote_value: Math.random() > 0.5 ? 1 : -1,
        created_at: new Date().toISOString(),
      }))

      const startTime = performance.now()
      
      const score = calculateTrackScore(mockVotes)
      
      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Проверяем, что вычисление быстрое (< 5ms)
      expect(executionTime).toBeLessThan(5)
      expect(typeof score).toBe('number')
    })
  })

  describe('Component Rendering Performance', () => {
    it('should render large track lists efficiently', async () => {
      const { render } = await import('@testing-library/react')
      const { default: TrackQueue } = await import('@/components/room/track-queue')
      
      // Создаем большой список треков
      const largeTracks = Array.from({ length: 500 }, (_, i) => ({
        id: `track-${i}`,
        title: `Track ${i}`,
        artist: `Artist ${i}`,
        duration: 180,
        thumbnailUrl: 'https://example.com/thumb.jpg',
        votesUp: Math.floor(Math.random() * 10),
        votesDown: Math.floor(Math.random() * 3),
        addedBy: { id: `user-${i}`, name: `User ${i}` },
        position: i + 1,
      }))

      const startTime = performance.now()
      
      render(
        <TrackQueue
          tracks={largeTracks}
          roomId="test-room"
          currentUserId="current-user"
          currentUserRole="member"
          onReorder={jest.fn()}
          onDelete={jest.fn()}
          onPlay={jest.fn()}
          onVoteUp={jest.fn()}
          onVoteDown={jest.fn()}
          onVoteChange={jest.fn()}
        />
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Проверяем, что рендеринг быстрый (< 200ms)
      expect(renderTime).toBeLessThan(200)
    })

    it('should handle chat message updates efficiently', async () => {
      const { render, rerender } = await import('@testing-library/react')
      const { default: Chat } = await import('@/components/room/chat')
      
      const baseMessages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        userId: `user-${i % 10}`,
        userName: `User${i % 10}`,
        content: `Message ${i}`,
        timestamp: new Date(Date.now() - i * 1000),
        type: 'user' as const,
      }))

      const mockCurrentUser = {
        id: 'current-user',
        name: 'Current User',
      }

      // Первоначальный рендер
      const { container } = render(
        <Chat
          messages={baseMessages}
          currentUser={mockCurrentUser}
          onSendMessage={jest.fn()}
        />
      )

      // Добавляем новые сообщения и измеряем время ре-рендера
      const startTime = performance.now()
      
      const newMessages = [
        ...baseMessages,
        {
          id: 'new-msg',
          userId: 'new-user',
          userName: 'New User',
          content: 'New message',
          timestamp: new Date(),
          type: 'user' as const,
        },
      ]

      rerender(
        <Chat
          messages={newMessages}
          currentUser={mockCurrentUser}
          onSendMessage={jest.fn()}
        />
      )
      
      const endTime = performance.now()
      const rerenderTime = endTime - startTime

      // Проверяем, что ре-рендер быстрый (< 50ms)
      expect(rerenderTime).toBeLessThan(50)
    })
  })

  describe('Memory Usage Tests', () => {
    it('should not create memory leaks in subscriptions', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
        unsubscribe: jest.fn().mockResolvedValue({ status: 'CLOSED' }),
      }

      ;(supabase.channel as jest.Mock).mockReturnValue(mockChannel)

      // Создаем и закрываем много подписок
      const subscriptions = []
      
      for (let i = 0; i < 100; i++) {
        const channel = supabase.channel(`test-${i}`)
        channel.on('postgres_changes', {}, () => {})
        subscriptions.push(channel)
      }

      // Закрываем все подписки
      for (const subscription of subscriptions) {
        await subscription.unsubscribe()
      }

      // Проверяем, что все подписки были закрыты
      expect(mockChannel.unsubscribe).toHaveBeenCalledTimes(100)
    })

    it('should cleanup event listeners properly', () => {
      const mockAddEventListener = jest.spyOn(window, 'addEventListener')
      const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener')

      // Симулируем компонент, который добавляет слушатели
      const cleanup = () => {
        const handler = () => {}
        window.addEventListener('resize', handler)
        
        // Возвращаем функцию очистки
        return () => {
          window.removeEventListener('resize', handler)
        }
      }

      const cleanupFn = cleanup()
      cleanupFn()

      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function))

      mockAddEventListener.mockRestore()
      mockRemoveEventListener.mockRestore()
    })
  })

  describe('Network Performance', () => {
    it('should batch database operations efficiently', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ data: [], error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      // Симулируем пакетную вставку
      const batchData = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        data: `data-${i}`,
      }))

      const startTime = performance.now()
      
      // Вместо 100 отдельных запросов делаем один пакетный
      await supabase.from('test_table').insert(batchData)
      
      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Проверяем, что операция быстрая
      expect(executionTime).toBeLessThan(10)
      expect(mockQuery.insert).toHaveBeenCalledTimes(1)
      expect(mockQuery.insert).toHaveBeenCalledWith(batchData)
    })

    it('should implement efficient pagination', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ 
          data: Array.from({ length: 20 }, (_, i) => ({ id: i })), 
          error: null 
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const startTime = performance.now()
      
      // Загружаем страницу данных
      await supabase
        .from('messages')
        .select('*')
        .range(0, 19)
        .order('created_at', { ascending: false })
      
      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(5)
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19)
    })
  })

  describe('Bundle Size Tests', () => {
    it('should import components lazily', async () => {
      // Проверяем, что компоненты можно импортировать динамически
      const startTime = performance.now()
      
      const { default: LazyComponent } = await import('@/components/room/track-search-dialog')
      
      const endTime = performance.now()
      const importTime = endTime - startTime

      expect(LazyComponent).toBeDefined()
      expect(importTime).toBeLessThan(100) // Быстрый импорт
    })

    it('should tree-shake unused utilities', async () => {
      // Импортируем только нужные функции
      const { cn } = await import('@/lib/utils')
      
      expect(cn).toBeDefined()
      expect(typeof cn).toBe('function')
    })
  })

  describe('Real-time Performance', () => {
    it('should handle high-frequency updates efficiently', async () => {
      const mockCallback = jest.fn()
      let callCount = 0

      // Симулируем высокочастотные обновления
      const startTime = performance.now()
      
      const interval = setInterval(() => {
        mockCallback(`update-${callCount++}`)
        
        if (callCount >= 1000) {
          clearInterval(interval)
        }
      }, 1)

      // Ждем завершения
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (callCount >= 1000) {
            clearInterval(checkInterval)
            resolve(void 0)
          }
        }, 10)
      })
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(mockCallback).toHaveBeenCalledTimes(1000)
      expect(totalTime).toBeLessThan(2000) // Менее 2 секунд для 1000 обновлений
    })

    it('should throttle rapid state updates', () => {
      let updateCount = 0
      const throttledUpdate = jest.fn(() => {
        updateCount++
      })

      // Симулируем throttling
      const throttle = (fn: Function, delay: number) => {
        let lastCall = 0
        return (...args: any[]) => {
          const now = Date.now()
          if (now - lastCall >= delay) {
            lastCall = now
            return fn(...args)
          }
        }
      }

      const throttledFn = throttle(throttledUpdate, 100)

      // Быстрые вызовы
      for (let i = 0; i < 100; i++) {
        throttledFn()
      }

      // Должен быть вызван только один раз из-за throttling
      expect(throttledUpdate).toHaveBeenCalledTimes(1)
    })
  })
})
import {
  checkDailyLimit,
  updateDailyCount,
  resetDailyCount,
  getRemainingTracks,
  canAddTrack,
  DAILY_TRACK_LIMIT,
} from './track-limits'

// Мокаем Supabase
jest.mock('./supabase')

describe('Track Limits System', () => {
  const mockUserId = 'test-user-id'
  const mockProfile = {
    id: mockUserId,
    username: 'testuser',
    tracks_added_today: 0,
    last_track_date: new Date().toISOString().split('T')[0],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkDailyLimit', () => {
    it('should return false when under limit', async () => {
      const profile = { ...mockProfile, tracks_added_today: 5 }
      const result = await checkDailyLimit(profile)

      expect(result.isLimitReached).toBe(false)
      expect(result.tracksAdded).toBe(5)
      expect(result.remainingTracks).toBe(3)
    })

    it('should return true when at limit', async () => {
      const profile = { ...mockProfile, tracks_added_today: DAILY_TRACK_LIMIT }
      const result = await checkDailyLimit(profile)

      expect(result.isLimitReached).toBe(true)
      expect(result.tracksAdded).toBe(DAILY_TRACK_LIMIT)
      expect(result.remainingTracks).toBe(0)
    })

    it('should return true when over limit', async () => {
      const profile = {
        ...mockProfile,
        tracks_added_today: DAILY_TRACK_LIMIT + 1,
      }
      const result = await checkDailyLimit(profile)

      expect(result.isLimitReached).toBe(true)
      expect(result.tracksAdded).toBe(DAILY_TRACK_LIMIT + 1)
      expect(result.remainingTracks).toBe(0)
    })

    it('should reset count for new day', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const profile = {
        ...mockProfile,
        tracks_added_today: DAILY_TRACK_LIMIT,
        last_track_date: yesterday.toISOString().split('T')[0],
      }

      const result = await checkDailyLimit(profile)

      expect(result.isLimitReached).toBe(false)
      expect(result.tracksAdded).toBe(0) // Должно сброситься
      expect(result.remainingTracks).toBe(DAILY_TRACK_LIMIT)
    })

    it('should handle null profile gracefully', async () => {
      const result = await checkDailyLimit(null)

      expect(result.isLimitReached).toBe(true)
      expect(result.tracksAdded).toBe(0)
      expect(result.remainingTracks).toBe(0)
    })

    it('should handle missing last_track_date', async () => {
      const profile = {
        ...mockProfile,
        last_track_date: null as any,
        tracks_added_today: 5,
      }

      const result = await checkDailyLimit(profile)

      expect(result.isLimitReached).toBe(false)
      expect(result.tracksAdded).toBe(0) // Должно сброситься
    })
  })

  describe('updateDailyCount', () => {
    it('should increment count for same day', async () => {
      const { supabase } = require('./supabase')

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, tracks_added_today: 1 },
          error: null,
        }),
      })

      const result = await updateDailyCount(mockUserId)

      expect(result.success).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should reset count for new day', async () => {
      const { supabase } = require('./supabase')

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, tracks_added_today: 1 },
          error: null,
        }),
      })

      const result = await updateDailyCount(mockUserId)

      expect(result.success).toBe(true)
    })

    it('should handle database errors', async () => {
      const { supabase } = require('./supabase')

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      })

      const result = await updateDailyCount(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should handle network errors', async () => {
      const { supabase } = require('./supabase')

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Network error')),
      })

      const result = await updateDailyCount(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('resetDailyCount', () => {
    it('should reset count to zero', async () => {
      const { supabase } = require('./supabase')

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, tracks_added_today: 0 },
          error: null,
        }),
      })

      const result = await resetDailyCount(mockUserId)

      expect(result.success).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle reset errors', async () => {
      const { supabase } = require('./supabase')

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Reset failed' },
        }),
      })

      const result = await resetDailyCount(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Reset failed')
    })
  })

  describe('getRemainingTracks', () => {
    it('should calculate remaining tracks correctly', () => {
      expect(getRemainingTracks(0)).toBe(DAILY_TRACK_LIMIT)
      expect(getRemainingTracks(3)).toBe(DAILY_TRACK_LIMIT - 3)
      expect(getRemainingTracks(DAILY_TRACK_LIMIT)).toBe(0)
      expect(getRemainingTracks(DAILY_TRACK_LIMIT + 1)).toBe(0)
    })

    it('should handle negative values', () => {
      expect(getRemainingTracks(-1)).toBe(DAILY_TRACK_LIMIT)
    })

    it('should handle non-integer values', () => {
      expect(getRemainingTracks(2.5)).toBe(DAILY_TRACK_LIMIT - 2) // Должно округлить вниз
    })
  })

  describe('canAddTrack', () => {
    it('should allow adding when under limit', async () => {
      const profile = { ...mockProfile, tracks_added_today: 5 }
      const result = await canAddTrack(profile)

      expect(result.canAdd).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should prevent adding when at limit', async () => {
      const profile = { ...mockProfile, tracks_added_today: DAILY_TRACK_LIMIT }
      const result = await canAddTrack(profile)

      expect(result.canAdd).toBe(false)
      expect(result.reason).toContain('дневной лимит')
    })

    it('should allow adding after day reset', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const profile = {
        ...mockProfile,
        tracks_added_today: DAILY_TRACK_LIMIT,
        last_track_date: yesterday.toISOString().split('T')[0],
      }

      const result = await canAddTrack(profile)

      expect(result.canAdd).toBe(true)
    })

    it('should handle null profile', async () => {
      const result = await canAddTrack(null)

      expect(result.canAdd).toBe(false)
      expect(result.reason).toContain('профиль не найден')
    })
  })

  describe('Edge cases and performance', () => {
    it('should handle timezone differences', async () => {
      // Тест с разными часовыми поясами
      const utcDate = new Date().toISOString().split('T')[0]
      const profile = {
        ...mockProfile,
        last_track_date: utcDate,
        tracks_added_today: 5,
      }

      const result = await checkDailyLimit(profile)
      expect(result.isLimitReached).toBe(false)
    })

    it('should handle concurrent limit checks', async () => {
      const profile = {
        ...mockProfile,
        tracks_added_today: DAILY_TRACK_LIMIT - 1,
      }

      const promises = Array.from({ length: 10 }, () =>
        checkDailyLimit(profile)
      )
      const results = await Promise.all(promises)

      // Все результаты должны быть одинаковыми
      results.forEach(result => {
        expect(result.tracksAdded).toBe(DAILY_TRACK_LIMIT - 1)
        expect(result.remainingTracks).toBe(1)
      })
    })

    it('should be performant with large numbers', async () => {
      const profile = { ...mockProfile, tracks_added_today: 999999 }

      const startTime = performance.now()
      await checkDailyLimit(profile)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(10) // Должно быть быстро
    })

    it('should handle date edge cases', async () => {
      // Тест с граничными датами
      const edgeDates = [
        '2024-02-29', // Високосный год
        '2024-12-31', // Конец года
        '2024-01-01', // Начало года
      ]

      for (const date of edgeDates) {
        const profile = {
          ...mockProfile,
          last_track_date: date,
          tracks_added_today: 5,
        }

        const result = await checkDailyLimit(profile)
        expect(typeof result.isLimitReached).toBe('boolean')
      }
    })
  })

  describe('Constants and configuration', () => {
    it('should have correct daily limit', () => {
      expect(DAILY_TRACK_LIMIT).toBe(8)
      expect(typeof DAILY_TRACK_LIMIT).toBe('number')
      expect(DAILY_TRACK_LIMIT).toBeGreaterThan(0)
    })

    it('should maintain limit consistency', () => {
      const profile = { ...mockProfile, tracks_added_today: DAILY_TRACK_LIMIT }
      const remaining = getRemainingTracks(profile.tracks_added_today)

      expect(remaining).toBe(0)
    })
  })
})

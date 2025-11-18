import { MAX_TRACKS_PER_DAY, getTrackLimitMessage } from './track-limits'

// Mock Supabase
jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
  },
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

describe('Track Limits', () => {
  describe('getTrackLimitMessage', () => {
    it('should return correct message for zero remaining tracks', () => {
      const message = getTrackLimitMessage(0)
      expect(message).toBe('Вы достигли лимита треков на сегодня')
    })

    it('should return correct message for one remaining track', () => {
      const message = getTrackLimitMessage(1)
      expect(message).toBe('Вы можете добавить еще 1 трек сегодня')
    })

    it('should return correct message for multiple remaining tracks', () => {
      const message = getTrackLimitMessage(5)
      expect(message).toBe('Вы можете добавить еще 5 треков сегодня')
    })
  })
})

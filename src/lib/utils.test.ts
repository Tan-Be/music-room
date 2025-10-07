import { 
  formatRelativeTime, 
  formatDuration, 
  truncateString, 
  generateId, 
  isEmpty 
} from './utils'

describe('Utils', () => {
  describe('formatRelativeTime', () => {
    it('should format seconds correctly', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 30 * 1000) // 30 seconds ago
      expect(formatRelativeTime(past)).toBe('30 секунд назад')
    })

    it('should format minutes correctly', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
      expect(formatRelativeTime(past)).toBe('5 минут назад')
    })

    it('should format hours correctly', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 3 * 60 * 60 * 1000) // 3 hours ago
      expect(formatRelativeTime(past)).toBe('3 часов назад')
    })

    it('should format days correctly', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      expect(formatRelativeTime(past)).toBe('2 дней назад')
    })
  })

  describe('formatDuration', () => {
    it('should format milliseconds to MM:SS format', () => {
      expect(formatDuration(30000)).toBe('0:30') // 30 seconds
      expect(formatDuration(90000)).toBe('1:30') // 1 minute 30 seconds
      expect(formatDuration(3661000)).toBe('61:01') // 61 minutes 1 second
    })
  })

  describe('truncateString', () => {
    it('should truncate string when it exceeds max length', () => {
      expect(truncateString('This is a long string', 10)).toBe('This is a ...')
    })

    it('should not truncate string when it is within max length', () => {
      expect(truncateString('Short', 10)).toBe('Short')
    })
  })

  describe('generateId', () => {
    it('should generate a random ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(id1.length).toBe(8)
    })

    it('should generate ID with specified length', () => {
      const id = generateId(12)
      expect(id.length).toBe(12)
    })
  })

  describe('isEmpty', () => {
    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
    })

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('should return false for non-empty values', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty({ key: 'value' })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })
})
import { filterProfanity, isMessageTooLong, validateMessage, MAX_MESSAGE_LENGTH } from './chat-filter'

describe('chat-filter', () => {
  describe('filterProfanity', () => {
    it('should filter profanity words', () => {
      const input = 'Это блядь плохое слово'
      const expected = 'Это **** плохое слово'
      expect(filterProfanity(input)).toBe(expected)
    })

    it('should filter multiple profanity words', () => {
      const input = 'Блядь, хуй и пизда - это плохие слова'
      const expected = '****, **** и ***** - это плохие слова'
      expect(filterProfanity(input)).toBe(expected)
    })

    it('should not filter non-profanity words', () => {
      const input = 'Это обычное сообщение без нецензурной лексики'
      expect(filterProfanity(input)).toBe(input)
    })
  })

  describe('isMessageTooLong', () => {
    it('should return false for messages within limit', () => {
      const message = 'a'.repeat(MAX_MESSAGE_LENGTH)
      expect(isMessageTooLong(message)).toBe(false)
    })

    it('should return true for messages exceeding limit', () => {
      const message = 'a'.repeat(MAX_MESSAGE_LENGTH + 1)
      expect(isMessageTooLong(message)).toBe(true)
    })
  })

  describe('validateMessage', () => {
    it('should return invalid for empty messages', () => {
      const result = validateMessage('', 0)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Сообщение не может быть пустым')
    })

    it('should return invalid for messages that are too long', () => {
      const message = 'a'.repeat(MAX_MESSAGE_LENGTH + 1)
      const result = validateMessage(message, 0)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Сообщение слишком длинное')
    })

    it('should return invalid for messages sent too frequently', () => {
      const now = Date.now()
      const result = validateMessage('Test message', now - 500) // 500ms ago
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Пожалуйста, подождите перед отправкой следующего сообщения')
    })

    it('should return valid for proper messages', () => {
      const result = validateMessage('Test message', Date.now() - 2000) // 2 seconds ago
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })
})
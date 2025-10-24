import { systemMessages } from './system-messages'

describe('systemMessages', () => {
  describe('generateUserJoinedMessage', () => {
    it('should generate correct user joined message', () => {
      const message = systemMessages.generateUserJoinedMessage('Alice')
      expect(message).toBe('Alice присоединился к комнате')
    })
  })

  describe('generateUserLeftMessage', () => {
    it('should generate correct user left message', () => {
      const message = systemMessages.generateUserLeftMessage('Bob')
      expect(message).toBe('Bob покинул комнату')
    })
  })

  describe('generateTrackAddedMessage', () => {
    it('should generate correct track added message', () => {
      const message = systemMessages.generateTrackAddedMessage('Alice', 'Bohemian Rhapsody')
      expect(message).toBe('Alice добавил трек "Bohemian Rhapsody"')
    })
  })

  describe('generateTrackRemovedMessage', () => {
    it('should generate correct track removed message', () => {
      const message = systemMessages.generateTrackRemovedMessage('Bob', 'Stairway to Heaven')
      expect(message).toBe('Bob удалил трек "Stairway to Heaven"')
    })
  })

  describe('generatePlaybackStartedMessage', () => {
    it('should generate correct playback started message', () => {
      const message = systemMessages.generatePlaybackStartedMessage()
      expect(message).toBe('Воспроизведение начато')
    })
  })

  describe('generatePlaybackPausedMessage', () => {
    it('should generate correct playback paused message', () => {
      const message = systemMessages.generatePlaybackPausedMessage()
      expect(message).toBe('Воспроизведение приостановлено')
    })
  })

  describe('generateTrackSkippedMessage', () => {
    it('should generate correct track skipped message', () => {
      const message = systemMessages.generateTrackSkippedMessage('Charlie')
      expect(message).toBe('Charlie пропустил трек')
    })
  })

  describe('generateUserKickedMessage', () => {
    it('should generate correct user kicked message', () => {
      const message = systemMessages.generateUserKickedMessage('David', 'Alice')
      expect(message).toBe('David был исключен из комнаты пользователем Alice')
    })
  })

  describe('generateUserBannedMessage', () => {
    it('should generate correct user banned message', () => {
      const message = systemMessages.generateUserBannedMessage('Eve', 'Bob')
      expect(message).toBe('Eve был забанен пользователем Bob')
    })
  })

  describe('generateRoomCreatedMessage', () => {
    it('should generate correct room created message', () => {
      const message = systemMessages.generateRoomCreatedMessage('Rock Classics', 'Charlie')
      expect(message).toBe('Комната "Rock Classics" создана пользователем Charlie')
    })
  })

  describe('generateRoomDeletedMessage', () => {
    it('should generate correct room deleted message', () => {
      const message = systemMessages.generateRoomDeletedMessage('Jazz Lounge')
      expect(message).toBe('Комната "Jazz Lounge" удалена')
    })
  })
})
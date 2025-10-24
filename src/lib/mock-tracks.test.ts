import { mockTracks, MockTrack } from './mock-tracks'

describe('mockTracks', () => {
  it('should have 50 tracks', () => {
    expect(mockTracks).toHaveLength(50)
  })

  it('should have tracks with required properties', () => {
    mockTracks.forEach((track: MockTrack) => {
      expect(track).toHaveProperty('id')
      expect(track).toHaveProperty('title')
      expect(track).toHaveProperty('artist')
      expect(track).toHaveProperty('duration')
      expect(track).toHaveProperty('thumbnail_url')
    })
  })

  it('should have tracks with duration not exceeding 360 seconds', () => {
    mockTracks.forEach((track: MockTrack) => {
      expect(track.duration).toBeLessThanOrEqual(360)
    })
  })

  it('should have tracks with valid genres', () => {
    const validGenres = ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'reggae', 'metal', 'alternative', 'country']
    
    mockTracks.forEach((track: MockTrack) => {
      if (track.genre) {
        expect(validGenres).toContain(track.genre)
      }
    })
  })

  it('should have unique track IDs', () => {
    const ids = mockTracks.map((track: MockTrack) => track.id)
    const uniqueIds = Array.from(new Set(ids))
    expect(ids).toHaveLength(uniqueIds.length)
  })

  it('should have non-empty title and artist fields', () => {
    mockTracks.forEach((track: MockTrack) => {
      expect(track.title).toBeTruthy()
      expect(track.artist).toBeTruthy()
    })
  })

  it('should have valid thumbnail URLs', () => {
    mockTracks.forEach((track: MockTrack) => {
      expect(track.thumbnail_url).toMatch(/^https?:\/\/.+/)
    })
  })
})
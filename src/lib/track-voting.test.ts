import { VoteValue } from './track-voting'

describe('Track Voting', () => {
  describe('VoteValue type', () => {
    it('should only allow 1 or -1 as values', () => {
      // This is more of a type-level test
      const upVote: VoteValue = 1
      const downVote: VoteValue = -1
      
      expect(upVote).toBe(1)
      expect(downVote).toBe(-1)
    })
  })
})
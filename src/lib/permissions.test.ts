import {
  checkPermissions,
  hasPermission,
  canPerformAction,
} from './permissions'

describe('Permissions System', () => {
  describe('checkPermissions', () => {
    it('should return correct permissions for owner', () => {
      const permissions = checkPermissions('owner')

      expect(permissions).toEqual({
        canAddTracks: true,
        canRemoveTracks: true,
        canControlPlayback: true,
        canKickUsers: true,
        canAssignModerators: true,
        canDeleteRoom: true,
      })
    })

    it('should return correct permissions for moderator', () => {
      const permissions = checkPermissions('moderator')

      expect(permissions).toEqual({
        canAddTracks: true,
        canRemoveTracks: true,
        canControlPlayback: true,
        canKickUsers: true,
        canAssignModerators: false,
        canDeleteRoom: false,
      })
    })

    it('should return correct permissions for member', () => {
      const permissions = checkPermissions('member')

      expect(permissions).toEqual({
        canAddTracks: true,
        canRemoveTracks: false,
        canControlPlayback: false,
        canKickUsers: false,
        canAssignModerators: false,
        canDeleteRoom: false,
      })
    })

    it('should return correct permissions for guest', () => {
      const permissions = checkPermissions('guest')

      expect(permissions).toEqual({
        canAddTracks: false,
        canRemoveTracks: false,
        canControlPlayback: false,
        canKickUsers: false,
        canAssignModerators: false,
        canDeleteRoom: false,
      })
    })

    it('should handle invalid role gracefully', () => {
      const permissions = checkPermissions('invalid' as any)

      expect(permissions).toEqual({
        canAddTracks: false,
        canRemoveTracks: false,
        canControlPlayback: false,
        canKickUsers: false,
        canAssignModerators: false,
        canDeleteRoom: false,
      })
    })
  })

  describe('hasPermission', () => {
    it('should return true when user has permission', () => {
      expect(hasPermission('owner', 'canDeleteRoom')).toBe(true)
      expect(hasPermission('moderator', 'canKickUsers')).toBe(true)
      expect(hasPermission('member', 'canAddTracks')).toBe(true)
    })

    it('should return false when user lacks permission', () => {
      expect(hasPermission('member', 'canDeleteRoom')).toBe(false)
      expect(hasPermission('guest', 'canAddTracks')).toBe(false)
      expect(hasPermission('moderator', 'canDeleteRoom')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(hasPermission('owner', 'invalidPermission' as any)).toBe(false)
      expect(hasPermission('invalidRole' as any, 'canAddTracks')).toBe(false)
    })
  })

  describe('canPerformAction', () => {
    const mockUser = {
      id: 'user-1',
      role: 'member' as const,
    }

    const mockRoom = {
      id: 'room-1',
      ownerId: 'owner-1',
    }

    it('should allow owner to perform any action', () => {
      const ownerUser = { ...mockUser, id: 'owner-1', role: 'owner' as const }

      expect(canPerformAction(ownerUser, mockRoom, 'deleteRoom')).toBe(true)
      expect(canPerformAction(ownerUser, mockRoom, 'kickUser')).toBe(true)
      expect(canPerformAction(ownerUser, mockRoom, 'addTrack')).toBe(true)
    })

    it('should respect role-based permissions', () => {
      const memberUser = { ...mockUser, role: 'member' as const }

      expect(canPerformAction(memberUser, mockRoom, 'addTrack')).toBe(true)
      expect(canPerformAction(memberUser, mockRoom, 'deleteRoom')).toBe(false)
      expect(canPerformAction(memberUser, mockRoom, 'kickUser')).toBe(false)
    })

    it('should handle room ownership correctly', () => {
      const roomOwner = { ...mockUser, id: 'owner-1' }
      const nonOwner = { ...mockUser, id: 'user-2' }

      expect(canPerformAction(roomOwner, mockRoom, 'deleteRoom')).toBe(true)
      expect(canPerformAction(nonOwner, mockRoom, 'deleteRoom')).toBe(false)
    })

    it('should handle self-actions correctly', () => {
      const user = { ...mockUser, id: 'user-1' }

      // Пользователь может покинуть комнату
      expect(canPerformAction(user, mockRoom, 'leaveRoom')).toBe(true)

      // Но не может исключить себя
      expect(canPerformAction(user, mockRoom, 'kickUser', 'user-1')).toBe(false)
    })

    it('should prevent users from kicking higher-role users', () => {
      const moderator = { ...mockUser, role: 'moderator' as const }
      const owner = { ...mockUser, id: 'owner-1', role: 'owner' as const }

      // Модератор не может исключить владельца
      expect(canPerformAction(moderator, mockRoom, 'kickUser', 'owner-1')).toBe(
        false
      )

      // Владелец может исключить модератора
      expect(canPerformAction(owner, mockRoom, 'kickUser', 'moderator-1')).toBe(
        true
      )
    })

    it('should handle track ownership for removal', () => {
      const trackOwner = { ...mockUser, id: 'track-owner' }
      const otherUser = { ...mockUser, id: 'other-user' }

      // Владелец трека может удалить свой трек
      expect(
        canPerformAction(trackOwner, mockRoom, 'removeTrack', 'track-owner')
      ).toBe(true)

      // Другой пользователь не может удалить чужой трек (если он не модератор)
      expect(
        canPerformAction(otherUser, mockRoom, 'removeTrack', 'track-owner')
      ).toBe(false)
    })

    it('should handle moderator track removal permissions', () => {
      const moderator = { ...mockUser, role: 'moderator' as const }

      // Модератор может удалить любой трек
      expect(
        canPerformAction(moderator, mockRoom, 'removeTrack', 'any-user')
      ).toBe(true)
    })
  })

  describe('Permission hierarchy', () => {
    it('should maintain correct role hierarchy', () => {
      const roles = ['guest', 'member', 'moderator', 'owner'] as const

      // Проверяем, что каждая следующая роль имеет больше прав
      for (let i = 0; i < roles.length - 1; i++) {
        const lowerRole = roles[i]
        const higherRole = roles[i + 1]

        const lowerPermissions = checkPermissions(lowerRole)
        const higherPermissions = checkPermissions(higherRole)

        // Подсчитываем количество разрешений
        const lowerCount =
          Object.values(lowerPermissions).filter(Boolean).length
        const higherCount =
          Object.values(higherPermissions).filter(Boolean).length

        expect(higherCount).toBeGreaterThanOrEqual(lowerCount)
      }
    })

    it('should ensure owner has all permissions', () => {
      const ownerPermissions = checkPermissions('owner')
      const allPermissions = Object.values(ownerPermissions)

      expect(allPermissions.every(permission => permission === true)).toBe(true)
    })

    it('should ensure guest has minimal permissions', () => {
      const guestPermissions = checkPermissions('guest')
      const allPermissions = Object.values(guestPermissions)

      expect(allPermissions.every(permission => permission === false)).toBe(
        true
      )
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(checkPermissions(null as any)).toBeDefined()
      expect(checkPermissions(undefined as any)).toBeDefined()
      expect(hasPermission(null as any, 'canAddTracks')).toBe(false)
      expect(hasPermission('member', null as any)).toBe(false)
    })

    it('should handle empty strings', () => {
      expect(checkPermissions('' as any)).toBeDefined()
      expect(hasPermission('', 'canAddTracks')).toBe(false)
    })

    it('should be case sensitive for roles', () => {
      expect(checkPermissions('OWNER' as any)).not.toEqual(
        checkPermissions('owner')
      )
      expect(checkPermissions('Member' as any)).not.toEqual(
        checkPermissions('member')
      )
    })

    it('should handle concurrent permission checks', () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(hasPermission('member', 'canAddTracks'))
      )

      return Promise.all(promises).then(results => {
        expect(results.every(result => result === true)).toBe(true)
      })
    })
  })
})

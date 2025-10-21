// Role-based permissions system for Music Room

export type UserRole = 'owner' | 'moderator' | 'member' | 'guest'

export interface RolePermissions {
  canAddTracks: boolean
  canRemoveTracks: boolean
  canControlPlayback: boolean
  canKickUsers: boolean
  canAssignModerators: boolean
  canDeleteRoom: boolean
}

// Define permissions for each role
export const rolePermissions: Record<UserRole, RolePermissions> = {
  owner: {
    canAddTracks: true,
    canRemoveTracks: true,
    canControlPlayback: true,
    canKickUsers: true,
    canAssignModerators: true,
    canDeleteRoom: true
  },
  moderator: {
    canAddTracks: true,
    canRemoveTracks: true,
    canControlPlayback: true,
    canKickUsers: true,
    canAssignModerators: false,
    canDeleteRoom: false
  },
  member: {
    canAddTracks: true,
    canRemoveTracks: false,
    canControlPlayback: false,
    canKickUsers: false,
    canAssignModerators: false,
    canDeleteRoom: false
  },
  guest: {
    canAddTracks: false,
    canRemoveTracks: false,
    canControlPlayback: false,
    canKickUsers: false,
    canAssignModerators: false,
    canDeleteRoom: false
  }
}

// Get permissions for a specific role
export function getPermissionsForRole(role: UserRole): RolePermissions {
  return rolePermissions[role]
}

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return rolePermissions[role][permission]
}

// Check if a user can perform an action based on their role
export function canPerformAction(role: UserRole, action: keyof RolePermissions): boolean {
  return hasPermission(role, action)
}
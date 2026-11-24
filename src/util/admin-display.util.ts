import type { SearchAdminResponsePayload } from '../types/response.payload.types'

const SEEDED_SUPER_ADMIN_NAME = 'Super Admin'

export function getAdminDisplayName(admin: SearchAdminResponsePayload): string {
  const name = `${admin.firstName} ${admin.lastName}`.trim()
  const hasSuperAdminRole = admin.adminRoles.some(
    ({ role }) => role.name.toLowerCase() === SEEDED_SUPER_ADMIN_NAME.toLowerCase(),
  )

  return name.toLowerCase() === SEEDED_SUPER_ADMIN_NAME.toLowerCase() && !hasSuperAdminRole
    ? admin.email
    : name
}

export function getAdminRoleNames(admin: SearchAdminResponsePayload): string[] {
  return Array.from(new Set(admin.adminRoles.map(({ role }) => role.name)))
}

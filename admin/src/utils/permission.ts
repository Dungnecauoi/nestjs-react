import { UserPermissionRelation } from '../types/auth.types';

/**
 * Helper utility to evaluate whether a user possesses a required permission string.
 * Accepts string arrays ['user:read'] or relation objects [{ permission: { code: 'user:read' } }]
 */
export function hasPermission(
  userPermissions?: (string | UserPermissionRelation)[] | null,
  requiredPermission?: string | null
): boolean {
  // If no permission is required for the action or page, grant access
  if (!requiredPermission) {
    return true;
  }

  // If user has no permissions array, deny access
  if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }

  // Extract raw permission codes as string[]
  const permissionCodes: string[] = userPermissions.map((item) => {
    if (typeof item === 'string') {
      return item;
    }
    return item?.permission?.code || '';
  });

  // Super admin full wildcard access
  if (permissionCodes.includes('*') || permissionCodes.includes('*:*')) {
    return true;
  }

  // Exact match check
  if (permissionCodes.includes(requiredPermission)) {
    return true;
  }

  // Module wildcard check (e.g. 'user:*')
  const [module] = requiredPermission.split(':');
  if (module && permissionCodes.includes(`${module}:*`)) {
    return true;
  }

  return false;
}

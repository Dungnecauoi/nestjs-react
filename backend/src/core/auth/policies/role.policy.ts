import { PermissionPolicyItem } from './policy.interface';

export const ROLE_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'role:create',
    name: 'permissions.role.create.name',
    module: 'role',
    description: 'permissions.role.create.desc',
  },
  {
    code: 'role:read',
    name: 'permissions.role.read.name',
    module: 'role',
    description: 'permissions.role.read.desc',
  },
  {
    code: 'role:update',
    name: 'permissions.role.update.name',
    module: 'role',
    description: 'permissions.role.update.desc',
  },
  {
    code: 'role:delete',
    name: 'permissions.role.delete.name',
    module: 'role',
    description: 'permissions.role.delete.desc',
  },
];

import { PermissionPolicyItem } from './policy.interface';

export const USER_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'user:create',
    name: 'permissions.user.create.name',
    module: 'user',
    description: 'permissions.user.create.desc',
  },
  {
    code: 'user:read',
    name: 'permissions.user.read.name',
    module: 'user',
    description: 'permissions.user.read.desc',
  },
  {
    code: 'user:update',
    name: 'permissions.user.update.name',
    module: 'user',
    description: 'permissions.user.update.desc',
  },
  {
    code: 'user:delete',
    name: 'permissions.user.delete.name',
    module: 'user',
    description: 'permissions.user.delete.desc',
  },
  {
    code: 'user:import',
    name: 'permissions.user.import.name',
    module: 'user',
    description: 'permissions.user.import.desc',
  },
  {
    code: 'user:export',
    name: 'permissions.user.export.name',
    module: 'user',
    description: 'permissions.user.export.desc',
  },
];

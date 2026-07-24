import { PermissionPolicyItem } from './policy.interface';

export const TRANSLATION_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'translation:read',
    name: 'permissions.translation.read.name',
    module: 'translation',
    description: 'permissions.translation.read.desc',
  },
  {
    code: 'translation:create',
    name: 'permissions.translation.create.name',
    module: 'translation',
    description: 'permissions.translation.create.desc',
  },
  {
    code: 'translation:update',
    name: 'permissions.translation.update.name',
    module: 'translation',
    description: 'permissions.translation.update.desc',
  },
  {
    code: 'translation:delete',
    name: 'permissions.translation.delete.name',
    module: 'translation',
    description: 'permissions.translation.delete.desc',
  },
];

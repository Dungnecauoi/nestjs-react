import { PermissionPolicyItem } from './policy.interface';

export const MEDIA_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'media:create',
    name: 'permissions.media.create.name',
    module: 'media',
    description: 'permissions.media.create.desc',
  },
  {
    code: 'media:read',
    name: 'permissions.media.read.name',
    module: 'media',
    description: 'permissions.media.read.desc',
  },
  {
    code: 'media:update',
    name: 'permissions.media.update.name',
    module: 'media',
    description: 'permissions.media.update.desc',
  },
  {
    code: 'media:delete',
    name: 'permissions.media.delete.name',
    module: 'media',
    description: 'permissions.media.delete.desc',
  },
];

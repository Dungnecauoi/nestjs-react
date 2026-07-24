import { PermissionPolicyItem } from './policy.interface';

export const NOTIFICATION_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'notification:create',
    name: 'permissions.notification.create.name',
    module: 'notification',
    description: 'permissions.notification.create.desc',
  },
  {
    code: 'notification:read',
    name: 'permissions.notification.read.name',
    module: 'notification',
    description: 'permissions.notification.read.desc',
  },
  {
    code: 'notification:update',
    name: 'permissions.notification.update.name',
    module: 'notification',
    description: 'permissions.notification.update.desc',
  },
  {
    code: 'notification:delete',
    name: 'permissions.notification.delete.name',
    module: 'notification',
    description: 'permissions.notification.delete.desc',
  },
];

import { PermissionPolicyItem } from './policy.interface';

export const SETTING_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'setting:read',
    name: 'permissions.setting.read.name',
    module: 'setting',
    description: 'permissions.setting.read.desc',
  },
  {
    code: 'setting:update',
    name: 'permissions.setting.update.name',
    module: 'setting',
    description: 'permissions.setting.update.desc',
  },
];

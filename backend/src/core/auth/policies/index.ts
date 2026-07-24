import { PermissionPolicyItem } from './policy.interface';
import { USER_PERMISSIONS_POLICY } from './user.policy';
import { ROLE_PERMISSIONS_POLICY } from './role.policy';
import { DEPARTMENT_PERMISSIONS_POLICY } from './department.policy';
import { MEDIA_PERMISSIONS_POLICY } from './media.policy';
import { SETTING_PERMISSIONS_POLICY } from './setting.policy';
import { NOTIFICATION_PERMISSIONS_POLICY } from './notification.policy';
import { AUDIT_PERMISSIONS_POLICY } from './audit.policy';

export type { PermissionPolicyItem };

export const ALL_SYSTEM_POLICIES: PermissionPolicyItem[] = [
  ...USER_PERMISSIONS_POLICY,
  ...ROLE_PERMISSIONS_POLICY,
  ...DEPARTMENT_PERMISSIONS_POLICY,
  ...MEDIA_PERMISSIONS_POLICY,
  ...SETTING_PERMISSIONS_POLICY,
  ...NOTIFICATION_PERMISSIONS_POLICY,
  ...AUDIT_PERMISSIONS_POLICY,
];

export {
  USER_PERMISSIONS_POLICY,
  ROLE_PERMISSIONS_POLICY,
  DEPARTMENT_PERMISSIONS_POLICY,
  MEDIA_PERMISSIONS_POLICY,
  SETTING_PERMISSIONS_POLICY,
  NOTIFICATION_PERMISSIONS_POLICY,
  AUDIT_PERMISSIONS_POLICY,
};



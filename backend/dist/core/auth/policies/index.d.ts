import { PermissionPolicyItem } from './policy.interface';
import { USER_PERMISSIONS_POLICY } from './user.policy';
import { ROLE_PERMISSIONS_POLICY } from './role.policy';
import { DEPARTMENT_PERMISSIONS_POLICY } from './department.policy';
import { MEDIA_PERMISSIONS_POLICY } from './media.policy';
import { SETTING_PERMISSIONS_POLICY } from './setting.policy';
export type { PermissionPolicyItem };
export declare const ALL_SYSTEM_POLICIES: PermissionPolicyItem[];
export { USER_PERMISSIONS_POLICY, ROLE_PERMISSIONS_POLICY, DEPARTMENT_PERMISSIONS_POLICY, MEDIA_PERMISSIONS_POLICY, SETTING_PERMISSIONS_POLICY, };

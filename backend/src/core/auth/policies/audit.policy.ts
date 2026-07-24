import { PermissionPolicyItem } from './policy.interface';

export const AUDIT_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'audit:read',
    name: 'permissions.audit.read.name',
    module: 'audit',
    description: 'permissions.audit.read.desc',
  },
  {
    code: 'audit:delete',
    name: 'permissions.audit.delete.name',
    module: 'audit',
    description: 'permissions.audit.delete.desc',
  },
];

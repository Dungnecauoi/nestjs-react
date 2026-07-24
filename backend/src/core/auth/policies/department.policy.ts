import { PermissionPolicyItem } from './policy.interface';

export const DEPARTMENT_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'department:create',
    name: 'permissions.department.create.name',
    module: 'department',
    description: 'permissions.department.create.desc',
  },
  {
    code: 'department:read',
    name: 'permissions.department.read.name',
    module: 'department',
    description: 'permissions.department.read.desc',
  },
  {
    code: 'department:update',
    name: 'permissions.department.update.name',
    module: 'department',
    description: 'permissions.department.update.desc',
  },
  {
    code: 'department:delete',
    name: 'permissions.department.delete.name',
    module: 'department',
    description: 'permissions.department.delete.desc',
  },
  {
    code: 'department:import',
    name: 'permissions.department.import.name',
    module: 'department',
    description: 'permissions.department.import.desc',
  },
  {
    code: 'department:export',
    name: 'permissions.department.export.name',
    module: 'department',
    description: 'permissions.department.export.desc',
  },
];

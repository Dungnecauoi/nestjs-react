export interface PermissionPolicyItem {
  code: string;
  name: string;
  module: string;
  description: string;
}

export const SYSTEM_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  // User Management Permissions
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

  // Role & RBAC Management Permissions
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

  // Department Management Permissions
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

  // Media Library Management Permissions
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

  // System Settings Permissions
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

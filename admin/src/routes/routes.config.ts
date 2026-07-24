export interface RouteConfigItem {
  path: string;
  name: string;
  isPublic?: boolean;
  permission?: string;
}

export const ROUTES: Record<string, RouteConfigItem> = {
  LOGIN: {
    path: '/admin/login',
    name: 'Đăng Nhập',
    isPublic: true,
  },
  REGISTER: {
    path: '/admin/register',
    name: 'Đăng Ký',
    isPublic: true,
  },
  FORBIDDEN: {
    path: '/admin/403',
    name: 'Không Có Quyền Truy Cập',
    isPublic: true,
  },
  DASHBOARD: {
    path: '/admin/dashboard',
    name: 'Tổng Quan Hệ Thống',
  },
  ADMIN_USERS: {
    path: '/admin/users',
    name: 'Quản Lý Người Dùng',
    permission: 'user:read',
  },
  ADMIN_USERS_CREATE: {
    path: '/admin/users/create',
    name: 'Thêm Mới Người Dùng',
    permission: 'user:create',
  },
  ADMIN_USERS_EDIT: {
    path: '/admin/users/:id/edit',
    name: 'Chỉnh Sửa Người Dùng',
    permission: 'user:write',
  },
  ADMIN_ROLES: {
    path: '/admin/roles',
    name: 'Vai Trò & Quyền Hạn',
    permission: 'role:read',
  },
  ADMIN_DEPARTMENTS: {
    path: '/admin/departments',
    name: 'Phòng Ban & Tổ Chức',
    permission: 'department:read',
  },
  ADMIN_MEDIA: {
    path: '/admin/media',
    name: 'Quản Lý Media & Tập Tin',
    permission: 'media:read',
  },
  ADMIN_SETTINGS: {
    path: '/admin/settings',
    name: 'Cấu Hình Hệ Thống',
    permission: 'setting:read',
  },
  ADMIN_PROFILE: {
    path: '/admin/profile',
    name: 'Hồ Sơ Cá Nhân',
  },
};

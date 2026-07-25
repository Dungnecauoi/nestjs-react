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
  FORGOT_PASSWORD: {
    path: '/admin/forgot-password',
    name: 'Quên Mật Khẩu',
    isPublic: true,
  },
  RESET_PASSWORD: {
    path: '/admin/reset-password',
    name: 'Đặt Lại Mật Khẩu',
    isPublic: true,
  },
  VERIFY_EMAIL: {
    path: '/admin/verify-email',
    name: 'Xác Minh Email',
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
    permission: 'user:update',
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
  ADMIN_SETTINGS_GMAIL_CALLBACK: {
    path: '/admin/settings/gmail-oauth-callback',
    name: 'Kết Nối Gmail',
    permission: 'setting:update',
  },
  ADMIN_TRANSLATIONS: {
    path: '/admin/translations',
    name: 'Quản Lý Bản Dịch',
    permission: 'translation:read',
  },
  ADMIN_NOTIFICATIONS: {
    path: '/admin/notifications',
    name: 'Thông Báo Hệ Thống',
    permission: 'notification:read',
  },
  ADMIN_AUDIT_LOGS: {
    path: '/admin/audit-logs',
    name: 'Nhật Ký Thao Tác',
    permission: 'audit:read',
  },
  ADMIN_PROFILE: {
    path: '/admin/profile',
    name: 'Hồ Sơ Cá Nhân',
  },
};

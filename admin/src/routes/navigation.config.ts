export interface NavItem {
  title: string;
  path: string;
  iconName: 'LayoutDashboard' | 'Users' | 'Shield' | 'Building2' | 'Settings' | 'KeyRound' | 'Bell';
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'info';
  children?: NavItem[];
}

export interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    groupTitle: 'HỆ THỐNG',
    items: [
      {
        title: 'Tổng Quan (Dashboard)',
        path: '/admin/dashboard',
        iconName: 'LayoutDashboard',
      },
      {
        title: 'Thông Báo Hệ Thống',
        path: '/admin/notifications',
        iconName: 'Bell',
      },
    ],
  },
  {
    groupTitle: 'QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN',
    items: [
      {
        title: 'Danh Sách Người Dùng',
        path: '/admin/users',
        iconName: 'Users',
        badge: 'Core',
        badgeVariant: 'info',
      },
      {
        title: 'Vai Trò & Quyền Hạn',
        path: '/admin/roles',
        iconName: 'Shield',
      },
      {
        title: 'Phòng Ban & Tổ Chức',
        path: '/admin/departments',
        iconName: 'Building2',
      },
    ],
  },
  {
    groupTitle: 'CẤU HÌNH HỆ THỐNG',
    items: [
      {
        title: 'Cấu Hình Chung',
        path: '/admin/settings',
        iconName: 'Settings',
      },
    ],
  },
];

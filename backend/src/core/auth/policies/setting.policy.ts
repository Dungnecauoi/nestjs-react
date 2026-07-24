import { PermissionPolicyItem } from './policy.interface';

export const SETTING_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'setting:read',
    name: 'Xem Cấu Hình Hệ Thống',
    module: 'setting',
    description: 'Quyền xem các cài đặt hệ thống',
  },
  {
    code: 'setting:update',
    name: 'Cập Nhật Cấu Hình Hệ Thống',
    module: 'setting',
    description: 'Quyền thay đổi và lưu các tham số cài đặt hệ thống',
  },
];

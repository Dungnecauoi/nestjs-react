import { PermissionPolicyItem } from './policy.interface';

export const NOTIFICATION_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'notification:create',
    name: 'Tạo Thông Báo Mới',
    module: 'notification',
    description: 'Quyền phát thông báo thời gian thực tới người dùng',
  },
  {
    code: 'notification:read',
    name: 'Xem Thông Báo',
    module: 'notification',
    description: 'Quyền xem danh sách thông báo của hệ thống và tài khoản',
  },
  {
    code: 'notification:update',
    name: 'Cập Nhật / Đánh Dấu Thông Báo',
    module: 'notification',
    description: 'Quyền đánh dấu đã đọc hoặc cập nhật thông báo hệ thống',
  },
  {
    code: 'notification:delete',
    name: 'Xóa Thông Báo',
    module: 'notification',
    description: 'Quyền xóa các thông báo khỏi hệ thống',
  },
];

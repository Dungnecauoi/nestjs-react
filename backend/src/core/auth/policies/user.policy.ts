import { PermissionPolicyItem } from './policy.interface';

export const USER_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'user:read',
    name: 'Xem Danh Sách Người Dùng',
    module: 'user',
    description: 'Quyền xem danh sách và thông tin chi tiết người dùng',
  },
  {
    code: 'user:create',
    name: 'Tạo Người Dùng Mới',
    module: 'user',
    description: 'Quyền tạo mới tài khoản người dùng',
  },
  {
    code: 'user:write',
    name: 'Chỉnh Sửa Người Dùng',
    module: 'user',
    description: 'Quyền cập nhật thông tin người dùng và kích hoạt tài khoản',
  },
  {
    code: 'user:delete',
    name: 'Xóa Người Dùng',
    module: 'user',
    description: 'Quyền xóa người dùng khỏi hệ thống',
  },
];

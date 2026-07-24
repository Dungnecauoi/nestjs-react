import { PermissionPolicyItem } from './policy.interface';

export const USER_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'user:create',
    name: 'Tạo Người Dùng Mới',
    module: 'user',
    description: 'Quyền tạo mới tài khoản người dùng',
  },
  {
    code: 'user:read',
    name: 'Xem Danh Sách Người Dùng',
    module: 'user',
    description: 'Quyền xem danh sách và thông tin chi tiết người dùng',
  },
  {
    code: 'user:update',
    name: 'Cập Nhật Người Dùng',
    module: 'user',
    description: 'Quyền cập nhật thông tin người dùng và kích hoạt tài khoản',
  },
  {
    code: 'user:delete',
    name: 'Xóa Người Dùng',
    module: 'user',
    description: 'Quyền xóa người dùng khỏi hệ thống',
  },
  {
    code: 'user:import',
    name: 'Nhập Dữ Liệu Người Dùng (Import)',
    module: 'user',
    description: 'Quyền import danh sách người dùng từ tệp Excel/CSV',
  },
  {
    code: 'user:export',
    name: 'Xuất Dữ Liệu Người Dùng (Export)',
    module: 'user',
    description: 'Quyền export danh sách người dùng ra tệp Excel/CSV',
  },
];

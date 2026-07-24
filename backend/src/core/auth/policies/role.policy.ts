import { PermissionPolicyItem } from './policy.interface';

export const ROLE_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'role:create',
    name: 'Tạo Vai Trò Mới',
    module: 'role',
    description: 'Quyền tạo mới vai trò trong hệ thống',
  },
  {
    code: 'role:read',
    name: 'Xem Danh Sách Vai Trò',
    module: 'role',
    description: 'Quyền xem danh sách vai trò và ma trận phân quyền',
  },
  {
    code: 'role:update',
    name: 'Cập Nhật Vai Trò',
    module: 'role',
    description: 'Quyền cập nhật thông tin vai trò và ma trận gán quyền',
  },
  {
    code: 'role:delete',
    name: 'Xóa Vai Trò',
    module: 'role',
    description: 'Quyền xóa vai trò khỏi hệ thống',
  },
];

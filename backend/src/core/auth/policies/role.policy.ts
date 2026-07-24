import { PermissionPolicyItem } from './policy.interface';

export const ROLE_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'role:read',
    name: 'Xem Danh Sách Vai Trò',
    module: 'role',
    description: 'Quyền xem danh sách vai trò và ma trận phân quyền',
  },
  {
    code: 'role:write',
    name: 'Tạo & Sửa Vai Trò',
    module: 'role',
    description: 'Quyền tạo mới, chỉnh sửa vai trò và gán quyền hạn',
  },
  {
    code: 'role:delete',
    name: 'Xóa Vai Trò',
    module: 'role',
    description: 'Quyền xóa vai trò khỏi hệ thống',
  },
];

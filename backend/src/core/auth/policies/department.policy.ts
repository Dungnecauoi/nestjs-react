import { PermissionPolicyItem } from './policy.interface';

export const DEPARTMENT_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'department:read',
    name: 'Xem Danh Sách Phòng Ban',
    module: 'department',
    description: 'Quyền xem danh sách phòng ban và sơ đồ tổ chức',
  },
  {
    code: 'department:write',
    name: 'Tạo & Sửa Phòng Ban',
    module: 'department',
    description: 'Quyền tạo mới và chỉnh sửa thông tin phòng ban',
  },
  {
    code: 'department:delete',
    name: 'Xóa Phòng Ban',
    module: 'department',
    description: 'Quyền xóa phòng ban khỏi hệ thống',
  },
];

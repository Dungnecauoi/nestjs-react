import { PermissionPolicyItem } from './policy.interface';

export const DEPARTMENT_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'department:create',
    name: 'Tạo Phòng Ban Mới',
    module: 'department',
    description: 'Quyền tạo mới phòng ban trong hệ thống',
  },
  {
    code: 'department:read',
    name: 'Xem Danh Sách Phòng Ban',
    module: 'department',
    description: 'Quyền xem danh sách phòng ban và sơ đồ tổ chức',
  },
  {
    code: 'department:update',
    name: 'Cập Nhật Phòng Ban',
    module: 'department',
    description: 'Quyền chỉnh sửa thông tin phòng ban',
  },
  {
    code: 'department:delete',
    name: 'Xóa Phòng Ban',
    module: 'department',
    description: 'Quyền xóa phòng ban khỏi hệ thống',
  },
  {
    code: 'department:import',
    name: 'Nhập Dữ Liệu Phòng Ban (Import)',
    module: 'department',
    description: 'Quyền import cây sơ đồ phòng ban từ Excel/CSV',
  },
  {
    code: 'department:export',
    name: 'Xuất Dữ Liệu Phòng Ban (Export)',
    module: 'department',
    description: 'Quyền export danh sách phòng ban ra tệp Excel/CSV',
  },
];

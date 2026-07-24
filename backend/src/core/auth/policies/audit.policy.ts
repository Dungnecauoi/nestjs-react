import { PermissionPolicyItem } from './policy.interface';

export const AUDIT_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'audit:read',
    name: 'Xem Nhật Ký Thao Tác',
    module: 'audit',
    description: 'Quyền xem nhật ký hệ thống và so sánh lịch sử thay đổi dữ liệu (Diff)',
  },
  {
    code: 'audit:delete',
    name: 'Xóa Nhật Ký Thao Tác',
    module: 'audit',
    description: 'Quyền xóa các bản ghi nhật ký thao tác cũ khỏi hệ thống',
  },
];

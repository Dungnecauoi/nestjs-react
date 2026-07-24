import { PermissionPolicyItem } from './policy.interface';

export const MEDIA_PERMISSIONS_POLICY: PermissionPolicyItem[] = [
  {
    code: 'media:read',
    name: 'Xem Thư Viện Media',
    module: 'media',
    description: 'Quyền xem danh sách tập tin và hình ảnh media',
  },
  {
    code: 'media:create',
    name: 'Tải Lên Media',
    module: 'media',
    description: 'Quyền tải lên tập tin media mới',
  },
  {
    code: 'media:write',
    name: 'Chỉnh Sửa Chi Tiết Media',
    module: 'media',
    description: 'Quyền cập nhật tiêu đề, chú thích và Alt text media',
  },
  {
    code: 'media:delete',
    name: 'Xóa Media',
    module: 'media',
    description: 'Quyền xóa vĩnh viễn tập tin media khỏi hệ thống',
  },
];

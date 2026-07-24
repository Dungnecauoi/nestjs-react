"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_PERMISSIONS_POLICY = void 0;
exports.SYSTEM_PERMISSIONS_POLICY = [
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
    {
        code: 'role:read',
        name: 'Xem Danh Sách Vai Trò',
        module: 'role',
        description: 'Quyền xem danh sách vai trò và bảng ma trận phân quyền',
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
        description: 'Quyền xóa phòng ban',
    },
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
    {
        code: 'setting:read',
        name: 'Xem Cấu Hình Hệ Thống',
        module: 'setting',
        description: 'Quyền xem các cài đặt hệ thống',
    },
    {
        code: 'setting:write',
        name: 'Cập Nhật Cấu Hình Hệ Thống',
        module: 'setting',
        description: 'Quyền thay đổi và lưu các tham số cài đặt hệ thống',
    },
];
//# sourceMappingURL=permissions.policy.js.map
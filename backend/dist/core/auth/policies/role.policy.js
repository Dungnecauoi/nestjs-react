"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS_POLICY = void 0;
exports.ROLE_PERMISSIONS_POLICY = [
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
//# sourceMappingURL=role.policy.js.map
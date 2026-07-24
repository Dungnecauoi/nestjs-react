"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const assign_user_roles_dto_1 = require("./dto/assign-user-roles.dto");
const assign_user_permissions_dto_1 = require("./dto/assign-user-permissions.dto");
const assign_user_departments_dto_1 = require("./dto/assign-user-departments.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../core/auth/guards/permission.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    findAll() {
        return this.userService.findAll();
    }
    findOne(id) {
        return this.userService.findOne(id);
    }
    create(dto) {
        return this.userService.create(dto);
    }
    update(id, dto) {
        return this.userService.update(id, dto);
    }
    remove(id) {
        return this.userService.remove(id);
    }
    approve(id) {
        return this.userService.approve(id);
    }
    assignRoles(id, dto) {
        return this.userService.assignRoles(id, dto);
    }
    assignDirectPermissions(id, dto) {
        return this.userService.assignDirectPermissions(id, dto);
    }
    assignDepartments(id, dto) {
        return this.userService.assignDepartments(id, dto);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('user:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách User kèm Roles, Direct Permissions & Departments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('user:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết User kèm Roles & Permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('user:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo mới User kèm thông tin định danh CCCD, Giới tính, Ngày sinh, Địa chỉ' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('user:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin User' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('user:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa User' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, permissions_decorator_1.RequirePermissions)('user:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Phê duyệt Kích hoạt User' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/roles'),
    (0, permissions_decorator_1.RequirePermissions)('role:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Gán mảng Vai trò (Roles) cho User từ UI' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_user_roles_dto_1.AssignUserRolesDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "assignRoles", null);
__decorate([
    (0, common_1.Post)(':id/permissions'),
    (0, permissions_decorator_1.RequirePermissions)('role:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Gán mảng Quyền hạn (Permissions) TRỰC TIẾP cho User từ UI' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_user_permissions_dto_1.AssignUserPermissionsDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "assignDirectPermissions", null);
__decorate([
    (0, common_1.Post)(':id/departments'),
    (0, permissions_decorator_1.RequirePermissions)('department:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Gán User vào mảng Phòng ban / Team từ UI' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_user_departments_dto_1.AssignUserDepartmentsDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "assignDepartments", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('User Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map
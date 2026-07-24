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
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const role_service_1 = require("./role.service");
const create_role_dto_1 = require("./dto/create-role.dto");
const assign_permissions_role_dto_1 = require("./dto/assign-permissions-role.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../core/auth/guards/permission.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let RoleController = class RoleController {
    roleService;
    constructor(roleService) {
        this.roleService = roleService;
    }
    findAll() {
        return this.roleService.findAll();
    }
    findOne(id) {
        return this.roleService.findOne(id);
    }
    create(dto) {
        return this.roleService.create(dto);
    }
    update(id, dto) {
        return this.roleService.update(id, dto);
    }
    assignPermissions(id, dto) {
        return this.roleService.assignPermissions(id, dto);
    }
    remove(id) {
        return this.roleService.remove(id);
    }
};
exports.RoleController = RoleController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách Role kèm Quyền hạn' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết Role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo mới Role' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật Role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/permissions'),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Gán danh sách Quyền hạn (Permissions) vào Role từ giao diện UI' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_permissions_role_dto_1.AssignPermissionsToRoleDto]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "assignPermissions", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa Role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "remove", null);
exports.RoleController = RoleController = __decorate([
    (0, swagger_1.ApiTags)('Role Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], RoleController);
//# sourceMappingURL=role.controller.js.map
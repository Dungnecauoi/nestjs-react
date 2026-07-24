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
exports.DepartmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const department_service_1 = require("./department.service");
const create_department_dto_1 = require("./dto/create-department.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../core/auth/guards/permission.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let DepartmentController = class DepartmentController {
    departmentService;
    constructor(departmentService) {
        this.departmentService = departmentService;
    }
    findAll() {
        return this.departmentService.findAll();
    }
    findOne(id) {
        return this.departmentService.findOne(id);
    }
    create(dto) {
        return this.departmentService.create(dto);
    }
    update(id, dto) {
        return this.departmentService.update(id, dto);
    }
    remove(id) {
        return this.departmentService.remove(id);
    }
};
exports.DepartmentController = DepartmentController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('department:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách Phòng ban / Team (Yêu cầu quyền: department:read)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('department:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết Phòng ban / Team (Yêu cầu quyền: department:read)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('department:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo mới Phòng ban / Team (Yêu cầu quyền: department:create)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_department_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('department:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật Phòng ban / Team (Yêu cầu quyền: department:update)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('department:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa Phòng ban / Team (Yêu cầu quyền: department:delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "remove", null);
exports.DepartmentController = DepartmentController = __decorate([
    (0, swagger_1.ApiTags)('Department & Team Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('departments'),
    __metadata("design:paramtypes", [department_service_1.DepartmentService])
], DepartmentController);
//# sourceMappingURL=department.controller.js.map
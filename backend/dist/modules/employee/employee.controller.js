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
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const employee_service_1 = require("./employee.service");
const create_employee_dto_1 = require("./dto/create-employee.dto");
const storage_service_1 = require("../../core/storage/storage.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../../core/auth/guards/permission.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let EmployeeController = class EmployeeController {
    employeeService;
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    findAll() {
        return this.employeeService.findAll();
    }
    findOne(id) {
        return this.employeeService.findOne(id);
    }
    create(file, dto) {
        return this.employeeService.create(dto, file);
    }
    remove(id) {
        return this.employeeService.remove(id);
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách employee (Public Route Demo)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('employee:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết employee (Yêu cầu quyền: employee:read)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('employee:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo mới employee (Yêu cầu quyền: employee:create)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', storage_service_1.StorageService.getMulterConfig('employees'))),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('employee:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa employee (Yêu cầu quyền: employee:delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "remove", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, swagger_1.ApiTags)('Employee Module'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employee_service_1.EmployeeService])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map
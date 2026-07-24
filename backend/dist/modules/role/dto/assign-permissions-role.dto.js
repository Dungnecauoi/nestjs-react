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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignPermissionsToRoleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
class AssignPermissionsToRoleDto {
    permissionIds;
}
exports.AssignPermissionsToRoleDto = AssignPermissionsToRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['perm_id_1', 'perm_id_2'], description: 'Mảng chứa danh sách ID Quyền hạn gán cho Role' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)({ message: (0, nestjs_i18n_1.i18nValidationMessage)('validation.NOT_EMPTY') }),
    __metadata("design:type", Array)
], AssignPermissionsToRoleDto.prototype, "permissionIds", void 0);
//# sourceMappingURL=assign-permissions-role.dto.js.map
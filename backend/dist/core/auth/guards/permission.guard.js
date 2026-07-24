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
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const nestjs_i18n_1 = require("nestjs-i18n");
const permissions_decorator_1 = require("../../../common/decorators/permissions.decorator");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
let PermissionGuard = class PermissionGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        const i18n = nestjs_i18n_1.I18nContext.current();
        if (!user) {
            const message = i18n
                ? i18n.t('messages.UNAUTHORIZED')
                : 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn';
            throw new common_1.ForbiddenException(message);
        }
        const userRoles = user.roles || [];
        const userPermissions = user.permissions || [];
        if (userRoles.includes('super-admin') ||
            userRoles.includes('admin') ||
            userPermissions.includes('*') ||
            userPermissions.includes('*:*')) {
            return true;
        }
        const hasPermission = requiredPermissions.every((permission) => {
            if (userPermissions.includes(permission))
                return true;
            const [module] = permission.split(':');
            if (module && userPermissions.includes(`${module}:*`))
                return true;
            return false;
        });
        if (!hasPermission) {
            const permissionsStr = requiredPermissions.join(', ');
            const message = i18n
                ? i18n.t('messages.FORBIDDEN', { args: { permissions: permissionsStr } })
                : `Bạn không có quyền truy cập. Yêu cầu quyền: [${permissionsStr}]`;
            throw new common_1.ForbiddenException(message);
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map
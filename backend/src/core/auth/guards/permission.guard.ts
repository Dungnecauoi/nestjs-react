import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';
import { PERMISSIONS_KEY } from '../../../common/decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const i18n = I18nContext.current();

    if (!user) {
      const message = i18n
        ? i18n.t('messages.UNAUTHORIZED')
        : 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn';
      throw new ForbiddenException(message);
    }

    // Chỉ Super Admin (role code: super-admin) hoặc Wildcard permission (* / *:*) mới được bypass kiểm tra
    const userRoles: string[] = user.roles || [];
    const userPermissions: string[] = user.permissions || [];

    if (
      userRoles.includes('super-admin') ||
      userPermissions.includes('*') ||
      userPermissions.includes('*:*')
    ) {
      return true;
    }

    const hasPermission = requiredPermissions.every((permission) => {
      if (userPermissions.includes(permission)) return true;
      const [module] = permission.split(':');
      if (module && userPermissions.includes(`${module}:*`)) return true;
      return false;
    });

    if (!hasPermission) {
      const permissionsStr = requiredPermissions.join(', ');
      const message = i18n
        ? i18n.t('messages.FORBIDDEN', {
            args: { permissions: permissionsStr },
          })
        : `Bạn không có quyền truy cập. Yêu cầu quyền: [${permissionsStr}]`;

      throw new ForbiddenException(message);
    }

    return true;
  }
}

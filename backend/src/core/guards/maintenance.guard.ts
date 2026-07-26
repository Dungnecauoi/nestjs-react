import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OptionsService } from '../options/options.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { CustomApiException } from '../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly optionsService: OptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();

    // Bypass login / auth / options routes so admin can log in and turn off maintenance mode
    if (
      isPublic ||
      req.url?.includes('/api/auth') ||
      req.url?.includes('/api/maintenance') ||
      req.url?.includes('/api/options')
    ) {
      return true;
    }

    const isMaintenance = await this.optionsService.get<boolean>('maintenanceMode', false);
    if (!isMaintenance) {
      return true;
    }

    // Bypass if user is super-admin
    const user = req.user;
    if (user && user.roles && (user.roles.includes('super-admin') || user.roles.includes('admin'))) {
      return true;
    }

    throw new CustomApiException(
      ErrorCode.SYS_INTERNAL_ERROR,
      'Hệ thống đang trong chế độ bảo trì nâng cấp định kỳ. Vui lòng quay lại sau!',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

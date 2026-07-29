import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OptionsService } from '../options/options.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { BYPASS_MAINTENANCE_KEY } from '../../common/decorators/bypass-maintenance.decorator';
import { CustomApiException } from '../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly optionsService: OptionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Metadata-based bypass thay cho so khớp chuỗi URL — route mới không vô tình trùng
    // substring rồi bị bypass nhầm. Gắn @BypassMaintenance() ở controller/route cần chạy
    // được trong lúc bảo trì (Auth, Maintenance, Options, Health).
    const bypassMaintenance = this.reflector.getAllAndOverride<boolean>(
      BYPASS_MAINTENANCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic || bypassMaintenance) {
      return true;
    }

    const val = await this.optionsService.get('maintenanceMode', false);
    const isMaintenance = String(val) === 'true';
    if (!isMaintenance) {
      return true;
    }

    // Bypass if user is super-admin or admin via JWT Token
    try {
      const req = context.switchToHttp().getRequest();
      let token: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      if (token) {
        const secret = this.configService.get<string>('auth.jwtSecret');
        const decoded = this.jwtService.verify(token, { secret });
        if (decoded && decoded.roles && (decoded.roles.includes('super-admin') || decoded.roles.includes('admin'))) {
          return true;
        }
      }
    } catch {
      // Ignore token decode errors
    }

    throw new CustomApiException(
      ErrorCode.SYS_INTERNAL_ERROR,
      'Hệ thống đang trong chế độ bảo trì nâng cấp định kỳ. Vui lòng quay lại sau!',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

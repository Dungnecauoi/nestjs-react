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

    const req = context.switchToHttp().getRequest();
    const url = (req.originalUrl || req.url || '').toLowerCase();

    // Always bypass auth, maintenance, options, health and public routes
    if (
      isPublic ||
      url.includes('/auth') ||
      url.includes('/maintenance') ||
      url.includes('/options') ||
      url.includes('/health')
    ) {
      return true;
    }

    const isMaintenance = await this.optionsService.get<boolean>('maintenanceMode', false);
    if (!isMaintenance) {
      return true;
    }

    // Bypass if user is super-admin or admin via JWT Token
    try {
      let token: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      if (token) {
        const secret = this.configService.get<string>('auth.jwtSecret') || 'super_secret_key';
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

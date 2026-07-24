import { Injectable, ExecutionContext, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { CustomApiException } from '../../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../../common/enums/error-code.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      const isExpired = info?.name === 'TokenExpiredError';
      const errorCode = isExpired ? ErrorCode.AUTH_TOKEN_EXPIRED : ErrorCode.AUTH_UNAUTHORIZED;
      const message = isExpired
        ? 'Access Token đã hết hạn. Vui lòng làm mới Token'
        : 'Phiên truy cập không hợp lệ hoặc chưa được đăng nhập';
      throw new CustomApiException(errorCode, message, HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}

import { Injectable, ExecutionContext, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { CustomApiException } from '../../../common/exceptions/custom-api.exception';
import { ErrorCode } from '../../../common/enums/error-code.enum';

/**
 * Chấp nhận JWT (user đăng nhập) HOẶC API Key (header x-api-key, hệ thống ngoài
 * gọi máy-với-máy). Passport thử lần lượt từng strategy trong danh sách, strategy
 * nào xác thực thành công trước thì lấy user (hoặc api-key actor) từ đó.
 * Dùng thay cho JwtAuthGuard ở các route cần cho phép cả 2 kiểu caller — PermissionGuard
 * đứng sau vẫn check permissions như cũ nên API key chỉ gọi được đúng scope đã cấp.
 */
@Injectable()
export class JwtOrApiKeyGuard extends AuthGuard(['jwt', 'api-key']) {
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

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new CustomApiException(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Cần Access Token (Bearer) hoặc API Key (header x-api-key) hợp lệ để truy cập',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, body } = request;

    // 1. Chỉ log các thao tác làm thay đổi dữ liệu (POST, PATCH, PUT, DELETE)
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // 2. Bỏ qua các API nội bộ / silent refresh / thông báo để tránh tạo log giả & vòng lặp
    if (
      url.includes('/api/audit-logs') ||
      url.includes('/api/notifications') ||
      url.includes('/api/auth/refresh') ||
      url.includes('/api/auth/me')
    ) {
      return next.handle();
    }

    let action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' =
      method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';

    if (url.includes('/api/auth/login')) {
      action = 'LOGIN';
    } else if (url.includes('/api/auth/logout')) {
      action = 'LOGOUT';
    }

    const pathParts = url.split('?')[0].split('/').filter(Boolean);
    const module = pathParts[1] || 'system';

    const userAgent = request.headers['user-agent'] || '';

    return next.handle().pipe(
      tap((responseContent) => {
        try {
          this.auditService.logAction({
            userId: user?.id,
            userEmail: user?.email || 'Guest',
            action,
            module,
            entityId: responseContent?.id || body?.id || null,
            beforeState: action === 'UPDATE' ? body : null,
            afterState: responseContent ?? body ?? null,
            ipAddress: ip || request.connection?.remoteAddress,
            userAgent,
          });
        } catch (err) {
          console.error('AuditInterceptor failed to record log:', err);
        }
      }),
    );
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { PrismaService } from '../database/prisma.service';

const SENSITIVE_KEYS = [
  'password',
  'currentPassword',
  'newPassword',
  'accessToken',
  'refreshToken',
  'token',
  'preAuthToken',
  'otpCode',
  'secret',
  'twoFactorSecret',
  'tokenHash',
];

function sanitizeForAudit(value: any, depth = 0): any {
  if (!value || typeof value !== 'object' || depth > 2) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForAudit(item, depth + 1));
  }

  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEYS.includes(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = sanitizeForAudit(val, depth + 1);
    }
  }
  return result;
}

/**
 * A5: Map tên module → tên bảng Prisma để query beforeState chính xác.
 * Chỉ cần bổ sung khi thêm module mới.
 */
const MODULE_TABLE_MAP: Record<string, string> = {
  users: 'user',
  roles: 'role',
  departments: 'department',
  permissions: 'permission',
  webhooks: 'webhook',
  media: 'media',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

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
      url.includes('/api/auth/me') ||
      url.includes('/ping') ||
      url.includes('/queues/clean')
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
    // pathParts = ['api', 'users', ':id'] => entityId from URL
    const entityIdFromUrl = pathParts.length >= 3 ? pathParts[2] : null;

    const userAgent = request.headers['user-agent'] || '';

    // A5: Lấy beforeState từ DB khi UPDATE — không dùng request.body (chỉ là partial input)
    const fetchBeforeState = async (): Promise<any> => {
      if (action !== 'UPDATE' || !entityIdFromUrl) return null;

      const tableName = MODULE_TABLE_MAP[module];
      if (!tableName) return sanitizeForAudit(body);

      try {
        const record = await (this.prisma as any)[tableName].findUnique({
          where: { id: entityIdFromUrl },
        });
        return sanitizeForAudit(record);
      } catch {
        return sanitizeForAudit(body); // fallback về body nếu query lỗi
      }
    };

    return from(fetchBeforeState()).pipe(
      switchMap((beforeState) =>
        next.handle().pipe(
          tap((responseContent) => {
            try {
              this.auditService.logAction({
                userId: user?.id,
                userEmail: user?.email || 'Guest',
                action,
                module,
                entityId: responseContent?.id || entityIdFromUrl || body?.id || null,
                beforeState,
                afterState: sanitizeForAudit(responseContent ?? body ?? null),
                ipAddress: ip || request.connection?.remoteAddress,
                userAgent,
              });
            } catch (err) {
              console.error('AuditInterceptor failed to record log:', err);
            }
          }),
        ),
      ),
    );
  }
}

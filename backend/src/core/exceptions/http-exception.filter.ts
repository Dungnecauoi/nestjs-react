import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLoggerService } from '../logger/logger.service';
import { ErrorCode } from '../../common/enums/error-code.enum';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Bỏ qua log lỗi rác khi trình duyệt tự động request /favicon.ico
    if (request.url === '/favicon.ico') {
      return response.status(HttpStatus.NO_CONTENT).end();
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string = ErrorCode.SYS_INTERNAL_ERROR;
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (typeof res === 'object') {
        message = res.message || exception.message;
        errorCode = res.errorCode || this.getDefaultErrorCode(status);
        errors =
          res.errors || (Array.isArray(res.message) ? res.message : null);
        if (Array.isArray(res.message)) {
          message = 'Validation failed';
          errorCode = ErrorCode.SYS_VALIDATION_ERROR;
        }
      } else {
        message = res || exception.message;
        errorCode = this.getDefaultErrorCode(status);
      }
    } else if (exception instanceof Error) {
      // Trong môi trường production hoặc với lỗi 500 không xử lý, không rò rỉ raw DB/System message
      if (process.env.NODE_ENV === 'production') {
        message = 'Internal server error';
      } else {
        message = exception.message;
      }
    }

    const logMessage = `HTTP ${status} [${errorCode}] [${request.method}] ${request.url} - ${message}`;

    if (status >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
        'HttpExceptionFilter',
      );
    } else if (status === 401 && request.url?.includes('/auth/refresh')) {
      // Silent 401 for unauthenticated visitors calling refresh endpoint
    } else {
      this.logger.warn(logMessage, 'HttpExceptionFilter');
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode,
      message,
      errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getDefaultErrorCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.AUTH_UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.AUTH_FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.SYS_NOT_FOUND;
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.SYS_VALIDATION_ERROR;
      default:
        return ErrorCode.SYS_INTERNAL_ERROR;
    }
  }
}

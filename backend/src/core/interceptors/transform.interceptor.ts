import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { OptionsService } from '../options/options.service';
import { deepFormatDates } from '../../common/utils/date-format.util';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  constructor(private readonly optionsService: OptionsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    if (response.headersSent) {
      return next.handle();
    }

    return next.handle().pipe(
      switchMap((data) => {
        // If response is a file download (Content-Disposition set) or raw Buffer/Stream
        const contentDisposition = response.getHeader('content-disposition');
        const contentType = response.getHeader('content-type');
        if (
          contentDisposition ||
          data instanceof Buffer ||
          (typeof contentType === 'string' && (contentType.includes('text/csv') || contentType.includes('application/octet-stream')))
        ) {
          return from(Promise.resolve(data));
        }

        return from(this.optionsService.getAllOptions()).pipe(
          map((options) => {
            // If data is already standardized or has a custom message
            let message = 'Operation successful';
            let resultData = data;

            if (
              data &&
              typeof data === 'object' &&
              'message' in data &&
              'data' in data
            ) {
              message = data.message;
              resultData = data.data;
            }

            const formattedData = deepFormatDates(resultData ?? null, {
              dateFormat: options?.dateFormat,
              timeFormat: options?.timeFormat,
              timezone: options?.timezone,
            });

            return {
              success: true,
              statusCode,
              message,
              data: formattedData,
              timestamp: new Date().toISOString(),
            };
          }),
        );
      }),
    );
  }
}

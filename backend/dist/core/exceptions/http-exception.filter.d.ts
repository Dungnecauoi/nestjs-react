import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { CustomLoggerService } from '../logger/logger.service';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: CustomLoggerService);
    catch(exception: unknown, host: ArgumentsHost): Response<any, Record<string, any>> | undefined;
    private getDefaultErrorCode;
}

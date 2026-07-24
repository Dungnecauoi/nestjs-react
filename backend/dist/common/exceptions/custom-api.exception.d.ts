import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-code.enum';
export declare class CustomApiException extends HttpException {
    readonly errorCode: ErrorCode;
    constructor(errorCode: ErrorCode, message: string, statusCode?: HttpStatus);
}

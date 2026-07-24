"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../logger/logger.service");
const error_code_enum_1 = require("../../common/enums/error-code.enum");
let HttpExceptionFilter = class HttpExceptionFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        if (request.url === '/favicon.ico') {
            return response.status(common_1.HttpStatus.NO_CONTENT).end();
        }
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorCode = error_code_enum_1.ErrorCode.SYS_INTERNAL_ERROR;
        let errors = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'object') {
                message = res.message || exception.message;
                errorCode = res.errorCode || this.getDefaultErrorCode(status);
                errors = res.errors || (Array.isArray(res.message) ? res.message : null);
                if (Array.isArray(res.message)) {
                    message = 'Validation failed';
                    errorCode = error_code_enum_1.ErrorCode.SYS_VALIDATION_ERROR;
                }
            }
            else {
                message = res || exception.message;
                errorCode = this.getDefaultErrorCode(status);
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        const logMessage = `HTTP ${status} [${errorCode}] [${request.method}] ${request.url} - ${message}`;
        if (status >= 500) {
            this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined, 'HttpExceptionFilter');
        }
        else if (status === 401 && request.url?.includes('/auth/refresh')) {
        }
        else {
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
    getDefaultErrorCode(status) {
        switch (status) {
            case common_1.HttpStatus.UNAUTHORIZED:
                return error_code_enum_1.ErrorCode.AUTH_UNAUTHORIZED;
            case common_1.HttpStatus.FORBIDDEN:
                return error_code_enum_1.ErrorCode.AUTH_FORBIDDEN;
            case common_1.HttpStatus.NOT_FOUND:
                return error_code_enum_1.ErrorCode.SYS_NOT_FOUND;
            case common_1.HttpStatus.BAD_REQUEST:
                return error_code_enum_1.ErrorCode.SYS_VALIDATION_ERROR;
            default:
                return error_code_enum_1.ErrorCode.SYS_INTERNAL_ERROR;
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [logger_service_1.CustomLoggerService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map
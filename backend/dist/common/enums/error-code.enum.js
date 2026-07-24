"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["AUTH_LOGIN_FAILED"] = "AUTH_1001";
    ErrorCode["AUTH_TOKEN_EXPIRED"] = "AUTH_1002";
    ErrorCode["AUTH_TOKEN_INVALID"] = "AUTH_1003";
    ErrorCode["AUTH_REFRESH_TOKEN_MISSING"] = "AUTH_1004";
    ErrorCode["AUTH_2FA_REQUIRED"] = "AUTH_1005";
    ErrorCode["AUTH_2FA_EXPIRED"] = "AUTH_1006";
    ErrorCode["AUTH_2FA_INVALID"] = "AUTH_1007";
    ErrorCode["AUTH_UNAUTHORIZED"] = "AUTH_1008";
    ErrorCode["AUTH_FORBIDDEN"] = "AUTH_1009";
    ErrorCode["USER_NOT_FOUND"] = "USER_2001";
    ErrorCode["USER_EMAIL_EXISTS"] = "USER_2002";
    ErrorCode["USER_PENDING_APPROVAL"] = "USER_2003";
    ErrorCode["DEPT_NOT_FOUND"] = "DEPT_3001";
    ErrorCode["DEPT_CODE_EXISTS"] = "DEPT_3002";
    ErrorCode["MEDIA_FILE_TOO_LARGE"] = "MEDIA_4001";
    ErrorCode["MEDIA_TYPE_NOT_ALLOWED"] = "MEDIA_4002";
    ErrorCode["SYS_INTERNAL_ERROR"] = "SYS_5001";
    ErrorCode["SYS_VALIDATION_ERROR"] = "SYS_5002";
    ErrorCode["SYS_NOT_FOUND"] = "SYS_5003";
    ErrorCode["SYS_CONFIG_ERROR"] = "SYS_5004";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=error-code.enum.js.map
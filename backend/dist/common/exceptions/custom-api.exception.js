"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomApiException = void 0;
const common_1 = require("@nestjs/common");
class CustomApiException extends common_1.HttpException {
    errorCode;
    constructor(errorCode, message, statusCode = common_1.HttpStatus.BAD_REQUEST) {
        super({
            success: false,
            statusCode,
            errorCode,
            message,
        }, statusCode);
        this.errorCode = errorCode;
    }
}
exports.CustomApiException = CustomApiException;
//# sourceMappingURL=custom-api.exception.js.map
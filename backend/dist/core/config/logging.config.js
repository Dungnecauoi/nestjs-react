"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('logging', () => ({
    channel: process.env.LOG_CHANNEL || 'daily',
    level: process.env.LOG_LEVEL || 'debug',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
}));
//# sourceMappingURL=logging.config.js.map
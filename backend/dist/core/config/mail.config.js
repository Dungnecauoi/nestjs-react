"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('mail', () => ({
    mailer: process.env.MAIL_MAILER || 'log',
    host: process.env.MAIL_HOST || '127.0.0.1',
    port: parseInt(process.env.MAIL_PORT || '2525', 10),
    username: process.env.MAIL_USERNAME === 'null' ? undefined : process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD === 'null' ? undefined : process.env.MAIL_PASSWORD,
    fromAddress: process.env.MAIL_FROM_ADDRESS || 'info@example.com',
    fromName: process.env.MAIL_FROM_NAME || 'NestJS App',
}));
//# sourceMappingURL=mail.config.js.map
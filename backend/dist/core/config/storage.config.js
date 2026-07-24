"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('storage', () => ({
    disk: process.env.FILESYSTEM_DISK || 'local',
    localUploadDir: './uploads',
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
        bucket: process.env.AWS_BUCKET,
        usePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
    },
}));
//# sourceMappingURL=storage.config.js.map
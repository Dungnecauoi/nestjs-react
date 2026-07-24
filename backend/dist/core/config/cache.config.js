"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('cache', () => ({
    store: process.env.CACHE_STORE || 'memory',
    prefix: process.env.CACHE_PREFIX || 'app_cache_',
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
    redisPassword: process.env.REDIS_PASSWORD === 'null' ? undefined : process.env.REDIS_PASSWORD,
}));
//# sourceMappingURL=cache.config.js.map
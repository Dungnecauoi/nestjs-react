"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => {
    const connections = {};
    const primaryDriver = process.env.DB_CONNECTION || 'mysql';
    const primaryHost = process.env.DB_HOST || '127.0.0.1';
    const primaryPort = parseInt(process.env.DB_PORT || '3306', 10);
    const primaryDb = process.env.DB_DATABASE || 'nestjs_core';
    const primaryUser = process.env.DB_USERNAME || 'root';
    const primaryPass = process.env.DB_PASSWORD || '';
    connections['primary'] = {
        driver: primaryDriver,
        host: primaryHost,
        port: primaryPort,
        database: primaryDb,
        username: primaryUser,
        password: primaryPass,
        url: process.env.DATABASE_URL ||
            `${primaryDriver}://${primaryUser}:${primaryPass}@${primaryHost}:${primaryPort}/${primaryDb}`,
    };
    Object.keys(process.env).forEach((envKey) => {
        if (envKey === 'SECOND_DATABASE_URL' && process.env.SECOND_DATABASE_URL) {
            connections['secondary'] = {
                driver: process.env.DB2_CONNECTION || 'mysql',
                url: process.env.SECOND_DATABASE_URL,
            };
        }
        else if (envKey === 'MONGO_DATABASE_URL' && process.env.MONGO_DATABASE_URL) {
            connections['mongodb'] = {
                driver: 'mongodb',
                url: process.env.MONGO_DATABASE_URL,
            };
        }
        if (envKey.startsWith('DB_') && envKey.endsWith('_URL') && envKey !== 'DATABASE_URL') {
            const connName = envKey
                .replace(/^DB_/, '')
                .replace(/_URL$/, '')
                .toLowerCase();
            const urlValue = process.env[envKey];
            if (urlValue) {
                const driverMatch = urlValue.match(/^([a-z0-9]+):\/\//i);
                const driver = driverMatch ? driverMatch[1].toLowerCase() : 'unknown';
                connections[connName] = {
                    driver,
                    url: urlValue,
                };
            }
        }
    });
    return {
        default: process.env.DB_CONNECTION || 'mysql',
        connections,
    };
});
//# sourceMappingURL=database.config.js.map
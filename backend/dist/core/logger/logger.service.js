"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston = __importStar(require("winston"));
require("winston-daily-rotate-file");
let CustomLoggerService = class CustomLoggerService {
    logger;
    constructor() {
        const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
            dirname: './logs',
            filename: 'app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
            level: process.env.LOG_LEVEL || 'debug',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        });
        const errorRotateFileTransport = new winston.transports.DailyRotateFile({
            dirname: './logs',
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        });
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'debug',
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.colorize({ all: true }), winston.format.printf(({ timestamp, level, message, context }) => {
                        return `[NestCore] ${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}`;
                    })),
                }),
                dailyRotateFileTransport,
                errorRotateFileTransport,
            ],
        });
    }
    log(message, context) {
        this.logger.info(message, { context });
    }
    error(message, trace, context) {
        this.logger.error(message, { trace, context });
    }
    warn(message, context) {
        this.logger.warn(message, { context });
    }
    debug(message, context) {
        this.logger.debug(message, { context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context });
    }
};
exports.CustomLoggerService = CustomLoggerService;
exports.CustomLoggerService = CustomLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CustomLoggerService);
//# sourceMappingURL=logger.service.js.map
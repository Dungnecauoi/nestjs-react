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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const nestjs_i18n_1 = require("nestjs-i18n");
const path = __importStar(require("path"));
const app_config_1 = __importDefault(require("./config/app.config"));
const auth_config_1 = __importDefault(require("./config/auth.config"));
const database_config_1 = __importDefault(require("./config/database.config"));
const cache_config_1 = __importDefault(require("./config/cache.config"));
const storage_config_1 = __importDefault(require("./config/storage.config"));
const mail_config_1 = __importDefault(require("./config/mail.config"));
const logging_config_1 = __importDefault(require("./config/logging.config"));
const logger_module_1 = require("./logger/logger.module");
const storage_module_1 = require("./storage/storage.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const database_module_1 = require("./database/database.module");
const options_module_1 = require("./options/options.module");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
            options_module_1.OptionsModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                load: [
                    app_config_1.default,
                    auth_config_1.default,
                    database_config_1.default,
                    cache_config_1.default,
                    storage_config_1.default,
                    mail_config_1.default,
                    logging_config_1.default,
                ],
            }),
            nestjs_i18n_1.I18nModule.forRootAsync({
                useFactory: (configService) => ({
                    fallbackLanguage: configService.get('app.fallbackLocale') || 'en',
                    loaderOptions: {
                        path: path.join(process.cwd(), 'src/i18n/'),
                        watch: true,
                    },
                }),
                resolvers: [
                    new nestjs_i18n_1.QueryResolver(['lang', 'locale']),
                    new nestjs_i18n_1.HeaderResolver(['x-custom-lang']),
                    new nestjs_i18n_1.AcceptLanguageResolver(),
                ],
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: parseInt(config.get('THROTTLE_TTL') || '60', 10),
                        limit: parseInt(config.get('THROTTLE_LIMIT') || '100', 10),
                    },
                ],
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            logger_module_1.LoggerModule,
            storage_module_1.StorageModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
        exports: [
            config_1.ConfigModule,
            nestjs_i18n_1.I18nModule,
            logger_module_1.LoggerModule,
            storage_module_1.StorageModule,
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
        ],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map
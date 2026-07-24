"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const logger_service_1 = require("./core/logger/logger.service");
const http_exception_filter_1 = require("./core/exceptions/http-exception.filter");
const transform_interceptor_1 = require("./core/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const logger = app.get(logger_service_1.CustomLoggerService);
    app.useLogger(logger);
    const apiPrefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(apiPrefix, {
        exclude: ['health'],
    });
    app.use((req, res, next) => {
        if (req.url === '/' || req.url === '') {
            return res.redirect(`/${apiPrefix}`);
        }
        next();
    });
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'), {
        prefix: '/public/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(logger));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ECOMCX ERP Core Framework API')
        .setDescription('Tài liệu API hệ thống NestJS Core Framework (Batteries-Included)')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.APP_PORT || 3000;
    await app.listen(port);
    logger.log(`Server đang chạy tại: http://localhost:${port}`);
    logger.log(`API Prefix: http://localhost:${port}/${apiPrefix}`);
    logger.log(`Tài liệu Swagger UI tại: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

import { CustomLoggerService } from './core/logger/logger.service';
import { HttpExceptionFilter } from './core/exceptions/http-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // 1. Core Logger Integration
  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);

  // 2. Global API Prefix (Laravel routes/api.php equivalent)
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health'], // Chỉ ngoại trừ route /health
  });

  // Tự động chuyển hướng từ root / sang /api
  app.use((req: any, res: any, next: any) => {
    if (req.url === '/' || req.url === '') {
      return res.redirect(`/${apiPrefix}`);
    }
    next();
  });

  // 3. Global Security & Middlewares
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 4. Static File Serving (Laravel Storage Link & Public Assets Equivalent)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 5. Global Validation Pipe (Form Request Equivalent)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Global Interceptor & Exception Filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // 7. Swagger API Documentation (/api/docs)
  const config = new DocumentBuilder()
    .setTitle('ECOMCX ERP Core Framework API')
    .setDescription('Tài liệu API hệ thống NestJS Core Framework (Batteries-Included)')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  logger.log(`Server đang chạy tại: http://localhost:${port}`);
  logger.log(`API Prefix: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Tài liệu Swagger UI tại: http://localhost:${port}/api/docs`);
}
bootstrap();

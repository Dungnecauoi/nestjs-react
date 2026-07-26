import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { DepartmentModule } from './modules/department/department.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuditModule } from './modules/audit/audit.module';
import { TranslationModule } from './modules/translation/translation.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { AuditInterceptor } from './core/interceptors/audit.interceptor';
import { MaintenanceGuard } from './core/guards/maintenance.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    CoreModule,
    RoleModule,
    UserModule,
    DepartmentModule,
    PermissionModule,
    MediaModule,
    NotificationModule,
    AuditModule,
    TranslationModule,
    ImportExportModule,
    MaintenanceModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}

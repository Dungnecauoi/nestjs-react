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
import { AuditInterceptor } from './core/interceptors/audit.interceptor';

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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}

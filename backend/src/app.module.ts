import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { DepartmentModule } from './modules/department/department.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    CoreModule,
    EmployeeModule,
    RoleModule,
    UserModule,
    DepartmentModule,
    PermissionModule,
    MediaModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Thông tin hệ thống Root API' })
  getRoot() {
    return {
      name: process.env.APP_NAME || 'ECOMCX ERP Core Framework API',
      version: '1.0.0',
      status: 'online',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }
}

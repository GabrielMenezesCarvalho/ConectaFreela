import { Controller, Get, ParseUUIDPipe, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  metrics(@Query('adminUserId', ParseUUIDPipe) adminUserId: string) {
    return this.adminService.metrics(adminUserId);
  }
}

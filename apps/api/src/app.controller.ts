import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { HealthResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}

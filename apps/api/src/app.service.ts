import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: 'healthy';
  service: 'conectafreela-api';
  version: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: 'healthy',
      service: 'conectafreela-api',
      version: process.env.APP_VERSION ?? '0.1.0',
    };
  }
}

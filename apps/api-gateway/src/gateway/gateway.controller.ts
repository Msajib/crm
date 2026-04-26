import {
  Controller, All, Req, Res, Param, UseGuards, Next
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard, Public } from '../guards/jwt-auth.guard';

// ─── Route Map: path prefix → service URL ────────────────────
const SERVICE_ROUTES: Record<string, string> = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  users: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  tenants: process.env.TENANT_SERVICE_URL || 'http://localhost:3002',
  contacts: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  deals: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  pipelines: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  tasks: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  communications: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004',
  campaigns: process.env.MARKETING_SERVICE_URL || 'http://localhost:3005',
  social: process.env.MARKETING_SERVICE_URL || 'http://localhost:3005',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  invoices: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3007',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:3008',
};

@ApiTags('gateway')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class GatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  // Public routes — no auth required
  @Public()
  @All('auth/*')
  async proxyAuth(@Req() req: Request) {
    const path = req.path.replace('/api/v1', '');
    return this.proxyService.forward(
      SERVICE_ROUTES.auth,
      req.method,
      path,
      req.body,
    );
  }

  // Protected proxy routes — pass auth context headers downstream
  @All(':service/*')
  @ApiBearerAuth()
  async proxyRequest(@Req() req: Request, @Param('service') service: string) {
    const serviceUrl = SERVICE_ROUTES[service];
    if (!serviceUrl) {
      return { error: `Unknown service: ${service}` };
    }

    const path = req.path.replace('/api/v1', '');
    const authHeaders = {
      'x-user-id': req.headers['x-user-id'] as string,
      'x-tenant-id': req.headers['x-tenant-id'] as string,
      'x-user-role': req.headers['x-user-role'] as string,
      'x-user-permissions': req.headers['x-user-permissions'] as string,
    };

    return this.proxyService.forward(
      serviceUrl,
      req.method,
      path,
      req.method === 'GET' ? req.query : req.body,
      authHeaders,
    );
  }
}

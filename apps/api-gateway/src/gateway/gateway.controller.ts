import {
  Controller, All, Req, Res, Param, UseGuards, Next, Post
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard, Public } from '../guards/jwt-auth.guard';

// ─── Route Map: path prefix → service URL ────────────────────
const SERVICE_ROUTES: Record<string, string> = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  users: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  roles: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  tenants: process.env.TENANT_SERVICE_URL || 'http://localhost:3002',
  contacts: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  deals: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  pipelines: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  tasks: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  communications: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004',
  marketing: process.env.MARKETING_SERVICE_URL || 'http://localhost:3005',
  campaigns: process.env.MARKETING_SERVICE_URL || 'http://localhost:3005',
  social: process.env.MARKETING_SERVICE_URL || 'http://localhost:3005',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  invoices: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  smtp: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004',
  emails: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3007',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:3008',
  crm: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  dashboard: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  notifications: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004',
  'email-config': process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004',
  import: process.env.IMPORT_SERVICE_URL || 'http://localhost:3009',
  webhooks: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
  credentials: process.env.CREDENTIAL_SERVICE_URL || 'http://localhost:3010',
  voice: process.env.VOICE_SERVICE_URL || 'http://localhost:3011',
};

@ApiTags('gateway')
@Controller(['api', 'api/v1'])
export class GatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  // Public routes — no auth required
  @Public()
  @Post('auth/login')
  async login(@Req() req: Request) {
    return this.proxyAuth(req);
  }

  @Public()
  @Post('auth/register')
  async register(@Req() req: Request) {
    return this.proxyAuth(req);
  }

  @Public()
  @All('auth/*')
  async proxyAuth(@Req() req: Request) {
    // Robust path normalization: 
    // 1. Get the original URL (includes query params)
    // 2. Remove the base prefixes /api/v1 or /api
    let path = req.originalUrl || req.url;
    path = path.replace(/^\/api\/v1/, '').replace(/^\/api/, '');
    
    const headers: Record<string, string> = {};
    if (req.headers.authorization) {
      headers['authorization'] = req.headers.authorization;
    }

    return this.proxyService.forward(
      SERVICE_ROUTES.auth,
      req.method,
      path,
      req.body,
      headers
    );
  }

  // Protected proxy routes — pass auth context headers downstream
  @All(':service')
  @ApiBearerAuth()
  async proxyBaseRequest(@Req() req: Request, @Param('service') service: string) {
    return this.proxyRequest(req, service);
  }

  @All(':service/*')
  @ApiBearerAuth()
  async proxyRequest(@Req() req: Request, @Param('service') service: string) {
    const serviceUrl = SERVICE_ROUTES[service];
    if (!serviceUrl) {
      return { error: `Unknown service: ${service}` };
    }

    // Robust path normalization: 
    // 1. Get the original URL (includes query params)
    // 2. Remove the base prefixes /api/v1 or /api
    let path = req.originalUrl || req.url;
    path = path.replace(/^\/api\/v1/, '').replace(/^\/api/, '');

    // Map service name to its controller prefix in the downstream service
    const servicePrefixes: Record<string, string> = {
      'notifications': '/communications',
      'email-config': '/communications',
      'social': '/marketing',
      'campaigns': '/marketing',
      'marketing': '/marketing',
      'communications': '/communications',
      'tenants': '/tenants',
      'ai': '/ai',
      'webhooks': '',
      'dashboard': '',
      'crm': '',
      'leads': '',
      'contacts': '',
      'deals': '',
      'tasks': '',
      'billing': '',
      'payments': '',
      'roles': '',
      'credentials': '/credentials',
      'voice': '/voice',
    };

    const prefix = servicePrefixes[service] || `/${service}`;
    
    // Ensure the path starts with the required service prefix if specified
    if (prefix && !path.startsWith(prefix)) {
      path = `${prefix}${path}`;
    }

    const authHeaders: Record<string, string> = {
      'x-user-id': req.headers['x-user-id'] as string,
      'x-tenant-id': req.headers['x-tenant-id'] as string,
      'x-user-role': req.headers['x-user-role'] as string,
      'x-user-permissions': req.headers['x-user-permissions'] as string,
    };

    if (req.headers.authorization) {
      authHeaders['authorization'] = req.headers.authorization;
    }

    console.log(`[Proxy] ${req.method} ${service} -> ${serviceUrl}${path}`);

    return this.proxyService.forward(
      serviceUrl,
      req.method,
      path,
      req.body,
      authHeaders,
    );
  }
}

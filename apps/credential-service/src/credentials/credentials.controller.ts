import { Controller, Get, Post, Delete, Body, Param, Req, UnauthorizedException } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { Request } from 'express';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) throw new UnauthorizedException('Tenant ID missing');
    return tenantId;
  }

  @Get()
  async getCredentials(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    return this.credentialsService.getCredentials(tenantId);
  }

  @Post()
  async saveCredential(@Req() req: Request, @Body() body: { type: string, provider: string, credentials: any }) {
    const tenantId = this.getTenantId(req);
    return this.credentialsService.saveCredential(tenantId, body.type, body.provider, body.credentials);
  }

  @Get('features')
  async getFeatureGates(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    return this.credentialsService.getFeatureGates(tenantId);
  }

  @Post('test/:type')
  async testCredential(@Req() req: Request, @Param('type') type: string) {
    const tenantId = this.getTenantId(req);
    return this.credentialsService.testCredential(tenantId, type);
  }

  @Get('reveal/:type')
  async revealCredential(@Req() req: Request, @Param('type') type: string) {
    const tenantId = this.getTenantId(req);
    const userRole = req.headers['x-user-role'] as string;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
        throw new UnauthorizedException('Insufficient permissions');
    }
    return this.credentialsService.revealCredential(tenantId, type);
  }

  @Delete(':type')
  async deleteCredential(@Req() req: Request, @Param('type') type: string) {
    const tenantId = this.getTenantId(req);
    return this.credentialsService.deleteCredential(tenantId, type);
  }
}

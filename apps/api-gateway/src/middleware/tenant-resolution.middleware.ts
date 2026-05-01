import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    
    // Skip internal/direct IP access or localhost without subdomain
    if (host.includes('localhost') && !host.includes('.')) {
      return next();
    }

    try {
      const tenantServiceUrl = process.env.TENANT_SERVICE_URL || 'http://localhost:3002';
      let tenant;
      
      const hostParts = host.split('.');
      const baseDomainParts = (process.env.BASE_DOMAIN || 'localhost').split('.');
      
      if (hostParts.length > baseDomainParts.length) {
        // subdomain extraction
        const subdomain = hostParts[0];
        const response = await axios.get(`${tenantServiceUrl}/tenants/by-slug/${subdomain}`);
        tenant = response.data;
      } else {
        // custom domain
        const response = await axios.get(`${tenantServiceUrl}/tenants/by-domain/${host}`);
        tenant = response.data;
      }

      if (tenant && tenant.id) {
        req.headers['x-tenant-id'] = tenant.id;
      }
    } catch (e) {
      // Ignored for now - let normal auth flow handle tenant mapping
      // console.error('Failed to resolve tenant from host', e.message);
    }
    
    next();
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    
    // Safety bypass for critical public routes
    const url = request.url;
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/social/webhooks')) {
      return true;
    }
    const token = this.extractToken(request);

    if (!token || token === 'null' || token === 'undefined') {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // Attach user to request
      request['user'] = payload;
      // Forward tenantId header for downstream services
      request.headers['x-user-id'] = payload.sub;
      
      // Support impersonation for Super Admins
      const impersonatedTenantId = request.headers['x-impersonate-tenant-id'];
      if (payload.role === 'SUPER_ADMIN' && impersonatedTenantId) {
        request.headers['x-tenant-id'] = impersonatedTenantId;
      } else {
        request.headers['x-tenant-id'] = payload.tenantId;
      }

      request.headers['x-user-role'] = payload.role;
      request.headers['x-user-permissions'] = JSON.stringify(payload.permissions);
      return true;
    } catch (err) {
      console.error('JWT Verification Error:', err.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: any): string | null {
    // 1. Try Authorization Header
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;

    // 2. Try Cookie Header (fallback)
    const cookieToken = request.cookies?.token;
    if (cookieToken) return cookieToken;

    return null;
  }
}

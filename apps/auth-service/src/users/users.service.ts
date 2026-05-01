import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ─── Create Staff (by Admin) ──────────────────────────────────
  async createStaff(adminTenantId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    let permissions = dto.permissions || [];
    if (dto.customRoleId) {
      const role = await this.prisma.customRole.findUnique({ where: { id: dto.customRoleId } });
      if (role) {
        // Merge permissions or override? Let's override with role permissions if not explicitly provided
        if (!dto.permissions || dto.permissions.length === 0) {
          permissions = role.permissions;
        }
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        tenantId: adminTenantId,
        role: (dto.role as any) || 'STAFF',
        customRoleId: dto.customRoleId,
        permissions,
      },
      include: {
        customRole: true
      }
    });

    return this.sanitizeUser(user);
  }

  // ─── List Staff for a Tenant ──────────────────────────────────
  async listStaff(tenantId: string, excludeId?: string, page = 1, limit = 20, search?: string) {
    const where: any = { 
      tenantId, 
      role: { in: ['STAFF', 'ADMIN'] },
      ...(excludeId && { id: { not: excludeId } })
    };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customRole: true
        }
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(u => {
        // Return live role permissions so the UI always shows what the role currently grants
        const effectivePermissions =
          u.role === 'STAFF' && u.customRole
            ? u.customRole.permissions
            : u.permissions;
        return this.sanitizeUser({ ...u, permissions: effectivePermissions });
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Get Single User ──────────────────────────────────────────
  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        customRole: true
      }
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  // ─── Update User ──────────────────────────────────────────────
  async update(id: string, tenantId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    // Resolve the effective role ID (new one from DTO or existing)
    const effectiveRoleId =
      dto.customRoleId !== undefined ? dto.customRoleId : user.customRoleId;

    // Always sync permissions from the assigned custom role (authoritative source)
    let permissions = dto.permissions;
    if (effectiveRoleId) {
      const role = await this.prisma.customRole.findUnique({
        where: { id: effectiveRoleId },
      });
      if (role && (!dto.permissions || dto.permissions.length === 0)) {
        permissions = role.permissions;
      }
    } else if (dto.customRoleId === '') {
      // Role was explicitly cleared — reset permissions to empty
      permissions = [];
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.customRoleId !== undefined && {
          customRoleId: dto.customRoleId || null,
        }),
        ...(dto.role !== undefined && { role: dto.role as any }),
        ...(permissions !== undefined && { permissions }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      include: {
        customRole: true,
      },
    });

    // Return with effective permissions from role
    const effectivePermissions =
      updated.role === 'STAFF' && updated.customRole
        ? updated.customRole.permissions
        : updated.permissions;
    return this.sanitizeUser({ ...updated, permissions: effectivePermissions });
  }

  // ─── Reset Password (Admin only) ───────────────────────────────
  async resetPassword(id: string, tenantId: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return { message: 'Password reset successfully' };
  }

  // ─── Notifications ─────────────────────────────────────────────
  async getNotifications(userId: string, tenantId: string) {
    return this.prisma.notification.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAllNotificationsRead(userId: string, tenantId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, tenantId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async clearAllNotifications(userId: string, tenantId: string) {
    await this.prisma.notification.deleteMany({
      where: { userId, tenantId },
    });
    return { success: true };
  }

  // ─── Update Permissions ───────────────────────────────────────
  async updatePermissions(id: string, tenantId: string, permissions: string[]) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'SUPER_ADMIN')
      throw new ForbiddenException('Cannot modify super admin permissions');

    return this.prisma.user.update({
      where: { id },
      data: { permissions },
      select: { id: true, email: true, permissions: true },
    });
  }

  // ─── Delete (Soft — deactivate) ───────────────────────────────
  async deactivate(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'User deactivated successfully' };
  }

  // ─── Delete Permanent ─────────────────────────────────────────
  async remove(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    // Delete refresh tokens first
    await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    
    // Delete the user
    await this.prisma.user.delete({ where: { id } });
    
    return { message: 'Operative data purged successfully' };
  }

  // ─── All Admins (Super Admin/Internal) ───────────────────────
  async getAllAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tenantId: true,
        role: true,
        isActive: true,
      }
    });
    return admins;
  }

  // ─── Staff Counts (Super Admin) ───────────────────────────────
  async getStaffCounts() {
    const counts = await this.prisma.user.groupBy({
      by: ['tenantId'],
      where: { role: 'STAFF' },
      _count: { id: true },
    });

    return counts.reduce((acc, curr) => {
      acc[curr.tenantId] = curr._count.id;
      return acc;
    }, {});
  }

  // ─── Super Admin Notifications ────────────────────────────────
  async notifySuperAdmin(title: string, message: string, type: string) {
    const superAdmins = await this.prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', isActive: true },
    });

    for (const admin of superAdmins) {
      await this.createNotification(admin.id, admin.tenantId, title, message, type);
    }
    return { success: true, count: superAdmins.length };
  }

  async createNotification(userId: string, tenantId: string, title: string, message: string, type: string, link?: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        tenantId,
        title,
        message,
        type,
        link,
      },
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

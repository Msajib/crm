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

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        tenantId: adminTenantId,
        role: 'STAFF',
        customRole: dto.customRole,
        permissions: dto.permissions || [],
      },
    });

    return this.sanitizeUser(user);
  }

  // ─── List Staff for a Tenant ──────────────────────────────────
  async listStaff(tenantId: string, page = 1, limit = 20, search?: string) {
    const where: any = { tenantId, role: { in: ['STAFF', 'ADMIN'] } };
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
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          customRole: true,
          permissions: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        customRole: true,
        permissions: true,
        isActive: true,
        isVerified: true,
        avatar: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── Update User ──────────────────────────────────────────────
  async update(id: string, tenantId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.customRole !== undefined && { customRole: dto.customRole }),
        ...(dto.permissions !== undefined && { permissions: dto.permissions }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
    });

    return this.sanitizeUser(updated);
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

  async createNotification(userId: string, tenantId: string, title: string, message: string, type: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        tenantId,
        title,
        message,
        type,
      },
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

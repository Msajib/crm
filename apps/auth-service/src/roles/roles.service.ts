import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; description?: string; permissions: string[] }) {
    const existing = await this.prisma.customRole.findFirst({
      where: { tenantId, name: data.name },
    });

    if (existing) {
      throw new ConflictException(`Role with name "${data.name}" already exists in this tenant.`);
    }

    return this.prisma.customRole.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.customRole.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const role = await this.prisma.customRole.findFirst({
      where: { id, tenantId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, tenantId: string, data: { name?: string; description?: string; permissions?: string[] }) {
    await this.findOne(id, tenantId);

    // Sanitize: only pick allowed fields so extra properties (id, tenantId, _count, etc.) don't crash Prisma
    const sanitized: { name?: string; description?: string; permissions?: string[] } = {};
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || !data.name.trim()) {
        throw new BadRequestException('Role name must be a non-empty string.');
      }
      sanitized.name = data.name.trim();
    }
    if (data.description !== undefined) sanitized.description = data.description;
    if (data.permissions !== undefined) {
      if (!Array.isArray(data.permissions)) {
        throw new BadRequestException('Permissions must be an array.');
      }
      sanitized.permissions = data.permissions;
    }

    // Prevent duplicate name within the same tenant (if renaming)
    if (sanitized.name) {
      const conflict = await this.prisma.customRole.findFirst({
        where: { tenantId, name: sanitized.name, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(`A role named "${sanitized.name}" already exists.`);
      }
    }

    const updated = await this.prisma.customRole.update({
      where: { id },
      data: sanitized,
    });

    // Sync permissions to all staff users assigned this role
    if (sanitized.permissions !== undefined) {
      await this.prisma.user.updateMany({
        where: { customRoleId: id },
        data: { permissions: sanitized.permissions },
      });
    }

    return updated;
  }

  async remove(id: string, tenantId: string) {
    const role = await this.findOne(id, tenantId);
    
    // Check if any users are using this role
    const usersCount = await this.prisma.user.count({
      where: { customRoleId: id },
    });

    if (usersCount > 0) {
      throw new ConflictException('Cannot delete role that is currently assigned to users.');
    }

    return this.prisma.customRole.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContactDto, UpdateContactDto,
  CreateDealDto, UpdateDealDto,
  CreatePipelineDto, CreateTaskDto,
} from './dto/crm.dto';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════ CONTACTS ═══════════════════════════════════

  async createContact(tenantId: string, userId: string, dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        companyId: dto.companyId,
        tags: dto.tags || [],
        source: dto.source,
        notes: dto.notes,
        customFields: dto.customFields || {},
        assignedTo: dto.assignedTo || userId,
      },
      include: { company: true },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        tenantId,
        contactId: contact.id,
        userId,
        type: 'NOTE',
        subject: 'Contact created',
      },
    });

    return contact;
  }

  async listContacts(tenantId: string, page = 1, limit = 20, search?: string, status?: string) {
    const where: any = { tenantId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { company: { select: { id: true, name: true } } },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data: contacts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getContact(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        company: true,
        deals: { include: { stage: true, pipeline: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async updateContact(id: string, tenantId: string, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!contact) throw new NotFoundException('Contact not found');

    return this.prisma.contact.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
        ...(dto.companyId !== undefined && { companyId: dto.companyId }),
        ...(dto.tags && { tags: dto.tags }),
        ...(dto.source && { source: dto.source }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.customFields && { customFields: dto.customFields }),
        ...(dto.assignedTo && { assignedTo: dto.assignedTo }),
        ...(dto.status && { status: dto.status as any }),
      },
      include: { company: true },
    });
  }

  async deleteContact(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!contact) throw new NotFoundException('Contact not found');
    await this.prisma.contact.delete({ where: { id } });
    return { message: 'Contact deleted' };
  }

  // ═══════════════ PIPELINES ══════════════════════════════════

  async createPipeline(tenantId: string, dto: CreatePipelineDto) {
    const pipeline = await this.prisma.pipeline.create({
      data: {
        tenantId,
        name: dto.name,
        isDefault: dto.isDefault || false,
        stages: dto.stages
          ? {
              create: dto.stages.map((s) => ({
                name: s.name,
                order: s.order,
                color: s.color || '#6366f1',
                probability: s.probability || 0,
              })),
            }
          : {
              create: [
                { name: 'New', order: 1, color: '#6366f1', probability: 10 },
                { name: 'Qualified', order: 2, color: '#f59e0b', probability: 30 },
                { name: 'Proposal', order: 3, color: '#3b82f6', probability: 60 },
                { name: 'Negotiation', order: 4, color: '#8b5cf6', probability: 80 },
                { name: 'Won', order: 5, color: '#10b981', probability: 100 },
                { name: 'Lost', order: 6, color: '#ef4444', probability: 0 },
              ],
            },
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
    return pipeline;
  }

  async getPipelines(tenantId: string) {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      include: {
        stages: { orderBy: { order: 'asc' } },
        _count: { select: { deals: true } },
      },
    });
  }

  // ═══════════════ DEALS ══════════════════════════════════════

  async createDeal(tenantId: string, userId: string, dto: CreateDealDto) {
    return this.prisma.deal.create({
      data: {
        tenantId,
        title: dto.title,
        contactId: dto.contactId,
        pipelineId: dto.pipelineId,
        stageId: dto.stageId,
        value: dto.value || 0,
        currency: dto.currency || 'USD',
        closeDate: dto.closeDate ? new Date(dto.closeDate) : undefined,
        notes: dto.notes,
        assignedTo: dto.assignedTo || userId,
      },
      include: { contact: true, stage: true, pipeline: true },
    });
  }

  async listDeals(tenantId: string, pipelineId?: string, stageId?: string, page = 1, limit = 50) {
    const where: any = { tenantId };
    if (pipelineId) where.pipelineId = pipelineId;
    if (stageId) where.stageId = stageId;

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          stage: true,
          pipeline: { select: { id: true, name: true } },
        },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return { data: deals, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateDeal(id: string, tenantId: string, dto: UpdateDealDto) {
    const deal = await this.prisma.deal.findFirst({ where: { id, tenantId } });
    if (!deal) throw new NotFoundException('Deal not found');

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.stageId) updateData.stageId = dto.stageId;
    if (dto.value !== undefined) updateData.value = dto.value;
    if (dto.assignedTo) updateData.assignedTo = dto.assignedTo;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.lostReason) updateData.lostReason = dto.lostReason;
    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === 'WON') updateData.wonAt = new Date();
      if (dto.status === 'LOST') updateData.lostAt = new Date();
    }

    return this.prisma.deal.update({
      where: { id },
      data: updateData,
      include: { contact: true, stage: true },
    });
  }

  // ═══════════════ TASKS ══════════════════════════════════════

  async createTask(tenantId: string, userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        tenantId,
        createdBy: userId,
        title: dto.title,
        description: dto.description,
        assignedTo: dto.assignedTo || userId,
        priority: (dto.priority as any) || 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        relatedTo: dto.relatedTo,
        relatedType: dto.relatedType,
      },
    });
  }

  async listTasks(tenantId: string, assignedTo?: string, status?: string) {
    const where: any = { tenantId };
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;

    return this.prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async completeTask(id: string, tenantId: string) {
    const task = await this.prisma.task.findFirst({ where: { id, tenantId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  // ═══════════════ ACTIVITIES ═════════════════════════════════

  async getContactActivities(contactId: string, tenantId: string) {
    return this.prisma.activity.findMany({
      where: { contactId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async addActivity(
    tenantId: string,
    userId: string,
    data: { contactId?: string; dealId?: string; type: string; subject?: string; notes?: string; outcome?: string },
  ) {
    return this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        contactId: data.contactId,
        dealId: data.dealId,
        type: data.type as any,
        subject: data.subject,
        notes: data.notes,
        outcome: data.outcome,
      },
    });
  }

  // ═══════════════ DASHBOARD STATS ════════════════════════════

  async getDashboardStats(tenantId: string) {
    const [
      totalContacts,
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      totalDealValue,
      wonDealValue,
    ] = await Promise.all([
      this.prisma.contact.count({ where: { tenantId } }),
      this.prisma.deal.count({ where: { tenantId } }),
      this.prisma.deal.count({ where: { tenantId, status: 'OPEN' } }),
      this.prisma.deal.count({ where: { tenantId, status: 'WON' } }),
      this.prisma.deal.count({ where: { tenantId, status: 'LOST' } }),
      this.prisma.deal.aggregate({ where: { tenantId }, _sum: { value: true } }),
      this.prisma.deal.aggregate({ where: { tenantId, status: 'WON' }, _sum: { value: true } }),
    ]);

    return {
      contacts: { total: totalContacts },
      deals: {
        total: totalDeals,
        open: openDeals,
        won: wonDeals,
        lost: lostDeals,
        conversionRate: totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : '0',
        totalValue: totalDealValue._sum.value || 0,
        wonValue: wonDealValue._sum.value || 0,
      },
    };
  }
}

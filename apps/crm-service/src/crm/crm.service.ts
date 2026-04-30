import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContactDto, UpdateContactDto,
  CreateDealDto, UpdateDealDto,
  CreatePipelineDto, CreateTaskDto, UpdateTaskDto,
} from './dto/crm.dto';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);
  constructor(private prisma: PrismaService) {}

  // ═══════════════ CONTACTS ═══════════════════════════════════

  async createContact(tenantId: string, userId: string, dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        jobTitle: dto.jobTitle,
        email: dto.email,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        address: dto.address,
        companyId: dto.companyId,
        tags: dto.tags || [],
        source: dto.source,
        notes: dto.notes,
        customFields: dto.customFields || {},
        assignedTo: dto.assignedTo || userId,
        createdBy: userId,
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
        ...(dto.jobTitle && { jobTitle: dto.jobTitle }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
        ...(dto.address && { address: dto.address }),
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

  async updatePipeline(id: string, tenantId: string, dto: any) {
    // Basic update for pipeline name/default
    await this.prisma.pipeline.update({
      where: { id, tenantId },
      data: {
        name: dto.name,
        isDefault: dto.isDefault,
      },
    });

    // If stages are provided, we do a simple sync (delete old, create new for simplicity in this version)
    // In a production app, you'd want to handle ID matching to avoid breaking deal relations
    if (dto.stages && dto.stages.length > 0) {
      // Check if any deals are using stages we are about to delete
      // For now, let's just update names/colors if they have IDs, or create new ones
      for (const s of dto.stages) {
        if (s.id) {
          await this.prisma.pipelineStage.update({
            where: { id: s.id },
            data: {
              name: s.name,
              order: s.order,
              color: s.color,
              probability: s.probability,
            }
          });
        } else {
          await this.prisma.pipelineStage.create({
            data: {
              pipelineId: id,
              name: s.name,
              order: s.order,
              color: s.color || '#6366f1',
              probability: s.probability || 0,
            }
          });
        }
      }
    }

    return this.prisma.pipeline.findUnique({
      where: { id },
      include: { stages: { orderBy: { order: 'asc' } } }
    });
  }

  async deletePipeline(id: string, tenantId: string) {
    // Check if deals exist
    const dealsCount = await this.prisma.deal.count({ where: { pipelineId: id } });
    if (dealsCount > 0) {
      throw new Error('Cannot delete pipeline with active deals. Move deals first.');
    }

    await this.prisma.pipelineStage.deleteMany({ where: { pipelineId: id } });
    await this.prisma.pipeline.delete({ where: { id, tenantId } });
    return { message: 'Pipeline deleted' };
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
        description: dto.description,
        notes: dto.notes,
        assignedTo: dto.assignedTo || userId,
        createdBy: userId,
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
    if (dto.description !== undefined) updateData.description = dto.description;
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

  async deleteDeal(id: string, tenantId: string) {
    const deal = await this.prisma.deal.findFirst({ where: { id, tenantId } });
    if (!deal) throw new NotFoundException('Deal not found');
    await this.prisma.deal.delete({ where: { id } });
    return { message: 'Deal deleted' };
  }

  // ─── Bulk Operations ─────────────────────────────────────────
  async importRecords(tenantId: string, userId: string, module: string, data: any[]) {
    const results = [];
    for (const item of data) {
      try {
        let result;
        if (module === 'contacts') {
          // Map potential name to firstName/lastName if present
          if (item.name && !item.firstName) {
            const parts = item.name.split(' ');
            item.firstName = parts[0];
            item.lastName = parts.slice(1).join(' ') || '';
            delete item.name;
          }
          result = await this.prisma.contact.create({
            data: { ...item, tenantId, assignedTo: userId, createdBy: userId }
          });
        } else if (module === 'deals') {
          result = await this.prisma.deal.create({
            data: { ...item, tenantId, assignedTo: userId, createdBy: userId }
          });
        } else if (module === 'tasks') {
          result = await this.prisma.task.create({
            data: { ...item, tenantId, createdBy: userId, assignedTo: userId }
          });
        }
        if (result) results.push(result);
      } catch (err) {
        console.error(`Import failed for ${module}:`, err);
      }
    }
    return { imported: results.length, total: data.length };
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
        checklists: dto.checklists || [],
      },
    });
  }

  async listTasks(tenantId: string, assignedTo?: string, status?: string) {
    const where: any = { tenantId };
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;

    return this.prisma.task.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async getTask(id: string, tenantId: string) {
    const task = await this.prisma.task.findFirst({ where: { id, tenantId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async updateTask(id: string, tenantId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({ where: { id, tenantId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.assignedTo && { assignedTo: dto.assignedTo }),
        ...(dto.priority && { priority: dto.priority as any }),
        ...(dto.status && { 
          status: dto.status as any,
          completedAt: dto.status === 'COMPLETED' ? new Date() : null,
        }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        ...(dto.checklists && { checklists: dto.checklists }),
      },
    });
  }

  async deleteTask(id: string, tenantId: string) {
    const task = await this.prisma.task.findFirst({ where: { id, tenantId } });
    if (!task) throw new NotFoundException('Task not found');
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
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

  async convertLeadToDeal(contactId: string, tenantId: string, userId: string, data: any) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Update contact status to PROSPECT
        await tx.contact.update({
          where: { id: contactId },
          data: { status: 'PROSPECT' },
        });

        // 2. Create Deal
        const deal = await tx.deal.create({
          data: {
            tenantId,
            contactId,
            pipelineId: data.pipelineId,
            stageId: data.stageId,
            title: data.title || 'New Deal',
            value: data.value || 0,
            assignedTo: userId,
            status: 'OPEN',
          },
        });

        // 3. Log Activity
        await tx.activity.create({
          data: {
            tenantId,
            contactId,
            dealId: deal.id,
            userId,
            type: 'NOTE',
            subject: 'Lead Converted',
            notes: `Lead converted to deal: ${deal.title}`,
          },
        });

        return deal;
      });
    } catch (error) {
      this.logger.error(`Failed to convert lead ${contactId}: ${error.message}`);
      throw error;
    }
  }

  // ═══════════════ DASHBOARD STATS ════════════════════════════

  async getDashboardStats(tenantId: string) {
    const now = new Date();
    const [
      totalContacts,
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      totalDealValue,
      wonDealValue,
      totalTasks,
      openTasks,
      completedTasks,
      overdueTasks,
      callCount,
      emailCount,
      messageCount,
    ] = await Promise.all([
      this.prisma.contact.count({ where: { tenantId } }),
      this.prisma.deal.count({ where: { tenantId } }),
      this.prisma.deal.count({ where: { tenantId, status: 'OPEN' } }),
      this.prisma.deal.count({ where: { tenantId, status: 'WON' } }),
      this.prisma.deal.count({ where: { tenantId, status: 'LOST' } }),
      this.prisma.deal.aggregate({ where: { tenantId }, _sum: { value: true } }),
      this.prisma.deal.aggregate({ where: { tenantId, status: 'WON' }, _sum: { value: true } }),
      this.prisma.task.count({ where: { tenantId } }),
      this.prisma.task.count({ where: { tenantId, status: 'TODO' } }),
      this.prisma.task.count({ where: { tenantId, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { tenantId, status: 'TODO', dueDate: { lt: now } } }),
      this.prisma.activity.count({ where: { tenantId, type: 'CALL' } }),
      this.prisma.activity.count({ where: { tenantId, type: 'EMAIL' } }),
      this.prisma.activity.count({ where: { tenantId, type: { in: ['SMS', 'WHATSAPP'] } } }),
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
      tasks: {
        total: totalTasks,
        open: openTasks,
        completed: completedTasks,
        overdue: overdueTasks,
      },
      activities: {
        calls: callCount,
        emails: emailCount,
        messages: messageCount,
      },
    };
  }

  // ═══════════════ GLOBAL SEARCH ══════════════════════════════

  async search(tenantId: string, query: string) {
    if (!query) return [];

    const [contacts, deals, tasks] = await Promise.all([
      this.prisma.contact.findMany({
        where: {
          tenantId,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, firstName: true, lastName: true },
      }),
      this.prisma.deal.findMany({
        where: {
          tenantId,
          title: { contains: query, mode: 'insensitive' },
        },
        take: 5,
        select: { id: true, title: true },
      }),
      this.prisma.task.findMany({
        where: {
          tenantId,
          title: { contains: query, mode: 'insensitive' },
        },
        take: 5,
        select: { id: true, title: true },
      }),
    ]);

    return [
      ...contacts.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, type: 'Contact' })),
      ...deals.map(d => ({ id: d.id, name: d.title, type: 'Deal' })),
      ...tasks.map(t => ({ id: t.id, name: t.title, type: 'Task' })),
    ];
  }

  // ═══════════════ WEBHOOKS ═══════════════════════════════════

  async listWebhooks(tenantId: string) {
    return this.prisma.webhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWebhook(tenantId: string, dto: any) {
    return this.prisma.webhook.create({
      data: {
        tenantId,
        name: dto.name,
        url: dto.url,
        events: dto.events || [],
        isActive: dto.isActive ?? true,
        secret: dto.secret,
      },
    });
  }

  async updateWebhook(id: string, tenantId: string, dto: any) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook not found');

    return this.prisma.webhook.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.url && { url: dto.url }),
        ...(dto.events && { events: dto.events }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.secret !== undefined && { secret: dto.secret }),
      },
    });
  }

  async deleteWebhook(id: string, tenantId: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook not found');

    await this.prisma.webhook.delete({ where: { id } });
    return { message: 'Webhook deleted' };
  }
}

import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import {
  CreateContactDto, UpdateContactDto,
  CreateDealDto, UpdateDealDto,
  CreatePipelineDto, CreateTaskDto,
} from './dto/crm.dto';

@ApiTags('crm')
@ApiBearerAuth()
@Controller()
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ─── Dashboard ───────────────────────────────────────────────
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard overview stats' })
  async getDashboardStats(@Headers('x-tenant-id') tenantId: string) {
    return this.crmService.getDashboardStats(tenantId);
  }

  // ─── Contacts ────────────────────────────────────────────────
  @Post('contacts')
  @ApiOperation({ summary: 'Create new contact' })
  async createContact(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.crmService.createContact(tenantId, userId, dto);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'List all contacts with pagination & search' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  async listContacts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.crmService.listContacts(tenantId, +page, +limit, search, status);
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Get contact with full activity timeline' })
  async getContact(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.getContact(id, tenantId);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Update contact' })
  async updateContact(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.crmService.updateContact(id, tenantId, dto);
  }

  @Delete('contacts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete contact' })
  async deleteContact(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.deleteContact(id, tenantId);
  }

  @Get('contacts/:id/activities')
  @ApiOperation({ summary: 'Get contact activity timeline' })
  async getContactActivities(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') contactId: string,
  ) {
    return this.crmService.getContactActivities(contactId, tenantId);
  }

  @Post('activities')
  @ApiOperation({ summary: 'Log a new activity (call, email, note, etc.)' })
  async addActivity(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: any,
  ) {
    return this.crmService.addActivity(tenantId, userId, body);
  }

  // ─── Pipelines ───────────────────────────────────────────────
  @Post('pipelines')
  @ApiOperation({ summary: 'Create a deal pipeline' })
  async createPipeline(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreatePipelineDto,
  ) {
    return this.crmService.createPipeline(tenantId, dto);
  }

  @Get('pipelines')
  @ApiOperation({ summary: 'List all pipelines' })
  async getPipelines(@Headers('x-tenant-id') tenantId: string) {
    return this.crmService.getPipelines(tenantId);
  }

  // ─── Deals ───────────────────────────────────────────────────
  @Post('deals')
  @ApiOperation({ summary: 'Create a new deal' })
  async createDeal(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateDealDto,
  ) {
    return this.crmService.createDeal(tenantId, userId, dto);
  }

  @Get('deals')
  @ApiOperation({ summary: 'List deals (Kanban view data)' })
  @ApiQuery({ name: 'pipelineId', required: false })
  @ApiQuery({ name: 'stageId', required: false })
  @ApiQuery({ name: 'page', required: false })
  async listDeals(
    @Headers('x-tenant-id') tenantId: string,
    @Query('pipelineId') pipelineId?: string,
    @Query('stageId') stageId?: string,
    @Query('page') page = 1,
  ) {
    return this.crmService.listDeals(tenantId, pipelineId, stageId, +page);
  }

  @Put('deals/:id')
  @ApiOperation({ summary: 'Update a deal (incl. stage move, win/loss)' })
  async updateDeal(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.crmService.updateDeal(id, tenantId, dto);
  }

  // ─── Tasks ───────────────────────────────────────────────────
  @Post('tasks')
  @ApiOperation({ summary: 'Create a task' })
  async createTask(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.crmService.createTask(tenantId, userId, dto);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'List tasks' })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'status', required: false })
  async listTasks(
    @Headers('x-tenant-id') tenantId: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
  ) {
    return this.crmService.listTasks(tenantId, assignedTo, status);
  }

  @Patch('tasks/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark task as completed' })
  async completeTask(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.completeTask(id, tenantId);
  }
}

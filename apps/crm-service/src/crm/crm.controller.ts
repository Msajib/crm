import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Headers, HttpCode, HttpStatus, ConflictException
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import {
  CreateContactDto, UpdateContactDto,
  CreateDealDto, UpdateDealDto,
  CreatePipelineDto, CreateTaskDto, UpdateTaskDto,
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

  @Get('crm/search')
  @ApiOperation({ summary: 'Global search across contacts, deals, and tasks' })
  @ApiQuery({ name: 'q', required: true })
  async search(
    @Headers('x-tenant-id') tenantId: string,
    @Query('q') q: string,
  ) {
    return this.crmService.search(tenantId, q);
  }

  // ─── Contacts ────────────────────────────────────────────────
  @Post('contacts')
  @ApiOperation({ summary: 'Create new contact' })
  async createContact(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateContactDto,
  ) {
    const duplicate = await this.crmService.checkDuplicate(tenantId, dto.email, dto.phone);
    if (duplicate) {
      throw new ConflictException('Contact with this email or phone already exists');
    }
    return this.crmService.createContact(tenantId, userId, dto);
  }

  @Post('contacts/internal/import')
  @ApiOperation({ summary: 'Internal bulk import contact' })
  async internalImportContact(@Body() body: any) {
    const { tenantId, userId, ...dto } = body;
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

  @Post('contacts/:id/convert-to-deal')
  @ApiOperation({ summary: 'Convert lead to deal' })
  async convertLead(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.crmService.convertLeadToDeal(id, tenantId, userId, dto);
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

  @Get('contacts/:id/timeline')
  @ApiOperation({ summary: 'Get contact activity timeline (new)' })
  async getContactTimeline(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') contactId: string,
  ) {
    return this.crmService.getContactTimeline(tenantId, contactId);
  }

  @Patch('contacts/:id/assign')
  @ApiOperation({ summary: 'Assign contact to staff' })
  async assignContact(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body('assignedTo') assignedTo: string,
  ) {
    return this.crmService.assignContact(tenantId, id, assignedTo, userId);
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

  @Put('pipelines/:id')
  @ApiOperation({ summary: 'Update a pipeline' })
  async updatePipeline(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.crmService.updatePipeline(id, tenantId, dto);
  }

  @Delete('pipelines/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a pipeline' })
  async deletePipeline(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.deletePipeline(id, tenantId);
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

  @Delete('deals/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a deal' })
  async deleteDeal(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.deleteDeal(id, tenantId);
  }

  // ─── Bulk Operations ─────────────────────────────────────────
  @Post(':module/import')
  @ApiOperation({ summary: 'Bulk import records from CSV/JSON' })
  async importRecords(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('module') module: string,
    @Body() body: any[],
  ) {
    return this.crmService.importRecords(tenantId, userId, module, body);
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

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get a specific task' })
  async getTask(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.getTask(id, tenantId);
  }

  @Put('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  async updateTask(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.crmService.updateTask(id, tenantId, dto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  async deleteTask(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.deleteTask(id, tenantId);
  }

  // ─── Webhooks ───────────────────────────────────────────────
  @Get('webhooks')
  @ApiOperation({ summary: 'List all webhooks' })
  async listWebhooks(@Headers('x-tenant-id') tenantId: string) {
    return this.crmService.listWebhooks(tenantId);
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Create a new webhook' })
  async createWebhook(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: any,
  ) {
    return this.crmService.createWebhook(tenantId, dto);
  }

  @Put('webhooks/:id')
  @ApiOperation({ summary: 'Update a webhook' })
  async updateWebhook(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.crmService.updateWebhook(id, tenantId, dto);
  }

  @Delete('webhooks/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a webhook' })
  async deleteWebhook(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.deleteWebhook(id, tenantId);
  }
}

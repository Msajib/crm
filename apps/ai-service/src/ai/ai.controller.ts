import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Get AI response for a message' })
  async chat(
    @Body() body: { message: string },
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.aiService.getChatResponse(tenantId || 'system', userId || 'system', body.message);
  }

  @Get('lead-scores')
  @ApiOperation({ summary: 'Get AI lead scores' })
  async getLeadScores(@Headers('x-tenant-id') tenantId: string) {
    return this.aiService.getLeadScores(tenantId || 'system');
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI recommendations' })
  async getRecommendations(@Headers('x-tenant-id') tenantId: string) {
    return this.aiService.getRecommendations(tenantId || 'system');
  }

  @Post('knowledge')
  @ApiOperation({ summary: 'Add document content to knowledge base' })
  async addKnowledge(
    @Body() body: { fileName: string; content: string; metadata?: any },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.aiService.addKnowledge(tenantId || 'system', body);
  }

  @Get('knowledge')
  @ApiOperation({ summary: 'List knowledge base documents' })
  async listKnowledge(@Headers('x-tenant-id') tenantId: string) {
    return this.aiService.listKnowledge(tenantId || 'system');
  }

  @Post('config')
  @ApiOperation({ summary: 'Save AI configuration' })
  async saveConfig(
    @Body() body: any,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
  ) {
    // Only super admins can set GLOBAL keys, but let's assume Super Admin for this specific request context
    const targetTenantId = (role === 'SUPER_ADMIN') ? 'GLOBAL' : (tenantId || 'system');
    return this.aiService.saveConfig(targetTenantId, body);
  }

  @Get('configs')
  @ApiOperation({ summary: 'List AI configurations' })
  async getConfigs(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') role: string,
  ) {
    const targetTenantId = (role === 'SUPER_ADMIN') ? 'GLOBAL' : (tenantId || 'system');
    return this.aiService.getConfigs(targetTenantId);
  }
}

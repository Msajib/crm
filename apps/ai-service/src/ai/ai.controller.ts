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
}

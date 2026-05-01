import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
  Get,
  UseInterceptors,
  Res,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VoiceService } from './voice.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('voice')
@Controller('voice')
export class VoiceController {
  private readonly logger = new Logger(VoiceController.name);

  constructor(private readonly voiceService: VoiceService) {}

  // ─── POST /voice/generate-script ────────────────────────────
  @Post('generate-script')
  @ApiOperation({ summary: 'Generate AI-personalised call script from template + lead data' })
  async generateScript(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { leadData: Record<string, any>; templateText: string },
  ) {
    const script = await this.voiceService.generateScript(
      tenantId,
      body.leadData,
      body.templateText,
    );
    return { script };
  }

  // ─── POST /voice/generate-audio ─────────────────────────────
  @Post('generate-audio')
  @ApiOperation({ summary: 'Convert script text to MP3 audio via ElevenLabs TTS' })
  async generateAudio(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { script: string },
  ) {
    const audioUrl = await this.voiceService.generateAudio(tenantId, body.script);
    return { audioUrl };
  }

  // ─── POST /voice/place-call ──────────────────────────────────
  @Post('place-call')
  @ApiOperation({ summary: 'Place outbound Twilio call that plays audio URL' })
  async placeCall(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { toPhone: string; audioUrl: string },
  ) {
    return this.voiceService.placeCall(tenantId, body.toPhone, body.audioUrl);
  }

  // ─── POST /voice/campaign ────────────────────────────────────
  @Post('campaign')
  @ApiOperation({
    summary: 'Run a full AI voice campaign: script → audio → call for each lead',
  })
  async runCampaign(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    body: {
      campaignId: string;
      leadIds: string[];
      templateText: string;
    },
  ) {
    return this.voiceService.processCampaignCall(
      tenantId,
      body.campaignId,
      body.leadIds,
      body.templateText,
    );
  }

  // ─── POST /voice/webhook/status ─────────────────────────────
  @Post('webhook/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Twilio call status webhook — updates CallLog on completion' })
  async callStatusWebhook(@Body() payload: any) {
    await this.voiceService.handleCallStatusWebhook(payload);
    // Twilio expects a 200 with empty TwiML or plain text
    return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
  }

  // ─── GET /audio/:filename ────────────────────────────────────
  @Get('audio/:filename')
  @ApiOperation({ summary: 'Serve generated audio files' })
  serveAudio(@Param('filename') filename: string, @Res() res: Response) {
    const uploadsDir = path.join(
      __dirname,
      '..',
      '..',
      process.env.UPLOADS_DIR || 'uploads',
    );
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    fs.createReadStream(filePath).pipe(res);
  }
}

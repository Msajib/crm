import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private readonly credentialServiceUrl =
    process.env.CREDENTIAL_SERVICE_URL || 'http://localhost:3010';
  private readonly crmServiceUrl =
    process.env.CRM_SERVICE_URL || 'http://localhost:3003';
  private readonly commServiceUrl =
    process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3004';
  private readonly publicUrl =
    process.env.PUBLIC_URL || 'http://localhost:3011';
  private readonly uploadsDir = path.join(
    __dirname,
    '..',
    '..',
    process.env.UPLOADS_DIR || 'uploads',
  );

  // ─── Credential Helper ────────────────────────────────────────

  private async getCredential(tenantId: string, type: string): Promise<any> {
    try {
      const { data } = await axios.get(
        `${this.credentialServiceUrl}/credentials/reveal/${type}`,
        { headers: { 'x-tenant-id': tenantId } },
      );
      return data.credentials;
    } catch (err) {
      this.logger.error(
        `Cannot fetch ${type} credential for ${tenantId}: ${err.message}`,
      );
      throw new BadRequestException(
        `${type} credentials not configured. Add them in Settings → Integrations.`,
      );
    }
  }

  // ─── 1. generateScript ────────────────────────────────────────
  /**
   * Calls OpenAI (or Gemini as fallback) to personalise a template string
   * with lead data. Returns a ready-to-speak plain-text script.
   */
  async generateScript(
    tenantId: string,
    leadData: Record<string, any>,
    templateText: string,
  ): Promise<string> {
    let creds: any;
    let provider = 'openai';

    try {
      creds = await this.getCredential(tenantId, 'AI');
      provider = creds.provider?.toLowerCase() || 'openai';
    } catch {
      // If no AI credential, just do a simple token replacement and return
      this.logger.warn(`No AI credential; falling back to simple template replacement.`);
      return this.simpleTemplateReplace(templateText, leadData);
    }

    const prompt = `You are a professional sales call script writer.
Personalise the following script template for the lead below.
Keep the script natural, conversational, and under 60 seconds when spoken.
Return ONLY the final script text — no labels or extra commentary.

Lead Data:
${JSON.stringify(leadData, null, 2)}

Template:
${templateText}`;

    try {
      if (provider === 'gemini') {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(creds.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } else {
        // Default: OpenAI
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: creds.apiKey });
        const completion = await openai.chat.completions.create({
          model: creds.model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 400,
        });
        return completion.choices[0].message.content || this.simpleTemplateReplace(templateText, leadData);
      }
    } catch (err) {
      this.logger.warn(`AI script generation failed (${err.message}); using simple replacement.`);
      return this.simpleTemplateReplace(templateText, leadData);
    }
  }

  private simpleTemplateReplace(
    template: string,
    data: Record<string, any>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      result = result
        .replace(new RegExp(`{{${key}}}`, 'g'), String(value))
        .replace(new RegExp(`{{lead\\.${key}}}`, 'g'), String(value));
    }
    return result;
  }

  // ─── 2. generateAudio ─────────────────────────────────────────
  /**
   * Calls ElevenLabs TTS API, saves the MP3 to uploads/, returns public URL.
   */
  async generateAudio(tenantId: string, script: string): Promise<string> {
    const creds = await this.getCredential(tenantId, 'TTS');
    const { apiKey, voiceId } = creds;

    if (!apiKey || !voiceId) {
      throw new BadRequestException(
        'Incomplete TTS credentials (apiKey, voiceId required).',
      );
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const fileName = `${uuidv4()}.mp3`;
    const filePath = path.join(this.uploadsDir, fileName);

    try {
      const response = await axios.post(
        url,
        {
          text: script,
          model_id: creds.modelId || 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
        },
      );

      // Ensure uploads directory exists
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }

      fs.writeFileSync(filePath, Buffer.from(response.data));
      const publicAudioUrl = `${this.publicUrl}/audio/${fileName}`;
      this.logger.log(`Audio generated: ${publicAudioUrl}`);
      return publicAudioUrl;
    } catch (err) {
      const message = err.response?.data
        ? Buffer.from(err.response.data).toString()
        : err.message;
      this.logger.error(`ElevenLabs TTS failed: ${message}`);
      throw new BadRequestException(`TTS generation failed: ${message}`);
    }
  }

  // ─── 3. placeCall ─────────────────────────────────────────────
  /**
   * Uses Twilio Node SDK to place an outbound call that plays the audio URL.
   * Returns the Twilio call SID.
   */
  async placeCall(
    tenantId: string,
    toPhone: string,
    audioUrl: string,
  ): Promise<{ callSid: string; status: string }> {
    const creds = await this.getCredential(tenantId, 'CALL');
    const { accountSid, authToken, fromNumber, statusCallbackUrl } = creds;

    if (!accountSid || !authToken || !fromNumber) {
      throw new BadRequestException(
        'Incomplete CALL credentials (accountSid, authToken, fromNumber required).',
      );
    }

    // Log call to communication-service before placing it
    const callbackUrl =
      statusCallbackUrl ||
      `${this.publicUrl}/api/v1/voice/webhook/status`;

    try {
      const twilio = require('twilio')(accountSid, authToken);
      const call = await twilio.calls.create({
        to: toPhone,
        from: fromNumber,
        twiml: `<Response><Play>${audioUrl}</Play></Response>`,
        statusCallback: callbackUrl,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['completed', 'no-answer', 'busy', 'failed'],
      });

      this.logger.log(`Call placed to ${toPhone}. SID: ${call.sid}, Status: ${call.status}`);

      // Log to communication-service
      try {
        await axios.post(
          `${this.commServiceUrl}/communications/call`,
          {
            to: toPhone,
            from: fromNumber,
            duration: 0,
            status: call.status?.toUpperCase() || 'INITIATED',
            direction: 'OUTBOUND',
            provider: 'TWILIO',
          },
          { headers: { 'x-tenant-id': tenantId } },
        );
      } catch (logErr) {
        this.logger.warn(`Failed to log call to comm-service: ${logErr.message}`);
      }

      return { callSid: call.sid, status: call.status };
    } catch (err) {
      this.logger.error(`Twilio call failed to ${toPhone}: ${err.message}`);
      throw new BadRequestException(`Call placement failed: ${err.message}`);
    }
  }

  // ─── 4. processCampaignCall ───────────────────────────────────
  /**
   * Full pipeline: for each leadId → generateScript → generateAudio → placeCall
   * Returns aggregate stats.
   */
  async processCampaignCall(
    tenantId: string,
    campaignId: string,
    leadIds: string[],
    templateText: string,
  ): Promise<{ processed: number; failed: number; answered: number; callSids: string[] }> {
    let processed = 0;
    let failed = 0;
    let answered = 0;
    const callSids: string[] = [];

    for (const leadId of leadIds) {
      try {
        // 1. Fetch lead data from CRM
        const { data: lead } = await axios.get(
          `${this.crmServiceUrl}/contacts/${leadId}`,
          { headers: { 'x-tenant-id': tenantId } },
        );

        if (!lead.phone) {
          throw new Error(`Lead ${leadId} has no phone number`);
        }

        // 2. Generate personalised script via AI
        const script = await this.generateScript(tenantId, {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          company: lead.company,
        }, templateText);

        // 3. Generate audio via ElevenLabs
        let audioUrl: string;
        try {
          audioUrl = await this.generateAudio(tenantId, script);
        } catch (ttsErr) {
          this.logger.warn(`TTS failed for lead ${leadId}: ${ttsErr.message}. Skipping call.`);
          throw ttsErr;
        }

        // 4. Place call via Twilio
        const { callSid } = await this.placeCall(tenantId, lead.phone, audioUrl);
        callSids.push(callSid);
        processed++;

        // Throttle: 300ms between calls to avoid Twilio rate limits
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        failed++;
        this.logger.warn(
          `Campaign call failed for lead ${leadId}: ${err.message}`,
        );
      }
    }

    this.logger.log(
      `Campaign ${campaignId} calls done — processed: ${processed}, failed: ${failed}`,
    );
    return { processed, failed, answered, callSids };
  }

  // ─── Webhook: Update call outcome ─────────────────────────────
  async handleCallStatusWebhook(payload: any): Promise<void> {
    const { CallSid, CallStatus, Duration, RecordingUrl } = payload;
    this.logger.log(
      `Twilio webhook: SID=${CallSid}, Status=${CallStatus}, Duration=${Duration}s`,
    );

    // Map Twilio status to our internal status
    const statusMap: Record<string, string> = {
      completed: 'COMPLETED',
      'no-answer': 'NO_ANSWER',
      busy: 'BUSY',
      failed: 'FAILED',
    };

    const internalStatus = statusMap[CallStatus?.toLowerCase()] || CallStatus?.toUpperCase() || 'UNKNOWN';

    // Update the CallLog in communication-service
    try {
      await axios.patch(
        `${this.commServiceUrl}/communications/call/${CallSid}/status`,
        {
          status: internalStatus,
          duration: parseInt(Duration || '0', 10),
          recordingUrl: RecordingUrl || null,
        },
      );
    } catch (err) {
      // Non-critical — just log
      this.logger.warn(`Could not update CallLog for SID ${CallSid}: ${err.message}`);
    }
  }
}

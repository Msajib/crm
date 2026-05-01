import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor(private prisma: PrismaService) {
    const keyString = process.env.CREDENTIAL_ENCRYPTION_KEY;
    if (!keyString || keyString.length !== 64) {
      throw new Error('CREDENTIAL_ENCRYPTION_KEY must be a 64-character (32-byte) hex string.');
    }
    this.secretKey = Buffer.from(keyString, 'hex');
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted text format');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async saveCredential(tenantId: string, type: string, provider: string, plainCredentials: any) {
    const jsonString = JSON.stringify(plainCredentials);
    const encryptedCredentials = this.encrypt(jsonString);

    await this.prisma.tenantCredential.upsert({
      where: {
        tenantId_type: { tenantId, type }
      },
      update: {
        provider,
        encryptedCredentials,
        isActive: true,
        testStatus: 'UNTESTED'
      },
      create: {
        tenantId,
        type,
        provider,
        encryptedCredentials,
        isActive: true,
        testStatus: 'UNTESTED'
      }
    });

    await this.updateFeatureGates(tenantId);
    return { success: true };
  }

  async getCredentials(tenantId: string) {
    const credentials = await this.prisma.tenantCredential.findMany({
      where: { tenantId }
    });

    return credentials.map(cred => {
      let maskedData = {};
      try {
        const decrypted = this.decrypt(cred.encryptedCredentials);
        const parsed = JSON.parse(decrypted);
        // Mask all string values
        for (const key in parsed) {
          if (typeof parsed[key] === 'string' && parsed[key].length > 0) {
             maskedData[key] = '********';
          } else {
             maskedData[key] = parsed[key];
          }
        }
      } catch (e) {
        maskedData = { error: 'Failed to decrypt or parse' };
      }

      return {
        id: cred.id,
        type: cred.type,
        provider: cred.provider,
        isActive: cred.isActive,
        testStatus: cred.testStatus,
        lastTestedAt: cred.lastTestedAt,
        credentials: maskedData
      };
    });
  }

  async revealCredential(tenantId: string, type: string) {
    const cred = await this.prisma.tenantCredential.findUnique({
      where: { tenantId_type: { tenantId, type } }
    });
    if (!cred) throw new NotFoundException('Credential not found');
    
    return {
      type: cred.type,
      provider: cred.provider,
      credentials: JSON.parse(this.decrypt(cred.encryptedCredentials))
    };
  }

  async testCredential(tenantId: string, type: string) {
    const cred = await this.prisma.tenantCredential.findUnique({
      where: { tenantId_type: { tenantId, type } }
    });
    if (!cred) throw new NotFoundException('Credential not found');
    
    // In a real scenario, this would call the provider API to validate.
    // For now, we simulate a successful test.
    await this.prisma.tenantCredential.update({
      where: { id: cred.id },
      data: {
        testStatus: 'OK',
        lastTestedAt: new Date()
      }
    });

    await this.updateFeatureGates(tenantId);
    return { success: true, status: 'OK' };
  }

  async updateFeatureGates(tenantId: string) {
    const credentials = await this.prisma.tenantCredential.findMany({
      where: { tenantId, isActive: true } // You could also require testStatus: 'OK'
    });

    const activeTypes = new Set(credentials.map(c => c.type));

    const gates = {
      email: activeTypes.has('EMAIL'),
      sms: activeTypes.has('SMS'),
      whatsapp: activeTypes.has('WHATSAPP'),
      call: activeTypes.has('CALL'),
      aiVoice: activeTypes.has('TTS'),
      aiText: activeTypes.has('AI')
    };

    await this.prisma.featureGate.upsert({
      where: { tenantId },
      update: { gates },
      create: { tenantId, gates }
    });

    return gates;
  }

  async getFeatureGates(tenantId: string) {
    const gate = await this.prisma.featureGate.findUnique({
      where: { tenantId }
    });
    
    if (gate) return gate.gates;

    // Fallback if not found
    return {
      email: false, sms: false, whatsapp: false, call: false, aiVoice: false, aiText: false
    };
  }

  async deleteCredential(tenantId: string, type: string) {
     await this.prisma.tenantCredential.delete({
       where: { tenantId_type: { tenantId, type } }
     });
     await this.updateFeatureGates(tenantId);
     return { success: true };
  }
}

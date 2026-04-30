import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private prisma: PrismaService) {}

  private async getProvider(tenantId: string) {
    // Try tenant-specific config first, then GLOBAL
    let config = await this.prisma.aIConfiguration.findFirst({
      where: { tenantId, isActive: true }
    });

    if (!config) {
      config = await this.prisma.aIConfiguration.findFirst({
        where: { tenantId: 'GLOBAL', isActive: true }
      });
    }

    return config;
  }

  async getChatResponse(tenantId: string, userId: string, message: string) {
    const config = await this.getProvider(tenantId);
    
    if (!config) {
      return {
        role: 'assistant',
        content: "I'm currently in demo mode because no AI API keys (OpenAI, Gemini, etc.) have been configured by the administrator. Please set up your AI Infrastructure in the System Settings.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    // Search Knowledge Base for context
    const relevantKnowledge = await this.prisma.knowledge.findMany({
      where: {
        tenantId,
        content: { contains: message.split(' ')[0], mode: 'insensitive' },
      },
      take: 3,
    });

    const context = relevantKnowledge.length > 0 
      ? `\n\nRELEVANT BUSINESS CONTEXT:\n${relevantKnowledge.map(k => k.content).join('\n---\n')}`
      : "";

    let responseContent = "";

    try {
      if (config.provider === 'OPENAI') {
        const openai = new OpenAI({ apiKey: config.apiKey });
        const completion = await openai.chat.completions.create({
          model: config.modelName || 'gpt-4o',
          messages: [
            { role: 'system', content: `You are a professional AI Sales Assistant for a high-end CRM platform.${context}` },
            { role: 'user', content: message }
          ],
        });
        responseContent = completion.choices[0].message.content;
      } else if (config.provider === 'GOOGLE') {
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.modelName || "gemini-1.5-flash" });
        const result = await model.generateContent(`System: You are a professional AI Sales Assistant.${context}\n\nUser: ${message}`);
        responseContent = result.response.text();
      } else {
        responseContent = "[Provider not yet implemented in production] " + message;
      }
    } catch (error) {
      this.logger.error(`AI Provider Error (${config.provider}): ${error.message}`);
      responseContent = "I encountered an error while communicating with the AI engine. Please check your API key configuration.";
    }

    await this.prisma.aIConversation.create({
      data: {
        tenantId,
        userId,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: responseContent }
        ] as any
      }
    });

    return {
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  async saveConfig(tenantId: string, dto: any) {
    return this.prisma.aIConfiguration.upsert({
      where: { tenantId },
      update: {
        provider: dto.provider,
        apiKey: dto.apiKey,
        modelName: dto.modelName,
        isActive: dto.isActive,
        settings: dto.settings || {},
      },
      create: {
        tenantId,
        provider: dto.provider,
        apiKey: dto.apiKey,
        modelName: dto.modelName,
        isActive: dto.isActive,
        settings: dto.settings || {},
      },
    });
  }

  async getConfigs(tenantId: string) {
    try {
      return await this.prisma.aIConfiguration.findMany({
        where: { 
          OR: [
            { tenantId },
            { tenantId: 'GLOBAL' }
          ]
        },
        select: {
          provider: true,
          modelName: true,
          isActive: true,
          updatedAt: true,
          tenantId: true
        }
      });
    } catch (err) {
      this.logger.error(`Failed to fetch AI configs: ${err.message}`);
      return []; // Return empty list to prevent frontend crash
    }
  }

  async addKnowledge(tenantId: string, dto: { fileName: string; content: string; metadata?: any }) {
    return this.prisma.knowledge.create({
      data: {
        tenantId,
        fileName: dto.fileName,
        content: dto.content,
        metadata: dto.metadata || {},
      },
    });
  }

  async listKnowledge(tenantId: string) {
    return this.prisma.knowledge.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, fileName: true, createdAt: true, metadata: true },
    });
  }

  private async callAI(config: any, systemPrompt: string, userPrompt: string) {
    try {
      if (config.provider === 'OPENAI') {
        const openai = new OpenAI({ apiKey: config.apiKey });
        const completion = await openai.chat.completions.create({
          model: config.modelName || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        });
        return completion.choices[0].message.content;
      } else if (config.provider === 'GOOGLE') {
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.modelName || "gemini-1.5-flash" });
        const result = await model.generateContent(`System: ${systemPrompt}\n\nUser: ${userPrompt}`);
        return result.response.text();
      }
      return "[Provider Error]";
    } catch (error) {
      this.logger.error(`AI Error: ${error.message}`);
      throw error;
    }
  }

  async getLeadScores(tenantId: string) {
    try {
      const config = await this.getProvider(tenantId);
      if (!config) {
        this.logger.log(`No AI config for tenant ${tenantId}, returning mock scores.`);
        return this.getMockScores();
      }

      const crmUrl = process.env.CRM_SERVICE_URL || 'http://localhost:3003';
      // Fixed: CRM service does not have /api prefix on its internal routes
      this.logger.log(`Fetching contacts from CRM for tenant ${tenantId}`);
      const response = await axios.get(`${crmUrl}/contacts`, {
        headers: { 'x-tenant-id': tenantId }
      });

      // Fixed: crm-service listContacts returns { data: contacts[], meta: ... }
      const contacts = response.data?.data || [];

      if (!Array.isArray(contacts) || contacts.length === 0) {
        this.logger.log(`No contacts found for tenant ${tenantId}, returning mock scores.`);
        return this.getMockScores();
      }

      const topLeads = contacts.filter(c => c.status === 'LEAD').slice(0, 5);
      if (topLeads.length === 0) {
        this.logger.log(`No LEAD status contacts found, returning mock scores.`);
        return this.getMockScores();
      }

      const prompt = `Analyze these leads and provide a score (0-100) based on their profiles: ${JSON.stringify(topLeads)}. Return ONLY a JSON array of {name, score}.`;
      const result = await this.callAI(config, "You are a lead scoring engine.", prompt);
      
      try {
        const cleaned = result.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (parseErr) {
        this.logger.warn(`Failed to parse AI response for lead scores: ${parseErr.message}`);
        return topLeads.map(l => ({ name: `${l.firstName} ${l.lastName}`, score: 85 }));
      }
    } catch (err) {
      this.logger.error(`Error in getLeadScores: ${err.message}`);
      return this.getMockScores();
    }
  }

  async getRecommendations(tenantId: string) {
    try {
      const config = await this.getProvider(tenantId);
      if (!config) return this.getMockRecommendations();

      const crmUrl = process.env.CRM_SERVICE_URL || 'http://localhost:3003';
      const response = await axios.get(`${crmUrl}/deals`, {
        headers: { 'x-tenant-id': tenantId }
      });

      const deals = response.data?.data || [];

      if (!Array.isArray(deals) || deals.length === 0) return this.getMockRecommendations();

      const prompt = `Analyze these deals and recommend next steps: ${JSON.stringify(deals.slice(0, 5))}. Return ONLY a JSON array of {title, description}.`;
      const result = await this.callAI(config, "You are a sales strategist.", prompt);

      try {
        const cleaned = result.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      } catch {
        return this.getMockRecommendations();
      }
    } catch (err) {
      this.logger.error(`Error in getRecommendations: ${err.message}`);
      return this.getMockRecommendations();
    }
  }

  private getMockScores() {
    return [
      { name: 'Sarah Jenkins', score: 98 },
      { name: 'Michael Chen', score: 82 },
      { name: 'Global Net', score: 45 },
    ];
  }

  private getMockRecommendations() {
    return [
      { title: 'Schedule Demo', description: 'Acme Corp deal health is high but demo is missing.' },
      { title: 'Re-engage Lead', description: "Michael Chen hasn't opened last 2 emails." },
    ];
  }
}

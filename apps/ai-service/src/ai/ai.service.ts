import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  constructor(private prisma: PrismaService) {}

  async getChatResponse(tenantId: string, userId: string, message: string) {
    // In a real app, this would call OpenAI/Gemini
    const response = `I've analyzed the context of your request regarding "${message}". Based on the contact history, I recommend offering a 10% discount to close the deal.`;
    
    await this.prisma.aIConversation.create({
      data: {
        tenantId,
        userId,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        ] as any
      }
    });

    return {
      role: 'assistant',
      content: response,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  async getLeadScores(tenantId: string) {
    return [
      { name: 'Sarah Jenkins', score: 98 },
      { name: 'Michael Chen', score: 82 },
      { name: 'Global Net', score: 45 },
    ];
  }

  async getRecommendations(tenantId: string) {
    return [
      { title: 'Schedule Demo', description: 'Acme Corp deal health is high but demo is missing.' },
      { title: 'Re-engage Lead', description: "Michael Chen hasn't opened last 2 emails." },
    ];
  }
}

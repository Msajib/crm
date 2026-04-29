import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SocialApiService {
  private readonly logger = new Logger(SocialApiService.name);

  // ─── FACEBOOK / INSTAGRAM ───────────────────────────────────
  
  async getFacebookAccessToken(appId: string, appSecret: string, code: string, redirectUri: string) {
    const url = `https://graph.facebook.com/v18.0/oauth/access_token`;
    const response = await axios.get(url, {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code,
      },
    });
    return response.data;
  }

  async getFacebookPageStats(pageId: string, accessToken: string) {
    // Fetch insights: reach, engagement, impressions
    const url = `https://graph.facebook.com/v18.0/${pageId}/insights`;
    const response = await axios.get(url, {
      params: {
        metric: 'page_impressions_unique,page_post_engagements,page_fans',
        period: 'day',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  async getFacebookLeadDetails(leadgenId: string, accessToken: string) {
    const url = `https://graph.facebook.com/v18.0/${leadgenId}`;
    const response = await axios.get(url, {
      params: {
        access_token: accessToken,
      },
    });
    return response.data;
  }

  async getFacebookPageDetails(accessToken: string) {
    const url = `https://graph.facebook.com/v18.0/me`;
    const response = await axios.get(url, {
      params: {
        fields: 'id,name,picture{url},followers_count',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  async publishPost(platform: string, payload: { message: string, link?: string }, accessToken: string, pageId?: string) {
    if (platform === 'FACEBOOK' && pageId) {
      const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
      const response = await axios.post(url, payload, {
        params: { access_token: accessToken }
      });
      return response.data;
    }
    // Implement LinkedIn/Twitter posting here
    this.logger.log(`Mock publishing to ${platform}`);
    return { id: `mock_post_${Date.now()}`, status: 'success' };
  }

  async sendDirectMessage(platform: string, payload: { recipientId: string, message: string }, accessToken: string, pageId: string) {
    if (platform === 'FACEBOOK') {
      const url = `https://graph.facebook.com/v18.0/${pageId}/messages`;
      const response = await axios.post(url, {
        recipient: { id: payload.recipientId },
        message: { text: payload.message }
      }, {
        params: { access_token: accessToken }
      });
      return response.data;
    }
    this.logger.log(`Mock sending message to ${platform}`);
    return { success: true };
  }

  // ─── LINKEDIN ───────────────────────────────────────────────

  async getLinkedInAccessToken(clientId: string, clientSecret: string, code: string, redirectUri: string) {
    const url = `https://www.linkedin.com/oauth/v2/accessToken`;
    const response = await axios.post(url, new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  }

  // ─── MOCK DATA GENERATOR (For testing/demo) ──────────────────
  
  generateMockStats(platform: string) {
    return {
      reach: Math.floor(Math.random() * 100000),
      engagement: parseFloat((Math.random() * 5).toFixed(2)),
      impressions: Math.floor(Math.random() * 500000),
      date: new Date().toISOString(),
    };
  }
}

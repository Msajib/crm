import { Injectable, HttpException } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  private clients: Map<string, AxiosInstance> = new Map();

  private getClient(baseUrl: string): AxiosInstance {
    if (!this.clients.has(baseUrl)) {
      this.clients.set(
        baseUrl,
        axios.create({ baseURL: baseUrl, timeout: 30000 }),
      );
    }
    return this.clients.get(baseUrl)!;
  }

  async forward(
    serviceUrl: string,
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>,
  ) {
    const client = this.getClient(serviceUrl);
    const config: AxiosRequestConfig = {
      method: method as any,
      url: path,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data;
    }
    if (data && method.toUpperCase() === 'GET') {
      config.params = data;
    }

    try {
      const response = await client.request(config);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Service unavailable';
      throw new HttpException(message, status);
    }
  }
}

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
      const data = error.response?.data;
      
      // If we have a structured error from the downstream service, pass it through
      if (data && (data.message || data.error)) {
        throw new HttpException(data.message || data.error, status);
      }

      // If it's a connection error or other Axios error
      const message = error.message || 'Service unavailable';
      const detail = error.code ? ` (${error.code})` : '';
      
      throw new HttpException(`${message}${detail}`, status);
    }
  }
}

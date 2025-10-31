
import axios, { AxiosInstance } from 'axios';
import { BaseDataConnector, FetchResult } from './base';

interface RestApiConfig {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  authentication?: {
    type: 'bearer' | 'api_key' | 'basic' | 'oauth';
    credentials: string;
    headerName?: string;
  };
  queryParams?: Record<string, string>;
  requestBody?: any;
  pagination?: {
    type: 'offset' | 'cursor' | 'page';
    limitParam: string;
    offsetParam?: string;
    pageParam?: string;
    cursorParam?: string;
    limitValue: number;
  };
  dataPath?: string;
}

export class RestApiConnector extends BaseDataConnector {
  private client: AxiosInstance | null = null;
  protected config: RestApiConfig;
  
  constructor(config: RestApiConfig, customerId: string) {
    super(config, customerId);
    this.config = config;
  }
  
  async connect(): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };
    
    if (this.config.authentication) {
      switch (this.config.authentication.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${this.config.authentication.credentials}`;
          break;
        case 'api_key':
          const headerName = this.config.authentication.headerName || 'X-API-Key';
          headers[headerName] = this.config.authentication.credentials;
          break;
        case 'basic':
          headers['Authorization'] = `Basic ${this.config.authentication.credentials}`;
          break;
      }
    }
    
    this.client = axios.create({
      baseURL: this.config.url,
      headers,
      timeout: 30000,
    });
    
    await this.logActivity('info', 'API connector initialized');
  }
  
  async fetchData(options?: { page?: number; cursor?: string }): Promise<FetchResult> {
    if (!this.client) {
      await this.connect();
    }
    
    const params = { ...this.config.queryParams };
    
    if (this.config.pagination) {
      const { type, limitParam, limitValue } = this.config.pagination;
      params[limitParam] = limitValue.toString();
      
      if (type === 'offset' && this.config.pagination.offsetParam) {
        const offset = ((options?.page || 1) - 1) * limitValue;
        params[this.config.pagination.offsetParam] = offset.toString();
      } else if (type === 'page' && this.config.pagination.pageParam) {
        params[this.config.pagination.pageParam] = (options?.page || 1).toString();
      } else if (type === 'cursor' && this.config.pagination.cursorParam && options?.cursor) {
        params[this.config.pagination.cursorParam] = options.cursor;
      }
    }
    
    try {
      const response = await this.client!.request({
        method: this.config.method,
        params,
        data: this.config.requestBody,
      });
      
      let data = response.data;
      if (this.config.dataPath) {
        data = this.extractDataByPath(data, this.config.dataPath);
      }
      
      if (!Array.isArray(data)) {
        data = [data];
      }
      
      await this.logActivity('info', `Fetched ${data.length} records from API`);
      
      return {
        data,
        metadata: {
          totalRecords: data.length,
          fetchedAt: new Date(),
          hasMore: data.length === (this.config.pagination?.limitValue || 0),
        },
      };
    } catch (error: any) {
      await this.logActivity('error', 'API fetch failed', {
        message: error.message,
        status: error.response?.status,
      });
      throw error;
    }
  }
  
  async validateConnection(): Promise<boolean> {
    try {
      await this.connect();
      await this.fetchData();
      return true;
    } catch (error) {
      await this.logActivity('error', 'Connection validation failed', error);
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    this.client = null;
    await this.logActivity('info', 'API connector disconnected');
  }
  
  private extractDataByPath(data: any, path: string): any {
    const keys = path.split('.');
    let result = data;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) {
        throw new Error(`Data path ${path} not found in response`);
      }
    }
    return result;
  }
}


import { BaseDataConnector, FetchResult } from './base';
import axios, { AxiosInstance } from 'axios';

interface GraphQLConfig {
  endpoint: string;
  query: string;
  variables?: Record<string, any>;
  headers?: Record<string, string>;
  authentication?: {
    type: 'bearer' | 'api_key';
    credentials: string;
    headerName?: string;
  };
  dataPath?: string;
}

export class GraphQLConnector extends BaseDataConnector {
  private client: AxiosInstance | null = null;
  private config: GraphQLConfig;
  
  constructor(config: GraphQLConfig, customerId: string) {
    super(config, customerId);
    this.config = config;
  }
  
  async connect(): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };
    
    if (this.config.authentication) {
      if (this.config.authentication.type === 'bearer') {
        headers['Authorization'] = `Bearer ${this.config.authentication.credentials}`;
      } else if (this.config.authentication.type === 'api_key') {
        const headerName = this.config.authentication.headerName || 'X-API-Key';
        headers[headerName] = this.config.authentication.credentials;
      }
    }
    
    this.client = axios.create({
      baseURL: this.config.endpoint,
      headers,
      timeout: 30000,
    });
    
    await this.logActivity('info', 'GraphQL connector initialized');
  }
  
  async fetchData(options?: { variables?: Record<string, any> }): Promise<FetchResult> {
    if (!this.client) {
      await this.connect();
    }
    
    try {
      const response = await this.client!.post('', {
        query: this.config.query,
        variables: { ...this.config.variables, ...options?.variables },
      });
      
      if (response.data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
      }
      
      let data = response.data.data;
      
      if (this.config.dataPath) {
        data = this.extractDataByPath(data, this.config.dataPath);
      }
      
      if (!Array.isArray(data)) {
        data = [data];
      }
      
      await this.logActivity('info', `Fetched ${data.length} records from GraphQL`);
      
      return {
        data,
        metadata: {
          totalRecords: data.length,
          fetchedAt: new Date(),
          hasMore: false,
        },
      };
    } catch (error: any) {
      await this.logActivity('error', 'GraphQL fetch failed', error);
      throw error;
    }
  }
  
  async validateConnection(): Promise<boolean> {
    try {
      await this.connect();
      await this.fetchData();
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    this.client = null;
    await this.logActivity('info', 'GraphQL connector disconnected');
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

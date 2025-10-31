
export interface FetchResult {
  data: any[];
  metadata: {
    totalRecords: number;
    fetchedAt: Date;
    hasMore: boolean;
    nextPageToken?: string;
  };
}

export interface DataConnector {
  connect(): Promise<void>;
  fetchData(options?: any): Promise<FetchResult>;
  validateConnection(): Promise<boolean>;
  disconnect(): Promise<void>;
}

export abstract class BaseDataConnector implements DataConnector {
  protected config: any;
  protected customerId: string;
  
  constructor(config: any, customerId: string) {
    this.config = config;
    this.customerId = customerId;
  }
  
  abstract connect(): Promise<void>;
  abstract fetchData(options?: any): Promise<FetchResult>;
  abstract validateConnection(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  
  protected async logActivity(level: 'info' | 'warning' | 'error', message: string, details?: any) {
    console.log(`[${level.toUpperCase()}] [${this.customerId}] ${message}`, details);
  }
}

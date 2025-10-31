
import { BaseDataConnector, FetchResult } from './base';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';

interface DatabaseConfig {
  type: 'postgresql' | 'mysql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  query: string; // SQL query to fetch data
  connectionOptions?: any;
}

export class DatabaseConnector extends BaseDataConnector {
  private client: Pool | mysql.Pool | null = null;
  private config: DatabaseConfig;
  
  constructor(config: DatabaseConfig, customerId: string) {
    super(config, customerId);
    this.config = config;
  }
  
  async connect(): Promise<void> {
    try {
      if (this.config.type === 'postgresql') {
        this.client = new Pool({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.username,
          password: this.config.password,
          ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
          ...this.config.connectionOptions,
        });
      } else if (this.config.type === 'mysql') {
        this.client = mysql.createPool({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.username,
          password: this.config.password,
          ssl: this.config.ssl ? {} : undefined,
          ...this.config.connectionOptions,
        });
      }
      
      await this.logActivity('info', `${this.config.type.toUpperCase()} connector initialized`);
    } catch (error: any) {
      await this.logActivity('error', 'Database connection failed', error.message);
      throw error;
    }
  }
  
  async fetchData(options?: { limit?: number; offset?: number }): Promise<FetchResult> {
    if (!this.client) {
      await this.connect();
    }
    
    try {
      let query = this.config.query;
      const params: any[] = [];
      
      // Add pagination if provided
      if (options?.limit) {
        if (this.config.type === 'postgresql') {
          query += ` LIMIT $1 OFFSET $2`;
          params.push(options.limit, options.offset || 0);
        } else {
          query += ` LIMIT ? OFFSET ?`;
          params.push(options.limit, options.offset || 0);
        }
      }
      
      let rows: any[] = [];
      
      if (this.config.type === 'postgresql') {
        const result = await (this.client as Pool).query(query, params);
        rows = result.rows;
      } else if (this.config.type === 'mysql') {
        const [results] = await (this.client as mysql.Pool).query(query, params);
        rows = results as any[];
      }
      
      await this.logActivity('info', `Fetched ${rows.length} records from ${this.config.type}`);
      
      return {
        data: rows,
        metadata: {
          totalRecords: rows.length,
          fetchedAt: new Date(),
          hasMore: rows.length === (options?.limit || 0),
        },
      };
    } catch (error: any) {
      await this.logActivity('error', 'Query execution failed', {
        message: error.message,
        query: this.config.query,
      });
      throw error;
    }
  }
  
  async validateConnection(): Promise<boolean> {
    try {
      await this.connect();
      
      // Test connection with a simple query
      if (this.config.type === 'postgresql') {
        await (this.client as Pool).query('SELECT 1');
      } else if (this.config.type === 'mysql') {
        await (this.client as mysql.Pool).query('SELECT 1');
      }
      
      await this.logActivity('info', 'Connection validation successful');
      return true;
    } catch (error: any) {
      await this.logActivity('error', 'Connection validation failed', error.message);
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.client) {
      if (this.config.type === 'postgresql') {
        await (this.client as Pool).end();
      } else if (this.config.type === 'mysql') {
        await (this.client as mysql.Pool).end();
      }
      this.client = null;
      await this.logActivity('info', 'Database connector disconnected');
    }
  }
}

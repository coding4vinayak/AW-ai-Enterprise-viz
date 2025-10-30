
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'distinct_count';

export interface AggregationConfig {
  field: string;
  type: AggregationType;
  groupBy?: string[];
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';
  value: any;
}

export class AggregationEngine {
  static aggregate(data: any[], config: AggregationConfig): any {
    if (config.groupBy && config.groupBy.length > 0) {
      return this.groupAndAggregate(data, config);
    }
    
    const values = data.map(row => row[config.field]).filter(v => v !== null && v !== undefined);
    return this.calculateAggregation(values, config.type);
  }

  private static groupAndAggregate(data: any[], config: AggregationConfig): any[] {
    const groups = new Map<string, any[]>();
    
    data.forEach(row => {
      const groupKey = config.groupBy!.map(field => row[field]).join('|');
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(row);
    });
    
    const results: any[] = [];
    groups.forEach((groupData, groupKey) => {
      const groupValues = config.groupBy!.map((field, i) => groupKey.split('|')[i]);
      const values = groupData.map(row => row[config.field]).filter(v => v !== null && v !== undefined);
      
      const result: any = {};
      config.groupBy!.forEach((field, i) => {
        result[field] = groupValues[i];
      });
      result[config.field] = this.calculateAggregation(values, config.type);
      
      results.push(result);
    });
    
    return results;
  }

  private static calculateAggregation(values: any[], type: AggregationType): number {
    if (values.length === 0) return 0;

    switch (type) {
      case 'sum':
        return values.reduce((a, b) => Number(a) + Number(b), 0);
      
      case 'avg':
        const sum = values.reduce((a, b) => Number(a) + Number(b), 0);
        return sum / values.length;
      
      case 'count':
        return values.length;
      
      case 'min':
        return Math.min(...values.map(Number));
      
      case 'max':
        return Math.max(...values.map(Number));
      
      case 'median':
        const sorted = values.map(Number).sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      
      case 'distinct_count':
        return new Set(values).size;
      
      default:
        return 0;
    }
  }

  static filter(data: any[], filters: FilterConfig[]): any[] {
    return data.filter(row => {
      return filters.every(filter => {
        const value = row[filter.field];
        
        switch (filter.operator) {
          case 'equals':
            return value == filter.value;
          
          case 'not_equals':
            return value != filter.value;
          
          case 'greater_than':
            return Number(value) > Number(filter.value);
          
          case 'less_than':
            return Number(value) < Number(filter.value);
          
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          
          case 'between':
            return Array.isArray(filter.value) && 
                   Number(value) >= Number(filter.value[0]) && 
                   Number(value) <= Number(filter.value[1]);
          
          default:
            return true;
        }
      });
    });
  }
}

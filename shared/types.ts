
// Chart configuration types for advanced visualizations
export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'area' 
  | 'scatter' 
  | 'doughnut'
  | 'radar'
  | 'polarArea'
  | 'bubble'
  | 'heatmap'
  | 'kpi';

export interface ChartSeries {
  field: string;
  name?: string;
  color?: string;
  type?: ChartType;
}

export interface ChartAxis {
  field: string;
  label?: string;
  format?: 'number' | 'currency' | 'percentage' | 'date';
  min?: number;
  max?: number;
}

export interface ChartLegend {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ChartTooltip {
  show: boolean;
  format?: string;
}

export interface DrillDownConfig {
  enabled: boolean;
  targetField?: string;
  targetDashboard?: string;
}

export interface AdvancedChartConfig {
  // Data
  datasetId: string;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  series?: ChartSeries[];
  
  // Aggregation & Filtering
  aggregation?: {
    field: string;
    type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'distinct_count';
    groupBy?: string[];
  };
  filters?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';
    value: any;
  }>;
  calculatedFields?: Array<{
    name: string;
    formula: string;
    type: 'number' | 'string' | 'boolean';
  }>;
  
  // Styling
  colors?: string[];
  colorScheme?: 'default' | 'blue' | 'green' | 'red' | 'purple' | 'gradient';
  legend?: ChartLegend;
  tooltip?: ChartTooltip;
  
  // Interactivity
  drillDown?: DrillDownConfig;
  
  // Display
  showDataLabels?: boolean;
  stacked?: boolean;
  smooth?: boolean;
}

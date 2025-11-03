import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  AreaChart, 
  ScatterChart, 
  Activity, 
  Users,
  DollarSign,
  ShoppingCart,
  Calendar,
  Target
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'business' | 'analytics' | 'custom';
  recommendedFields: string[];
  chartConfig: any;
}

const VISUALIZATION_TEMPLATES: Template[] = [
  {
    id: 'revenue-trend',
    name: 'Revenue Trend',
    description: 'Track revenue over time with a line chart',
    icon: TrendingUp,
    category: 'business',
    recommendedFields: ['date', 'revenue', 'sales'],
    chartConfig: {
      type: 'line',
      xAxis: 'date',
      yAxis: 'revenue',
      title: 'Revenue Trend Over Time'
    }
  },
  {
    id: 'sales-by-category',
    name: 'Sales by Category',
    description: 'Compare sales across different categories using a bar chart',
    icon: BarChart3,
    category: 'business',
    recommendedFields: ['category', 'sales', 'revenue'],
    chartConfig: {
      type: 'bar',
      xAxis: 'category',
      yAxis: 'sales',
      title: 'Sales by Category'
    }
  },
  {
    id: 'market-share',
    name: 'Market Share',
    description: 'Show market share distribution with a pie chart',
    icon: PieChart,
    category: 'business',
    recommendedFields: ['category', 'market_share', 'percentage'],
    chartConfig: {
      type: 'pie',
      xAxis: 'category',
      yAxis: 'market_share',
      title: 'Market Share Distribution'
    }
  },
  {
    id: 'growth-over-time',
    name: 'Growth Over Time',
    description: 'Visualize growth trends with an area chart',
    icon: AreaChart,
    category: 'analytics',
    recommendedFields: ['date', 'growth', 'value'],
    chartConfig: {
      type: 'area',
      xAxis: 'date',
      yAxis: 'growth',
      title: 'Growth Over Time'
    }
  },
  {
    id: 'user-engagement',
    name: 'User Engagement',
    description: 'Analyze user engagement metrics',
    icon: Users,
    category: 'analytics',
    recommendedFields: ['date', 'engagement', 'users'],
    chartConfig: {
      type: 'line',
      xAxis: 'date',
      yAxis: 'engagement',
      title: 'User Engagement Over Time'
    }
  },
  {
    id: 'correlation-analysis',
    name: 'Correlation Analysis',
    description: 'Compare two variables to find correlations',
    icon: ScatterChart,
    category: 'analytics',
    recommendedFields: ['variable1', 'variable2', 'value1', 'value2'],
    chartConfig: {
      type: 'scatter',
      xAxis: 'variable1',
      yAxis: 'variable2',
      title: 'Correlation Analysis'
    }
  },
  {
    id: 'kpi-dashboard',
    name: 'KPI Dashboard',
    description: 'Track key performance indicators',
    icon: Target,
    category: 'business',
    recommendedFields: ['metric', 'value', 'target'],
    chartConfig: {
      type: 'bar',
      xAxis: 'metric',
      yAxis: 'value',
      title: 'KPI Performance Dashboard'
    }
  },
  {
    id: 'seasonal-analysis',
    name: 'Seasonal Analysis',
    description: 'Analyze seasonal trends in your data',
    icon: Calendar,
    category: 'analytics',
    recommendedFields: ['date', 'season', 'value'],
    chartConfig: {
      type: 'line',
      xAxis: 'date',
      yAxis: 'value',
      title: 'Seasonal Trend Analysis'
    }
  }
];

interface VisualizationTemplatesProps {
  onSelectTemplate: (template: Template) => void;
  datasetColumns: string[];
  className?: string;
}

export function VisualizationTemplates({ onSelectTemplate, datasetColumns, className }: VisualizationTemplatesProps) {
  // Filter templates based on available dataset columns
  const filteredTemplates = VISUALIZATION_TEMPLATES.filter(template => {
    // Check if at least one of the recommended fields exists in dataset
    return template.recommendedFields.some(field => 
      datasetColumns.some(col => 
        col.toLowerCase().includes(field.toLowerCase())
      )
    );
  });

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        Quick Visualization Templates
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card 
              key={template.id} 
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-0">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    "bg-primary/10 text-primary"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                        {template.category}
                      </span>
                      {template.recommendedFields.slice(0, 2).map((field, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                          {field}
                        </span>
                      ))}
                      {template.recommendedFields.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                          +{template.recommendedFields.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredTemplates.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-medium mb-1">No templates match your data</h4>
          <p className="text-sm text-muted-foreground">
            Try uploading a dataset with fields like 'date', 'sales', 'category', etc.
          </p>
        </Card>
      )}
    </div>
  );
}
import { useMemo, useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { AdvancedChartConfig } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle } from 'lucide-react';

interface AdvancedChartRendererProps {
  config: AdvancedChartConfig;
  data: any[];
  height?: number;
  chart?: {
    config: AdvancedChartConfig;
    data: any[];
  };
  showExplanation?: boolean;
  onExplainChart?: () => void;
}

const COLOR_SCHEMES = {
  default: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa'],
  blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#1e40af'],
  green: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#15803d'],
  red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#b91c1c'],
  purple: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#7e22ce'],
  gradient: ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a78bfa']
};

export function AdvancedChartWithExplanation({ config, data, height = 400, chart, showExplanation = false, onExplainChart }: AdvancedChartRendererProps) {
  if (chart) {
    config = chart.config;
    data = chart.data || [];
  }

  if (!config || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {!config ? 'No configuration' : 'No data available'}
      </div>
    );
  }

  if (!config.xAxis?.field || !config.series?.[0]?.field) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Chart configuration incomplete
      </div>
    );
  }

  const colors = config?.colors || COLOR_SCHEMES[config?.colorScheme || 'default'];

  const [chartData, setChartData] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    // Use the actual uploaded data
    let processedData = [...data];

    // Apply filters if configured
    if (config.filters && config.filters.length > 0) {
      processedData = processedData.filter(row => {
        return config.filters!.every(filter => {
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
            default:
              return true;
          }
        });
      });
    }

    setChartData(processedData);
  }, [data, config]);

  const commonProps = {
    data: chartData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  const renderChart = () => {
    const chartType = config.series?.[0]?.type || 'line';

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis?.field}
              label={{ value: config.xAxis?.label, position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: config.yAxis?.label, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            {config.legend?.show && <Legend />}
            {config.series?.map((series, idx) => (
              <Line
                key={series.field}
                type={config.smooth ? 'monotone' : 'linear'}
                dataKey={series.field}
                name={series.name || series.field}
                stroke={series.color || colors[idx % colors.length]}
                strokeWidth={2}
                dot={{ fill: series.color || colors[idx % colors.length] }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis?.field} />
            <YAxis />
            <Tooltip />
            {config.legend?.show && <Legend />}
            {config.series?.map((series, idx) => (
              <Bar
                key={series.field}
                dataKey={series.field}
                name={series.name || series.field}
                fill={series.color || colors[idx % colors.length]}
                stackId={config.stacked ? 'stack' : undefined}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis?.field} />
            <YAxis />
            <Tooltip />
            {config.legend?.show && <Legend />}
            {config.series?.map((series, idx) => (
              <Area
                key={series.field}
                type={config.smooth ? 'monotone' : 'linear'}
                dataKey={series.field}
                name={series.name || series.field}
                stroke={series.color || colors[idx % colors.length]}
                fill={series.color || colors[idx % colors.length]}
                stackId={config.stacked ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
      case 'doughnut':
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={config.series?.[0]?.field || 'value'}
              nameKey={config.xAxis?.field || 'name'}
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'doughnut' ? '60%' : 0}
              outerRadius="80%"
              label={config.showDataLabels}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            {config.legend?.show && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis?.field} />
            <YAxis dataKey={config.yAxis?.field} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {config.legend?.show && <Legend />}
            <Scatter
              data={chartData}
              fill={colors[0]}
              name={config.series?.[0]?.name || 'Data'}
            />
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxis?.field} />
            <PolarRadiusAxis />
            <Tooltip />
            {config.legend?.show && <Legend />}
            {config.series?.map((series, idx) => (
              <Radar
                key={series.field}
                name={series.name || series.field}
                dataKey={series.field}
                stroke={series.color || colors[idx % colors.length]}
                fill={series.color || colors[idx % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </RadarChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const handleExplainChart = async () => {
    if (onExplainChart) {
      onExplainChart();
      return;
    }

    setIsExplaining(true);
    
    try {
      const response = await fetch('/api/ai/chart-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          datasetId: config.datasetId,
          datasetColumns: [],
          chartConfig: config
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to explain chart');
      }

      const result = await response.json();
      setExplanation(result.explanation);
    } catch (error: any) {
      console.error('Chart explanation error:', error);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Chart Visualization</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExplainChart}
          disabled={isExplaining}
          className="flex items-center gap-2"
        >
          {isExplaining ? (
            <>
              <MessageCircle className="h-4 w-4 animate-spin" />
              Explaining...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Explain Chart
            </>
          )}
        </Button>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {explanation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Chart Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
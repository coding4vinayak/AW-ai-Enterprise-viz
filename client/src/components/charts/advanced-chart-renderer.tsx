import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis
} from 'recharts';
import type { AdvancedChartConfig } from '@shared/types';
import { useCrossFilter } from '@/components/dashboard/cross-chart-filter';

interface AdvancedChartRendererProps {
  config?: AdvancedChartConfig;
  data?: any[];
  height?: number;
  chart?: { id?: string; config?: any; [key: string]: any };
}

const COLOR_SCHEMES = {
  default: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa'],
  blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#1e40af'],
  green: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#15803d'],
  red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#b91c1c'],
  purple: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#7e22ce'],
  gradient: ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7']
};

export function AdvancedChartRenderer({ config: configProp, data: dataProp, height = 400, chart }: AdvancedChartRendererProps) {
  const config = configProp || (chart?.config as AdvancedChartConfig | undefined);
  const data = dataProp || [];
  const colors = config?.colors || COLOR_SCHEMES[config?.colorScheme || 'default'];
  const { activeFilters } = useCrossFilter();

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    // Apply cross-filter: check if any active filter targets this chart's data
    const chartId = chart?.id;
    const filtersToApply = Object.entries(activeFilters).filter(
      ([sourceId]) => sourceId !== chartId
    );

    if (filtersToApply.length === 0) return data;

    return data.filter((item) => {
      return filtersToApply.every(([, filter]) => {
        if (item[filter.field] === undefined) return true;
        return item[filter.field] === filter.value;
      });
    });
  }, [data, activeFilters, chart?.id]);

  if (!config) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No chart configuration
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

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

      case 'heatmap':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis?.field || 'x'} type="category" />
            <YAxis dataKey={config.yAxis?.field || 'y'} type="category" />
            <ZAxis dataKey={config.series?.[0]?.field || 'value'} range={[50, 400]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {config.legend?.show && <Legend />}
            <Scatter
              data={chartData}
              fill={colors[0]}
              name={config.series?.[0]?.name || 'Intensity'}
            >
              {chartData.map((entry, index) => {
                const value = entry[config.series?.[0]?.field || 'value'] || 0;
                const maxVal = Math.max(...chartData.map(d => d[config.series?.[0]?.field || 'value'] || 0));
                const intensity = maxVal > 0 ? value / maxVal : 0;
                const color = `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Scatter>
          </ScatterChart>
        );

      case 'funnel': {
        const funnelData = chartData.map((item, idx) => ({
          ...item,
          _funnelWidth: chartData.length > 1 ? 100 - (idx * (80 / (chartData.length - 1))) : 100,
        }));
        return (
          <BarChart
            data={funnelData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey={config.xAxis?.field || 'name'} type="category" />
            <Tooltip />
            {config.legend?.show && <Legend />}
            <Bar
              dataKey={config.series?.[0]?.field || 'value'}
              name={config.series?.[0]?.name || 'Value'}
            >
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      }

      case 'waterfall': {
        const waterfallData = chartData.map((item, idx) => {
          const valueField = config.series?.[0]?.field || 'value';
          const value = item[valueField] || 0;
          let base = 0;
          for (let i = 0; i < idx; i++) {
            base += chartData[i][valueField] || 0;
          }
          return {
            ...item,
            _base: value >= 0 ? base : base + value,
            _visible: Math.abs(value),
          };
        });
        return (
          <BarChart
            data={waterfallData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis?.field || 'name'} />
            <YAxis />
            <Tooltip />
            {config.legend?.show && <Legend />}
            <Bar dataKey="_base" stackId="waterfall" fill="transparent" />
            <Bar dataKey="_visible" stackId="waterfall" name={config.series?.[0]?.name || 'Value'}>
              {waterfallData.map((entry, index) => {
                const valueField = config.series?.[0]?.field || 'value';
                const value = chartData[index][valueField] || 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={value >= 0 ? colors[0] : colors[3] || '#ff7c7c'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        );
      }

      case 'bubble':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis?.field || 'x'} name={config.xAxis?.label || 'X'} />
            <YAxis dataKey={config.yAxis?.field || 'y'} name={config.yAxis?.label || 'Y'} />
            <ZAxis
              dataKey={config.series?.[1]?.field || config.series?.[0]?.field || 'z'}
              range={[50, 400]}
              name="Size"
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {config.legend?.show && <Legend />}
            <Scatter
              data={chartData}
              fill={colors[0]}
              name={config.series?.[0]?.name || 'Data'}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        );

      case 'polarArea':
        return (
          <RadarChart {...commonProps}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxis?.field || 'name'} />
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
                fillOpacity={0.7}
              />
            )) || (
              <Radar
                name="Value"
                dataKey="value"
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.7}
              />
            )}
          </RadarChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
}
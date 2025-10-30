
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  LineChart, BarChart3, PieChart, AreaChart, 
  ScatterChart, RadarIcon, Activity, Gauge 
} from 'lucide-react';

interface ChartType {
  id: string;
  name: string;
  icon: typeof LineChart;
  description: string;
}

const CHART_TYPES: ChartType[] = [
  { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
  { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
  { id: 'area', name: 'Area Chart', icon: AreaChart, description: 'Show cumulative totals over time' },
  { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Show proportions of a whole' },
  { id: 'doughnut', name: 'Doughnut Chart', icon: Activity, description: 'Pie chart with center removed' },
  { id: 'scatter', name: 'Scatter Plot', icon: ScatterChart, description: 'Show correlation between variables' },
  { id: 'radar', name: 'Radar Chart', icon: RadarIcon, description: 'Compare multiple variables' },
  { id: 'kpi', name: 'KPI Card', icon: Gauge, description: 'Display key metric' },
  { id: 'heatmap', name: 'Heatmap', icon: Activity, description: 'Show data density and patterns' },
  { id: 'funnel', name: 'Funnel Chart', icon: Activity, description: 'Track conversion stages' },
  { id: 'gauge', name: 'Gauge Chart', icon: Gauge, description: 'Show progress towards goal' },
  { id: 'treemap', name: 'Treemap', icon: Activity, description: 'Hierarchical data visualization' }
];

interface ChartTypeSelectorProps {
  selected: string;
  onSelect: (type: string) => void;
}

export function ChartTypeSelector({ selected, onSelect }: ChartTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CHART_TYPES.map((type) => {
        const Icon = type.icon;
        return (
          <Card
            key={type.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:shadow-md",
              selected === type.id && "border-primary border-2 bg-primary/5"
            )}
            onClick={() => onSelect(type.id)}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <Icon className={cn(
                "h-8 w-8",
                selected === type.id ? "text-primary" : "text-muted-foreground"
              )} />
              <div>
                <div className="font-medium text-sm">{type.name}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

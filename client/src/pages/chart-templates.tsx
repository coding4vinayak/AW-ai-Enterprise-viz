
import { PreMadeBarChart } from '@/components/charts/pre-made/bar-chart';
import { PreMadeLineChart } from '@/components/charts/pre-made/line-chart';
import { PreMadePieChart } from '@/components/charts/pre-made/pie-chart';
import { PreMadeAreaChart } from '@/components/charts/pre-made/area-chart';
import { PreMadeScatterChart } from '@/components/charts/pre-made/scatter-chart';
import { PreMadeRadarChart } from '@/components/charts/pre-made/radar-chart';
import { PreMadeFunnelChart } from '@/components/charts/pre-made/funnel-chart';
import { PreMadeGaugeChart } from '@/components/charts/pre-made/gauge-chart';

const sampleData = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const funnelData = [
  { value: 100, name: 'Step 1' },
  { value: 80, name: 'Step 2' },
  { value: 60, name: 'Step 3' },
  { value: 40, name: 'Step 4' },
  { value: 20, name: 'Step 5' },
];

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ... (imports)

export function ChartTemplatesPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Bar Chart</CardTitle>
          <CardDescription>A classic bar chart for comparing values across categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreMadeBarChart data={sampleData} xAxisKey="name" yAxisKey="uv" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Line Chart</CardTitle>
          <CardDescription>A line chart for visualizing trends over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreMadeLineChart data={sampleData} xAxisKey="name" yAxisKey="uv" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pie Chart</CardTitle>
          <CardDescription>A pie chart for showing the proportions of a whole.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreMadePieChart data={sampleData} dataKey="uv" nameKey="name" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Area Chart</CardTitle>
          <CardDescription>An area chart for showing the volume of data over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreMadeAreaChart data={sampleData} xAxisKey="name" yAxisKey="uv" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Scatter Chart</CardTitle>
          <CardDescription>A scatter chart for visualizing the relationship between two variables.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreMadeScatterChart data={sampleData} xAxisKey="uv" yAxisKey="pv" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Radar Chart</CardTitle>
          <CardDescription>A radar chart for comparing multiple variables.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreMadeRadarChart data={sampleData} dataKey="uv" angleKey="name" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Funnel Chart</CardTitle>
          <CardDescription>A funnel chart for visualizing stages in a process.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreMadeFunnelChart data={funnelData} dataKey="value" nameKey="name" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Gauge Chart</CardTitle>
          <CardDescription>A gauge chart for displaying a single value within a range.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreMadeGaugeChart value={75} maxValue={100} />
        </CardContent>
      </Card>
    </div>
  );
}

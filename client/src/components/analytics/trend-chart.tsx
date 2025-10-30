
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendChartProps {
  data: any[];
  predictions: Array<{ x: any; y: number }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  changeRate: number;
  xField: string;
  yField: string;
}

export function TrendChart({ data, predictions, trend, confidence, changeRate, xField, yField }: TrendChartProps) {
  const chartData = [
    ...data.map((row, idx) => ({ [xField]: row[xField] || idx, actual: row[yField], type: 'actual' })),
    ...predictions.map((pred, idx) => ({ 
      [xField]: `Forecast ${idx + 1}`, 
      predicted: pred.y, 
      type: 'predicted' 
    }))
  ];

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trend Analysis</CardTitle>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant={trend === 'increasing' ? 'default' : trend === 'decreasing' ? 'destructive' : 'secondary'}>
              {trend.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Change: {changeRate.toFixed(2)}%</span>
          <span>Confidence: {(confidence * 100).toFixed(1)}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} name="Actual" />
            <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
            <ReferenceLine x={data.length - 1} stroke="#ff7c7c" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

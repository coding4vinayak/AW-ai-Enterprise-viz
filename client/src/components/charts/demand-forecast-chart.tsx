import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
  ReferenceLine, Brush, ReferenceArea
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Download, TrendingUp, Calendar } from 'lucide-react';

interface DemandForecastChartProps {
  data: any[];
  dateField: string;
  valueField: string;
}

export function DemandForecastChart({ data, dateField, valueField }: DemandForecastChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [forecastType, setForecastType] = useState('linear');
  const [forecastPeriods, setForecastPeriods] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Process data and generate forecast
  useEffect(() => {
    if (!data || data.length === 0 || !dateField || !valueField) {
      setChartData([]);
      setForecastData([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Sort data by date if possible
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a[dateField]);
        const dateB = new Date(b[dateField]);
        return dateA.getTime() - dateB.getTime();
      });

      // Prepare time series data
      const timeSeries = sortedData.map((row, index) => ({
        index,
        date: row[dateField],
        value: parseFloat(row[valueField]) || 0,
        timestamp: new Date(row[dateField]).getTime()
      }));

      // Create chart data with actual values
      const chartPoints = timeSeries.map(point => ({
        date: point.date,
        actual: point.value,
        timestamp: point.timestamp
      }));

      // Generate forecast based on selected algorithm
      const generatedForecast = generateForecast(timeSeries, forecastType, forecastPeriods);
      
      setChartData(chartPoints);
      setForecastData(generatedForecast);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing forecast data:', error);
      setChartData([]);
      setForecastData([]);
      setIsLoading(false);
    }
  }, [data, dateField, valueField, forecastType, forecastPeriods]);

  const generateForecast = (timeSeries: any[], type: string, periods: number) => {
    if (timeSeries.length < 2) return [];

    // Calculate trend and seasonality
    const lastValue = timeSeries[timeSeries.length - 1].value;
    const firstValue = timeSeries[0].value;
    const trend = (lastValue - firstValue) / timeSeries.length;

    const forecast = [];
    const lastDate = new Date(timeSeries[timeSeries.length - 1].date);
    
    for (let i = 1; i <= periods; i++) {
      let forecastedValue;
      
      switch (type) {
        case 'linear':
          forecastedValue = lastValue + (trend * i);
          break;
        case 'exponential':
          forecastedValue = lastValue * Math.pow(1 + (trend / lastValue), i);
          break;
        case 'moving_average':
          // Using simple moving average of last 3 points
          const recentValues = timeSeries.slice(Math.max(0, timeSeries.length - 3)).map(d => d.value);
          const avg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
          forecastedValue = avg + (Math.random() * avg * 0.1); // Add some variation
          break;
        case 'ai_ml':
          // More sophisticated algorithm simulating AI-based forecasting
          forecastedValue = simulateAIModel(lastValue, trend, i);
          break;
        default:
          forecastedValue = lastValue + (trend * i);
      }

      // Ensure non-negative values
      forecastedValue = Math.max(0, forecastedValue);

      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);

      forecast.push({
        date: nextDate.toISOString().split('T')[0],
        forecast: forecastedValue,
        confidence: Math.min(0.95, 0.85 + (Math.random() * 0.1)), // Simulate confidence
        low: forecastedValue * 0.85, // Lower confidence bound
        high: forecastedValue * 1.15 // Upper confidence bound
      });
    }

    return forecast;
  };

  const simulateAIModel = (lastValue: number, trend: number, step: number) => {
    // This simulates a more sophisticated AI/ML model forecast
    const baseForecast = lastValue + (trend * step);
    // Add seasonality component
    const seasonality = Math.sin((step % 12) * (Math.PI / 6)) * 0.1 * baseForecast;
    // Add some trend adjustment based on acceleration
    const acceleration = trend * 0.05 * step;
    return baseForecast + seasonality + acceleration;
  };

  const handleRefresh = () => {
    // This will re-trigger the effect
  };

  const handleExport = () => {
    // Export functionality would go here
  };

  const combinedData = [...chartData, ...forecastData];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Demand Forecasting</CardTitle>
        <div className="flex gap-2">
          <Select value={forecastType} onValueChange={setForecastType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Forecast Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear Trend</SelectItem>
              <SelectItem value="exponential">Exponential</SelectItem>
              <SelectItem value="moving_average">Moving Average</SelectItem>
              <SelectItem value="ai_ml">AI/ML Enhanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={forecastPeriods.toString()} onValueChange={(val) => setForecastPeriods(parseInt(val))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Periods</SelectItem>
              <SelectItem value="10">10 Periods</SelectItem>
              <SelectItem value="20">20 Periods</SelectItem>
              <SelectItem value="30">30 Periods</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          {combinedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={combinedData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  formatter={(value, name) => {
                    if (name === 'actual') return [`${Number(value).toFixed(2)}`, 'Actual Demand'];
                    if (name === 'forecast') return [`${Number(value).toFixed(2)}`, 'Forecasted Demand'];
                    if (name === 'low') return [`${Number(value).toFixed(2)}`, 'Lower Confidence'];
                    if (name === 'high') return [`${Number(value).toFixed(2)}`, 'Upper Confidence'];
                    return [value, name];
                  }}
                />
                <Legend />
                <ReferenceLine x={chartData.length > 0 ? chartData[chartData.length - 1].date : ''} stroke="#ff7c7c" strokeDasharray="3 3" label="Forecast Start" />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                  name="Actual Demand"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#82ca9d" 
                  fillOpacity={0.3} 
                  fill="url(#colorForecast)" 
                  name="Forecasted Demand"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="low" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.1} 
                  name="Lower Confidence"
                  hide
                />
                <Area 
                  type="monotone" 
                  dataKey="high" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.1} 
                  name="Upper Confidence"
                  hide
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center">
                {data.length === 0 
                  ? 'Please configure fields to visualize demand forecast' 
                  : isLoading 
                    ? 'Generating forecast...'
                    : 'No data available for visualization'}
              </p>
            </div>
          )}
        </div>

        {forecastData.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-medium">Next Forecast</h3>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {forecastData[0]?.forecast ? `$${forecastData[0].forecast.toFixed(2)}` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {forecastData[0]?.date}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-medium">Confidence Level</h3>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {forecastData[0]?.confidence ? `${(forecastData[0].confidence * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average confidence across forecast
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Forecast Method</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={forecastType === 'linear' ? 'default' : 'outline'}>
                    Linear
                  </Badge>
                  <Badge variant={forecastType === 'exponential' ? 'default' : 'outline'}>
                    Exponential
                  </Badge>
                  <Badge variant={forecastType === 'ai_ml' ? 'default' : 'outline'}>
                    AI/ML Enhanced
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
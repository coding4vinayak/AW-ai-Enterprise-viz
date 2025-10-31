import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDatasets } from '@/lib/api-hooks';
import { TrendChart } from '@/components/analytics/trend-chart';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  const { data: datasets } = useDatasets();
  const { toast } = useToast();

  const [selectedDataset, setSelectedDataset] = useState('');
  const [xField, setXField] = useState('');
  const [yField, setYField] = useState('');
  const [trendData, setTrendData] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleDatasetChange = (datasetId: string) => {
    setSelectedDataset(datasetId);
    const dataset = datasets?.find(d => d.id === datasetId);
    if (dataset) {
      const cols = dataset.columns || Object.keys((dataset.uploadedData as any[])[0] || {});
      setColumns(cols);
    }
  };

  const analyzeTrend = async () => {
    try {
      const response = await fetch('/api/analytics/trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ datasetId: selectedDataset, xField, yField })
      });

      if (!response.ok) throw new Error('Failed to analyze trend');

      const data = await response.json();
      const dataset = datasets?.find(d => d.id === selectedDataset);
      setTrendData({ ...data, dataset: dataset?.uploadedData });

      toast({
        title: 'Success',
        description: 'Trend analysis completed'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const detectAnomalies = async () => {
    try {
      const response = await fetch('/api/analytics/anomalies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ datasetId: selectedDataset, field: yField, sensitivity: 2 })
      });

      if (!response.ok) throw new Error('Failed to detect anomalies');

      const data = await response.json();
      setAnomalies(data.anomalies);

      toast({
        title: 'Success',
        description: `Found ${data.count} anomalies`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">Trend analysis, forecasting, and anomaly detection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Dataset</label>
              <Select value={selectedDataset} onValueChange={handleDatasetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets?.map(ds => (
                    <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Time/X-Axis Field</label>
              <Select value={xField} onValueChange={setXField} disabled={!selectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Metric/Y-Axis Field</label>
              <Select value={yField} onValueChange={setYField} disabled={!selectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={analyzeTrend} disabled={!selectedDataset || !xField || !yField}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze Trend
            </Button>
            <Button onClick={detectAnomalies} variant="outline" disabled={!selectedDataset || !yField}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Detect Anomalies
            </Button>
          </div>
        </CardContent>
      </Card>

      {trendData && (
        <TrendChart
          data={trendData.dataset}
          predictions={trendData.predictions}
          trend={trendData.trend}
          confidence={trendData.confidence}
          changeRate={trendData.changeRate}
          xField={xField}
          yField={yField}
        />
      )}

      {anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Anomalies ({anomalies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anomalies.slice(0, 10).map((anomaly, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Index {anomaly.index}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Value: {anomaly.value.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">Expected: {anomaly.expected.toFixed(2)}</span>
                    <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
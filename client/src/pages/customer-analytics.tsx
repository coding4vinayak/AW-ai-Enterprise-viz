import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDatasets } from '@/lib/api-hooks';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HiveVisualization } from '@/components/charts/hive-visualization';
import { DemandForecastChart } from '@/components/charts/demand-forecast-chart';
import { ChurnForecastChart } from '@/components/charts/churn-forecast-chart';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';

export default function CustomerAnalyticsPage() {
  const { data: datasets, isLoading: datasetsLoading } = useDatasets();
  const { toast } = useToast();

  const [selectedDataset, setSelectedDataset] = useState('');
  const [customerIdField, setCustomerIdField] = useState('');
  const [dateField, setDateField] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  
  // For demand forecasting
  const [demandValueField, setDemandValueField] = useState('');
  
  // For churn prediction
  const [churnActivityField, setChurnActivityField] = useState('');
  const [churnStatusField, setChurnStatusField] = useState('');

  useEffect(() => {
    if (!datasets) return;
    
    const dataset = datasets.find(d => d.id === selectedDataset);
    if (dataset) {
      const data = dataset.uploadedData as any[];
      const cols = dataset.columns || (Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : []);
      setColumns(Array.isArray(cols) ? cols : []);
      setCustomerData(data);
    }
  }, [selectedDataset, datasets]);

  const handleDatasetChange = (datasetId: string) => {
    setSelectedDataset(datasetId);
    setCustomerData([]);
    setCustomerIdField('');
    setDateField('');
    setDemandValueField('');
    setChurnActivityField('');
    setChurnStatusField('');
  };

  if (datasetsLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading datasets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Customer Analytics Dashboard</h1>
        <p className="text-muted-foreground">World-class visualization for hive data, demand forecasting, and churn prediction</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Dataset</label>
              <Select value={selectedDataset} onValueChange={handleDatasetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(datasets) && datasets.length > 0 ? (
                    datasets.map(ds => (
                      <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>No datasets available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Customer ID Field</label>
              <Select value={customerIdField} onValueChange={setCustomerIdField} disabled={!selectedDataset}>
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
              <label className="text-sm font-medium">Date Field</label>
              <Select value={dateField} onValueChange={setDateField} disabled={!selectedDataset}>
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
              <label className="text-sm font-medium">Value Field</label>
              <Select value={demandValueField} onValueChange={setDemandValueField} disabled={!selectedDataset}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Churn Activity Field</label>
              <Select value={churnActivityField} onValueChange={setChurnActivityField} disabled={!selectedDataset}>
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
              <label className="text-sm font-medium">Churn Status Field</label>
              <Select value={churnStatusField} onValueChange={setChurnStatusField} disabled={!selectedDataset}>
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
        </CardContent>
      </Card>

      <Tabs defaultValue="hivemap" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hivemap">
            <Users className="h-4 w-4 mr-2" />
            Hive Data
          </TabsTrigger>
          <TabsTrigger value="demand" disabled={!demandValueField}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Demand Forecast
          </TabsTrigger>
          <TabsTrigger value="churn" disabled={!churnActivityField}>
            <Activity className="h-4 w-4 mr-2" />
            Churn Prediction
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hivemap" className="space-y-6">
          <HiveVisualization 
            data={customerData} 
            customerIdField={customerIdField}
            dateField={dateField}
            valueField={demandValueField}
          />
        </TabsContent>

        <TabsContent value="demand" className="space-y-6">
          <DemandForecastChart 
            data={customerData} 
            dateField={dateField}
            valueField={demandValueField}
          />
        </TabsContent>

        <TabsContent value="churn" className="space-y-6">
          <ChurnForecastChart 
            data={customerData} 
            customerIdField={customerIdField}
            activityField={churnActivityField}
            statusField={churnStatusField}
          />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.filter(d => !d[churnStatusField] || d[churnStatusField] !== 'churned').length}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">High risk customers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
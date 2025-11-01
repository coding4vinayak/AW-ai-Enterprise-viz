
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartTypeSelector } from '@/components/charts/chart-type-selector';
import { AdvancedChartRenderer } from '@/components/charts/advanced-chart-renderer';
import { useDatasets } from '@/lib/api-hooks';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

type AdvancedChartConfig = {
  datasetId: string;
  xAxis?: { field: string };
  yAxis?: { field: string };
  series?: Array<{ field: string }>;
  legend?: { show: boolean; position: string };
  tooltip?: { show: boolean };
  showDataLabels?: boolean;
  stacked?: boolean;
  smooth?: boolean;
  colorScheme?: string;
};

export default function ChartBuilderAdvanced() {
  const [, navigate] = useLocation();
  const { data: datasets } = useDatasets();
  const { toast } = useToast();
  
  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState('line');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const [config, setConfig] = useState<AdvancedChartConfig>({
    datasetId: '',
    legend: { show: true, position: 'top' },
    tooltip: { show: true },
    showDataLabels: false,
    stacked: false,
    smooth: true,
    colorScheme: 'default'
  });

  useEffect(() => {
    if (selectedDataset && datasets) {
      const dataset = datasets.find(d => d.id === selectedDataset);
      if (dataset) {
        const cols = dataset.columns || Object.keys((dataset.uploadedData as any[])[0] || {});
        setColumns(cols);
        setConfig(prev => ({ ...prev, datasetId: selectedDataset }));
      }
    }
  }, [selectedDataset, datasets]);

  const handlePreview = async () => {
    if (!selectedDataset) {
      toast({
        title: 'Missing Dataset',
        description: 'Please select a dataset first',
        variant: 'destructive'
      });
      return;
    }
    
    if (!config.xAxis?.field || !config.yAxis?.field) {
      toast({
        title: 'Missing Configuration',
        description: 'Please select both X-Axis and Y-Axis fields',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Get the dataset directly for preview
      const dataset = datasets?.find(d => d.id === selectedDataset);
      if (!dataset || !dataset.uploadedData) {
        throw new Error('Dataset not found or has no data');
      }
      
      const data = dataset.uploadedData as any[];
      setPreviewData(data);
      
      toast({
        title: 'Success',
        description: 'Preview generated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate preview',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    if (!chartTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a chart title',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedDataset) {
      toast({
        title: 'Validation Error',
        description: 'Please select a dataset',
        variant: 'destructive'
      });
      return;
    }
    
    if (!config.xAxis?.field || !config.yAxis?.field) {
      toast({
        title: 'Validation Error',
        description: 'Please configure X-Axis and Y-Axis',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await fetch('/api/charts/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: chartTitle,
          type: chartType,
          config,
          dashboardId: 'default'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save chart');
      }
      
      toast({
        title: 'Success',
        description: 'Chart saved successfully'
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save chart',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Advanced Chart Builder</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePreview} variant="outline">Preview</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Chart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Chart Title</Label>
                <Input
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="My Chart"
                />
              </div>
              
              <div>
                <Label>Dataset</Label>
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartTypeSelector selected={chartType} onSelect={setChartType} />
            </CardContent>
          </Card>

          {selectedDataset && columns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Data Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>X-Axis</Label>
                  <Select
                    value={config.xAxis?.field}
                    onValueChange={(field) => setConfig(prev => ({
                      ...prev,
                      xAxis: { field }
                    }))}
                  >
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
                  <Label>Y-Axis / Metric</Label>
                  <Select
                    value={config.yAxis?.field}
                    onValueChange={(field) => setConfig(prev => ({
                      ...prev,
                      yAxis: { field },
                      series: [{ field }]
                    }))}
                  >
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Chart Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewData.length > 0 ? (
                <AdvancedChartRenderer
                  config={{ ...config, series: config.series || [{ field: config.yAxis?.field || '' }] }}
                  data={previewData}
                  height={500}
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Configure chart and click Preview to see visualization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

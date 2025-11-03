import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartTypeSelector } from '@/components/charts/chart-type-selector';
import { AdvancedChartRenderer } from '@/components/charts/advanced-chart-renderer';
import { VisualizationTemplates } from '@/components/charts/visualization-templates';
import { AIChartAssistant } from '@/components/ai/ai-chart-assistant';
import { useDatasets } from '@/lib/api-hooks';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Zap, BarChart3, Sparkles } from 'lucide-react';
import type { Template } from '@/components/charts/visualization-templates';

type AdvancedChartConfig = {
  datasetId: string;
  xAxis?: { field: string };
  yAxis?: { field: string };
  series?: Array<{ field: string; type: string }>;
  legend?: { show: boolean; position: string };
  tooltip?: { show: boolean };
  showDataLabels?: boolean;
  stacked?: boolean;
  smooth?: boolean;
  colorScheme?: string;
};

export default function SimpleChartBuilder() {
  const [, navigate] = useLocation();
  const { data: datasets } = useDatasets();
  const { toast } = useToast();

  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState('line');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'ai' | 'manual'>('templates');

  const [config, setConfig] = useState<AdvancedChartConfig>({
    datasetId: '',
    legend: { show: true, position: 'top' },
    tooltip: { show: true },
    showDataLabels: false,
    stacked: false,
    smooth: true,
    colorScheme: 'default',
    series: []
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

  const handleChartTypeChange = (type: string) => {
    setChartType(type);
    setConfig(prev => ({
      ...prev,
      series: prev.series?.map(s => ({ ...s, type })) || [{ field: prev.yAxis?.field || '', type }]
    }));
  };

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

  const currentDataset = datasets?.find((ds) => ds.id === selectedDataset);

  // Get fields from actual uploaded data
  const availableFields = currentDataset 
    ? (currentDataset.columns && currentDataset.columns.length > 0 
        ? currentDataset.columns 
        : (currentDataset.uploadedData as any[] || []).length > 0 
          ? Object.keys((currentDataset.uploadedData as any[])[0])
          : [])
    : [];

  // Update preview data when dataset changes
  useEffect(() => {
    if (currentDataset) {
      const data = (currentDataset.uploadedData as any[]) || [];
      setPreviewData(data.slice(0, 100)); // Show first 100 rows
      setProcessedData(data);
    } else {
      setPreviewData([]);
      setProcessedData([]);
    }
  }, [currentDataset]);

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setChartTitle(template.chartConfig.title);
    setChartType(template.chartConfig.type);
    
    setConfig(prev => ({
      ...prev,
      xAxis: { field: template.chartConfig.xAxis },
      yAxis: { field: template.chartConfig.yAxis },
      series: [{ field: template.chartConfig.yAxis, type: template.chartConfig.type }]
    }));
    
    setActiveTab('manual');
    toast({
      title: 'Template Applied',
      description: `Applied ${template.name} template`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Chart Builder</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePreview} variant="outline">Preview</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Chart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dataset & Title</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <Label>Chart Title</Label>
                <Input
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="Chart Title"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant={activeTab === 'templates' ? 'default' : 'outline'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('templates')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Use Template
              </Button>
              <Button 
                variant={activeTab === 'ai' ? 'default' : 'outline'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('ai')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button 
                variant={activeTab === 'manual' ? 'default' : 'outline'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('manual')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Manual Setup
              </Button>
            </CardContent>
          </Card>

          {/* Template/AI/Manual sections based on active tab */}
          {activeTab === 'templates' && (
            <VisualizationTemplates 
              datasetColumns={columns} 
              onSelectTemplate={handleTemplateSelect}
              className="mt-4"
            />
          )}

          {activeTab === 'ai' && (
            <AIChartAssistant
              datasetId={selectedDataset}
              datasetName={datasets?.find(ds => ds.id === selectedDataset)?.name || ''}
              datasetColumns={columns}
              currentConfig={config}
              onDataProcessed={(newConfig) => {
                setChartTitle(newConfig.title || chartTitle);
                setChartType(newConfig.type || chartType);
                setConfig(prev => ({
                  ...prev,
                  ...newConfig
                }));
              }}
              onExplanationReceived={(explanation) => {
                toast({
                  title: "Chart Explanation",
                  description: explanation,
                  duration: 10000
                });
              }}
            />
          )}

          {activeTab === 'manual' && (
            <Card>
              <CardHeader>
                <CardTitle>Manual Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Chart Type</Label>
                  <ChartTypeSelector 
                    selected={chartType} 
                    onSelect={handleChartTypeChange} 
                  />
                </div>

                {selectedDataset && columns.length > 0 && (
                  <>
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
                          series: [{ field, type: chartType }]
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
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Chart Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewData.length > 0 && config.xAxis?.field && config.series && config.series.length > 0 ? (
                <div className="h-[500px]">
                  <AdvancedChartRenderer
                    data={processedData.length > 0 ? processedData : previewData}
                    config={{
                      datasetId: selectedDataset,
                      xAxis: config.xAxis?.field ? { field: config.xAxis.field } : undefined,
                      yAxis: config.yAxis?.field ? { field: config.yAxis.field } : undefined,
                      series: config.yAxis?.field ? [{ field: config.yAxis.field, type: chartType }] : undefined,
                      legend: config.legend,
                      tooltip: config.tooltip,
                      showDataLabels: config.showDataLabels,
                      stacked: config.stacked,
                      smooth: config.smooth,
                      colorScheme: config.colorScheme,
                    }}
                    height={500}
                  />
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">
                      {previewData.length === 0 
                        ? 'Select a dataset and configure chart settings'
                        : 'Configure X-Axis and Y-Axis fields'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Choose a template, use AI, or configure manually
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
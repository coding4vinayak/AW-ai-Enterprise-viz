import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDatasets } from '@/lib/api-hooks';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, TrendingUp, Package, DollarSign, ChevronRight, Check } from 'lucide-react';

const templates = [
  {
    id: 'sales-overview',
    name: 'Sales Overview',
    description: 'Track revenue, orders, and customer metrics',
    icon: DollarSign,
    requiredFields: ['date', 'revenue', 'quantity'],
  },
  {
    id: 'customer-analytics',
    name: 'Customer Analytics',
    description: 'Monitor customer behavior and retention',
    icon: TrendingUp,
    requiredFields: ['date', 'customer_id', 'value'],
  },
  {
    id: 'inventory-tracking',
    name: 'Inventory Tracking',
    description: 'Monitor stock levels and turnover',
    icon: Package,
    requiredFields: ['product', 'stock_count', 'category'],
  },
  {
    id: 'financial-kpi',
    name: 'Financial KPIs',
    description: 'Key financial metrics and trends',
    icon: BarChart3,
    requiredFields: ['date', 'revenue', 'expenses', 'profit'],
  },
];

export default function DashboardWizard() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [dashboardName, setDashboardName] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  const { data: datasets } = useDatasets();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const currentTemplate = templates.find(t => t.id === selectedTemplate);
  const selectedDatasetObj = datasets?.find(d => d.id === selectedDataset);
  const datasetColumns = selectedDatasetObj?.columns || 
    (selectedDatasetObj?.uploadedData as any[] || []).length > 0 
      ? Object.keys((selectedDatasetObj.uploadedData as any[])[0])
      : [];

  const handleCreateDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard-templates/create-from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          templateType: selectedTemplate,
          name: dashboardName,
          datasetIds: [selectedDataset],
          config: fieldMapping,
        }),
      });

      if (!response.ok) throw new Error('Failed to create dashboard');

      const data = await response.json();

      toast({
        title: 'Success',
        description: 'Dashboard created successfully',
      });

      navigate(`/dashboard`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b">
        <h1 className="text-4xl font-bold mb-2">Create Custom Dashboard</h1>
        <p className="text-muted-foreground">Build a dashboard in 3 simple steps</p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />}
              </div>
            ))}
          </div>

          {/* Step 1: Choose Template */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose Dashboard Template</CardTitle>
                <CardDescription>Select a pre-built template that matches your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <Card key={template.id} className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedTemplate === template.id ? 'border-primary' : ''
                      }`} onClick={() => setSelectedTemplate(template.id)}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <RadioGroupItem value={template.id} id={template.id} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <template.icon className="h-5 w-5 text-primary" />
                                <Label htmlFor={template.id} className="text-lg font-semibold cursor-pointer">
                                  {template.name}
                                </Label>
                              </div>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </RadioGroup>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setStep(2)} disabled={!selectedTemplate}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Configure Dashboard */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Configure Dashboard</CardTitle>
                <CardDescription>Name your dashboard and select data source</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dashboard-name">Dashboard Name</Label>
                  <Input
                    id="dashboard-name"
                    placeholder="e.g., Q1 2024 Sales Dashboard"
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataset">Data Source</Label>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger id="dataset">
                      <SelectValue placeholder="Select dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets?.map((ds) => (
                        <SelectItem key={ds.id} value={ds.id}>
                          {ds.name} ({ds.rowCount} rows)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!dashboardName || !selectedDataset}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Map Fields */}
          {step === 3 && currentTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Map Your Data Fields</CardTitle>
                <CardDescription>Match your data columns to the template requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentTemplate.requiredFields.map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Select
                      value={fieldMapping[field]}
                      onValueChange={(value) => setFieldMapping({ ...fieldMapping, [`${field}Field`]: value })}
                    >
                      <SelectTrigger id={field}>
                        <SelectValue placeholder={`Select ${field} column`} />
                      </SelectTrigger>
                      <SelectContent>
                        {datasetColumns.map((col) => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleCreateDashboard}>
                    Create Dashboard <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
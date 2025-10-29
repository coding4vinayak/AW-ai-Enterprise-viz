import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { LineChart, BarChart3, PieChart, Activity, ScatterChart } from "lucide-react";
import {
  LineChart as RechartsLine,
  Line,
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDatasets } from "@/lib/api-hooks";

export function ChartBuilder() {
  const [selectedType, setSelectedType] = useState("line");
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const { data: datasets } = useDatasets();

  const selectedDatasetObj = selectedDataset && datasets
    ? datasets.find(d => d.id === selectedDataset)
    : null;

  const selectedDatasetColumns = selectedDatasetObj?.columns && selectedDatasetObj.columns.length > 0
    ? selectedDatasetObj.columns
    : selectedDatasetObj && (selectedDatasetObj.uploadedData as any[] || []).length > 0
      ? Object.keys((selectedDatasetObj.uploadedData as any[])[0])
      : [];

  // Use actual dataset data for preview (first 10 rows)
  const previewData = selectedDatasetObj
    ? (selectedDatasetObj.uploadedData as any[] || []).slice(0, 10)
    : [];

  const chartTypes = [
    { value: "line", label: "Line", icon: LineChart },
    { value: "bar", label: "Bar", icon: BarChart3 },
    { value: "pie", label: "Pie", icon: PieChart },
    { value: "area", label: "Area", icon: Activity },
    { value: "scatter", label: "Scatter", icon: ScatterChart },
  ];

  return (
    <div className="flex h-full">
      {/* Left Panel - Data Source Selection */}
      <div className="w-80 border-r border-border p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Source</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataset">Dataset</Label>
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                  <SelectTrigger id="dataset" data-testid="select-builder-dataset">
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets && datasets.length > 0 ? (
                      datasets.map((dataset) => {
                        const columnCount = dataset.columns && dataset.columns.length > 0
                          ? dataset.columns.length
                          : (dataset.uploadedData as any[] || []).length > 0
                            ? Object.keys((dataset.uploadedData as any[])[0]).length
                            : 0;
                        return (
                          <SelectItem key={dataset.id} value={dataset.id}>
                            {dataset.name} ({dataset.rowCount} rows, {columnCount} columns)
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-datasets" disabled>No datasets available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric">Metric</Label>
                <Select disabled={!selectedDataset}>
                  <SelectTrigger id="metric" data-testid="select-builder-metric">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDatasetColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimension">Dimension</Label>
                <Select disabled={!selectedDataset}>
                  <SelectTrigger id="dimension" data-testid="select-builder-dimension">
                    <SelectValue placeholder="Select dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDatasetColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aggregation">Aggregation</Label>
                <Select defaultValue="sum">
                  <SelectTrigger id="aggregation" data-testid="select-builder-aggregation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - Chart Preview */}
      <div className="flex-1 p-6 overflow-auto">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Chart Preview</CardTitle>
            <CardDescription>
              Your chart will appear here as you configure it
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)]">
            <ResponsiveContainer width="100%" height="100%">
              {selectedType === "line" ? (
                <RechartsLine data={previewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                  />
                </RechartsLine>
              ) : (
                <RechartsBar data={previewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </RechartsBar>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Customization */}
      <div className="w-96 border-l border-border p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Chart Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {chartTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => setSelectedType(type.value)}
                  data-testid={`button-type-${type.value}`}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-sm">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customization</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chart-title-input">Title</Label>
                <Input
                  id="chart-title-input"
                  placeholder="Enter chart title"
                  data-testid="input-builder-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color Scheme</Label>
                <Select defaultValue="default">
                  <SelectTrigger id="color" data-testid="select-builder-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Opacity: 100%</Label>
                <Slider defaultValue={[100]} max={100} step={1} data-testid="slider-opacity" />
              </div>

              <div className="space-y-2">
                <Label>Animation Speed</Label>
                <Slider defaultValue={[300]} max={1000} step={100} data-testid="slider-animation" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" data-testid="button-date-filter">
                Date Range
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-region-filter">
                Region
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-category-filter">
                Category
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
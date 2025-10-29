import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BarChart3, LineChart, PieChart, TrendingUp, Activity } from "lucide-react";

// Assuming you have a way to fetch or access your datasets and their columns
// For demonstration, we'll use mock data structures. In a real app, these would come from your API or state management.
interface Dataset {
  id: string;
  name: string;
  rowCount: number;
  columns: string[];
}

// Mock datasets - replace with your actual data fetching logic
const mockDatasets: Dataset[] = [
  { id: "sales-q4", name: "Sales Data Q4 2024", rowCount: 150, columns: ["Date", "Region", "Product", "Revenue", "Quantity"] },
  { id: "customers", name: "Customer Database", rowCount: 1200, columns: ["CustomerID", "Name", "City", "SignupDate", "TotalSpent"] },
  { id: "inventory", name: "Inventory Records", rowCount: 800, columns: ["ProductID", "Name", "Category", "StockCount", "LastUpdated"] },
];

// In a real application, you'd likely manage state for selected dataset and columns
// We'll simulate this with useState hooks for the example.
import React, { useState, useEffect } from 'react';

interface CreateChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChartDialog({ open, onOpenChange }: CreateChartDialogProps) {
  const chartTypes = [
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "bar", label: "Bar Chart", icon: BarChart3 },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "area", label: "Area Chart", icon: Activity },
    { value: "scatter", label: "Scatter Plot", icon: TrendingUp },
  ];

  const [selectedDataset, setSelectedDataset] = useState<string | undefined>(undefined);
  const [selectedDatasetColumns, setSelectedDatasetColumns] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]); // State to hold actual datasets

  // Simulate fetching datasets when the component mounts or dialog opens
  useEffect(() => {
    // In a real app, fetch datasets from your API here
    // For now, we'll use the mock data
    setDatasets(mockDatasets);
  }, []);

  // Update available columns when the dataset changes
  useEffect(() => {
    if (selectedDataset) {
      const dataset = datasets.find(d => d.id === selectedDataset);
      if (dataset) {
        setSelectedDatasetColumns(dataset.columns);
      } else {
        setSelectedDatasetColumns([]); // Reset if dataset not found
      }
    } else {
      setSelectedDatasetColumns([]); // Reset if no dataset is selected
    }
  }, [selectedDataset, datasets]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-create-chart">
        <DialogHeader>
          <DialogTitle>Create New Chart</DialogTitle>
          <DialogDescription>
            Select your data source and chart type to visualize your data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Chart Title */}
          <div className="space-y-2">
            <Label htmlFor="chart-title">Chart Title</Label>
            <Input
              id="chart-title"
              placeholder="e.g., Monthly Revenue Trend"
              data-testid="input-chart-title"
            />
          </div>

          {/* Data Source */}
          <div className="space-y-2">
            <Label htmlFor="data-source">Data Source</Label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger id="data-source" data-testid="select-data-source">
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets && datasets.length > 0 ? (
                  datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.rowCount} rows)
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No datasets available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Chart Type */}
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {chartTypes.map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  className="h-24 flex-col gap-2 hover-elevate"
                  data-testid={`button-chart-type-${type.value}`}
                >
                  <type.icon className="h-6 w-6" />
                  <span className="text-sm">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Metric Selection */}
          <div className="space-y-2">
            <Label htmlFor="metric">Metric (Y-axis)</Label>
            <Select disabled={!selectedDataset}>
              <SelectTrigger id="metric" data-testid="select-metric">
                <SelectValue placeholder="Select metric to visualize" />
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

          {/* Dimension Selection */}
          <div className="space-y-2">
            <Label htmlFor="dimension">Dimension (X-axis)</Label>
            <Select disabled={!selectedDataset}>
              <SelectTrigger id="dimension" data-testid="select-dimension">
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => onOpenChange(false)}
              data-testid="button-create"
            >
              Create Chart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
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
            <Select>
              <SelectTrigger id="data-source" data-testid="select-data-source">
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Data Q4 2024</SelectItem>
                <SelectItem value="customers">Customer Database</SelectItem>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x-axis">X-Axis</Label>
              <Select>
                <SelectTrigger id="x-axis" data-testid="select-x-axis">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="y-axis">Y-Axis</Label>
              <Select>
                <SelectTrigger id="y-axis" data-testid="select-y-axis">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

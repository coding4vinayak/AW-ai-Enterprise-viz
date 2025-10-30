import { useState } from "react";
import { DashboardGrid, GridItem, createDefaultLayout } from "@/components/dashboard/dashboard-grid";
import { ChartCard } from "@/components/dashboard/chart-card";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

type KPIWidget = {
  id: string;
  type: "kpi";
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
};

type ChartWidget = {
  id: string;
  type: "chart";
  chartType: "line" | "bar" | "pie" | "area";
  title: string;
};

type Widget = KPIWidget | ChartWidget;

export default function DashboardBuilder() {
  const { toast } = useToast();
  
  const initialWidgets: Widget[] = [
    { id: "kpi-1", type: "kpi", title: "Total Revenue", value: "$125,430", change: 12.5, trend: "up" },
    { id: "kpi-2", type: "kpi", title: "Active Users", value: "8,542", change: -3.2, trend: "down" },
    { id: "kpi-3", type: "kpi", title: "Conversion Rate", value: "3.24%", change: 0.8, trend: "up" },
    { id: "chart-1", type: "chart", chartType: "line", title: "Revenue Trend" },
    { id: "chart-2", type: "chart", chartType: "bar", title: "Sales by Region" },
    { id: "chart-3", type: "chart", chartType: "pie", title: "Product Categories" },
    { id: "chart-4", type: "chart", chartType: "area", title: "Customer Growth" },
  ];

  const [widgets] = useState<Widget[]>(initialWidgets);
  const [layout, setLayout] = useState<GridItem[]>([
    { i: "kpi-1", x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1, maxH: 1 },
    { i: "kpi-2", x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1, maxH: 1 },
    { i: "kpi-3", x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1, maxH: 1 },
    { i: "chart-1", x: 0, y: 1, w: 6, h: 3, minW: 4, minH: 2 },
    { i: "chart-2", x: 6, y: 1, w: 6, h: 3, minW: 4, minH: 2 },
    { i: "chart-3", x: 0, y: 4, w: 6, h: 3, minW: 4, minH: 2 },
    { i: "chart-4", x: 6, y: 4, w: 6, h: 3, minW: 4, minH: 2 },
  ]);

  const handleLayoutChange = (newLayout: GridItem[]) => {
    setLayout(newLayout);
  };

  const handleSave = (newLayout: GridItem[]) => {
    console.log("Saving layout:", newLayout);
    
    toast({
      title: "Dashboard saved",
      description: "Your dashboard layout has been saved successfully.",
    });
  };

  const renderWidget = (widget: Widget) => {
    if (widget.type === "kpi") {
      return (
        <KPICard
          title={widget.title}
          value={widget.value}
          change={widget.change}
          trend={widget.trend}
          sparklineData={[30, 40, 35, 50, 49, 60, 70]}
        />
      );
    }

    if (widget.type === "chart") {
      return (
        <ChartCard
          title={widget.title}
          type={widget.chartType}
          description={`Interactive ${widget.chartType} chart`}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 p-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold">Dashboard Builder</h1>
            </div>
            <p className="text-base text-muted-foreground">
              Customize your dashboard layout with drag-and-drop
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="default" data-testid="button-add-widget">
              <Plus className="h-4 w-4" />
              Add Widget
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-screen-2xl mx-auto">
          <DashboardGrid
            layout={layout}
            onLayoutChange={handleLayoutChange}
            onSave={handleSave}
            editable={true}
          >
            {widgets.map((widget) => (
              <div key={widget.id} data-grid={layout.find((l) => l.i === widget.id)}>
                {renderWidget(widget)}
              </div>
            ))}
          </DashboardGrid>
        </div>
      </div>
    </div>
  );
}

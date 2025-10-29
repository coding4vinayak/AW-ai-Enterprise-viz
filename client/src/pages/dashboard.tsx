import { Plus, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { useState } from "react";
import { CreateChartDialog } from "@/components/dashboard/create-chart-dialog";
import { useDatasets, useCreateDashboard } from "@/lib/api-hooks";
import { Link } from "wouter";

export default function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: datasets, isLoading } = useDatasets();

  // Mock KPI data - would come from datasets in full implementation
  const kpiData = [
    {
      id: "1",
      title: "Datasets Connected",
      value: datasets?.length.toString() || "0",
      change: 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, datasets?.length || 0],
    },
    {
      id: "2",
      title: "Total Records",
      value: datasets?.reduce((sum, ds) => sum + ds.rowCount, 0).toLocaleString() || "0",
      change: 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, datasets?.reduce((sum, ds) => sum + ds.rowCount, 0) || 0],
    },
    {
      id: "3",
      title: "Active Charts",
      value: "0",
      change: 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: "4",
      title: "AI Insights",
      value: "0",
      change: 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-4 p-8 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-screen-2xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 p-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-base text-muted-foreground">
              Monitor your key metrics and visualize your data
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="default" data-testid="button-date-filter">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="default" data-testid="button-filters">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="default" data-testid="button-export">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="button-add-chart"
            >
              <Plus className="h-4 w-4" />
              Add Chart
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-screen-2xl mx-auto space-y-8">
          {datasets && datasets.length > 0 ? (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {kpiData.map((kpi) => (
                  <KPICard key={kpi.id} {...kpi} />
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard
                  title="Revenue Trend"
                  type="line"
                  description="Monthly revenue over time"
                />
                <ChartCard
                  title="Sales by Region"
                  type="bar"
                  description="Geographic distribution"
                />
                <ChartCard
                  title="Product Category Mix"
                  type="pie"
                  description="Sales breakdown by category"
                />
                <ChartCard
                  title="Customer Growth"
                  type="area"
                  description="New customers acquired"
                />
              </div>
            </>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                  <Plus className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Data Connected</h3>
                <p className="text-base text-muted-foreground mb-6 max-w-md">
                  Upload your first dataset to start creating visualizations and insights
                </p>
                <Link href="/data">
                  <Button variant="default" size="lg" data-testid="button-connect-data">
                    <Plus className="h-4 w-4" />
                    Connect Data Source
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateChartDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

import { Plus, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { useState, useRef } from "react";
import { CreateChartDialog } from "@/components/dashboard/create-chart-dialog";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { ShareDashboardDialog } from "@/components/dashboard/share-dashboard-dialog";
import { EmailReportsDialog } from "@/components/dashboard/email-reports-dialog";
import { useDatasets, useCreateDashboard } from "@/lib/api-hooks";
import { Link } from "wouter";

export default function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { data: datasets, isLoading } = useDatasets();

  // Calculate real statistics from uploaded datasets
  const totalRecords = datasets?.reduce((sum, ds) => sum + ds.rowCount, 0) || 0;
  const totalColumns = datasets?.reduce((sum, ds) => {
    // Get columns from uploadedData if columns array is empty
    const cols = ds.columns && ds.columns.length > 0 
      ? ds.columns.length 
      : (ds.uploadedData as any[] || []).length > 0 
        ? Object.keys((ds.uploadedData as any[])[0]).length 
        : 0;
    return sum + cols;
  }, 0) || 0;

  const kpiData = [
    {
      id: "1",
      title: "Datasets Connected",
      value: datasets?.length.toString() || "0",
      change: datasets?.length || 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, datasets?.length || 0],
    },
    {
      id: "2",
      title: "Total Records",
      value: totalRecords.toLocaleString(),
      change: totalRecords > 0 ? 100 : 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, totalRecords],
    },
    {
      id: "3",
      title: "Total Columns",
      value: totalColumns.toString(),
      change: totalColumns > 0 ? 100 : 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, totalColumns],
    },
    {
      id: "4",
      title: "Data Sources",
      value: datasets?.length.toString() || "0",
      change: datasets?.length || 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, datasets?.length || 0],
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
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-date-filter">
              <Calendar className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Last 30 Days</span>
            </Button>
            <Button variant="outline" size="sm" data-testid="button-filters">
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <ShareDashboardDialog dashboardId="main-dashboard" dashboardName="Dashboard" />
            <EmailReportsDialog dashboardId="main-dashboard" dashboardName="Dashboard" />
            <Button
              variant="outline"
              size="sm"
              data-testid="button-export"
              onClick={(e) => {
                e.preventDefault();
                setIsExportDialogOpen(true);
              }}
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                setIsCreateDialogOpen(true);
              }}
              data-testid="button-add-chart"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Chart</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-screen-2xl mx-auto space-y-6" ref={dashboardRef}>
          {datasets && datasets.length > 0 ? (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {kpiData.map((kpi) => (
                  <KPICard key={kpi.id} {...kpi} />
                ))}
              </div>

              {/* Datasets Overview */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Your Datasets</h2>
                <div className="grid grid-cols-1 gap-4">
                  {datasets?.map((dataset) => (
                    <Card key={dataset.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{dataset.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {dataset.rowCount.toLocaleString()} rows • {
                                dataset.columns && dataset.columns.length > 0 
                                  ? dataset.columns.length 
                                  : (dataset.uploadedData as any[] || []).length > 0 
                                    ? Object.keys((dataset.uploadedData as any[])[0]).length 
                                    : 0
                              } columns
                            </CardDescription>
                          </div>
                          <Link href="/analytics">
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Chart
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const cols = dataset.columns && dataset.columns.length > 0 
                              ? dataset.columns 
                              : (dataset.uploadedData as any[] || []).length > 0 
                                ? Object.keys((dataset.uploadedData as any[])[0])
                                : [];
                            return cols.slice(0, 8).map((col) => (
                              <span
                                key={col}
                                className="px-2 py-1 text-xs bg-muted rounded-md"
                              >
                                {col}
                              </span>
                            ));
                          })()}
                          {(() => {
                            const colsLength = dataset.columns && dataset.columns.length > 0 
                              ? dataset.columns.length 
                              : (dataset.uploadedData as any[] || []).length > 0 
                                ? Object.keys((dataset.uploadedData as any[])[0]).length
                                : 0;
                            return colsLength > 8 && (
                              <span className="px-2 py-1 text-xs text-muted-foreground">
                                +{colsLength - 8} more
                              </span>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                <Link href="/data-sources">
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

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        dashboardElement={dashboardRef.current}
        dashboardData={datasets?.flatMap(ds => ds.uploadedData as any[] || [])}
        dashboardName="Dashboard"
      />
    </div>
  );
}

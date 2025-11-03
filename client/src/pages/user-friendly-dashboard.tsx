import { Plus, Download, Calendar, Filter, BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/dashboard/kpi-card";
import { useState, useRef } from "react";
import { useDatasets, useCreateDashboard } from "@/lib/api-hooks";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function UserFriendlyDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
      title: "Connected Datasets",
      value: datasets?.length?.toString() || "0",
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
      title: "Quick Charts",
      value: "0",
      change: 0,
      trend: "up" as const,
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: "4",
      title: "Insights Generated",
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
              Get insights from your data with one click
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-date-filter">
              <Calendar className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Last 30 Days</span>
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                setIsCreateDialogOpen(true);
              }}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Create Visualization</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-screen-2xl mx-auto space-y-8">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiData.map((kpi) => (
              <KPICard key={kpi.id} {...kpi} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/chart-builder">
                <Card className="hover:bg-accent transition-colors cursor-pointer border-2 border-transparent hover:border-primary/30">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Create Chart</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Build charts with templates or AI
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Start here
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/analytics">
                <Card className="hover:bg-accent transition-colors cursor-pointer border-2 border-transparent hover:border-primary/30">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Analyze Data</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Run advanced analytics
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      AI powered
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/insights">
                <Card className="hover:bg-accent transition-colors cursor-pointer border-2 border-transparent hover:border-primary/30">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Get Insights</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      AI-generated insights
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Automated
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/data-sources">
                <Card className="hover:bg-accent transition-colors cursor-pointer border-2 border-transparent hover:border-primary/30">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Connect Data</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add more datasets
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Multiple sources
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Datasets Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Datasets</h2>
              <Link href="/data-sources">
                <Button variant="outline" size="sm">
                  Manage Datasets
                </Button>
              </Link>
            </div>
            
            {datasets && datasets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {datasets?.map((dataset) => (
                  <Card key={dataset.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {dataset.name}
                            <Badge variant="outline" className="text-xs">
                              {dataset.rowCount.toLocaleString()} rows
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {dataset.columns && dataset.columns.length > 0 
                              ? dataset.columns.length 
                              : (dataset.uploadedData as any[] || []).length > 0 
                                ? Object.keys((dataset.uploadedData as any[])[0]).length 
                                : 0
                            } columns
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Link href="/chart-builder">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                // We'll pass dataset context via URL params if needed
                              }}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Visualize
                            </Button>
                          </Link>
                          <Link href="/analytics">
                            <Button variant="outline" size="sm">
                              <Activity className="h-4 w-4 mr-2" />
                              Analyze
                            </Button>
                          </Link>
                        </div>
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
            ) : (
              <Card className="border-dashed border-2 text-center">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                    <BarChart3 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Data Connected</h3>
                  <p className="text-base text-muted-foreground mb-6 max-w-md">
                    Connect your first dataset to start visualizing and getting insights
                  </p>
                  <Link href="/data-sources">
                    <Button variant="default" size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Data Source
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
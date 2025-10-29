import { Upload, FileSpreadsheet, Database as DatabaseIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataUploadZone } from "@/components/data/data-upload-zone";
import { DatasetCard } from "@/components/data/dataset-card";
import { useState } from "react";
import { useDatasets } from "@/lib/api-hooks";

export default function DataSources() {
  const [showUpload, setShowUpload] = useState(false);
  const { data: datasets, isLoading } = useDatasets();

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 p-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Data Sources</h1>
            <p className="text-base text-muted-foreground">
              Connect and manage your data sources
            </p>
          </div>
          <Button
            variant="default"
            size="default"
            onClick={() => setShowUpload(!showUpload)}
            data-testid="button-upload-data"
          >
            <Plus className="h-4 w-4" />
            Upload Data
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-screen-2xl mx-auto space-y-8">
          {/* Upload Zone */}
          {showUpload && (
            <Card className="border-dashed border-2">
              <CardContent className="p-12">
                <DataUploadZone onUploadComplete={() => setShowUpload(false)} />
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Connected Sources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Connected Data Sources */}
          {!isLoading && datasets && datasets.length > 0 && (
            <>
              <div>
                <h2 className="text-2xl font-semibold mb-4">Connected Sources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {datasets.map((dataset) => (
                    <DatasetCard key={dataset.id} dataset={dataset} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && (!datasets || datasets.length === 0) && !showUpload && (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                  <DatabaseIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Data Sources Connected</h3>
                <p className="text-base text-muted-foreground mb-6 max-w-md">
                  Upload a CSV or Excel file to get started with your analytics dashboard
                </p>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setShowUpload(true)}
                  data-testid="button-get-started"
                >
                  <Upload className="h-4 w-4" />
                  Upload Your First Dataset
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Start Guide */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Supported Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <FileSpreadsheet className="h-8 w-8 text-chart-1 mb-2" />
                  <CardTitle className="text-lg">CSV Files</CardTitle>
                  <CardDescription>
                    Upload comma-separated value files with automatic schema detection
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <FileSpreadsheet className="h-8 w-8 text-chart-2 mb-2" />
                  <CardTitle className="text-lg">Excel Files</CardTitle>
                  <CardDescription>
                    Support for .xlsx and .xls files with multi-sheet import
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <DatabaseIcon className="h-8 w-8 text-chart-3 mb-2" />
                  <CardTitle className="text-lg">API Connections</CardTitle>
                  <CardDescription>
                    Connect to external databases and APIs (Coming Soon)
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

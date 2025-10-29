import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Save, Download } from "lucide-react";
import { ChartBuilder } from "@/components/charts/chart-builder";

export default function Analytics() {
  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 p-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics Builder</h1>
            <p className="text-base text-muted-foreground">
              Create custom visualizations and analyze your data
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="default" data-testid="button-save-chart" className="flex-1 sm:flex-initial">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Chart</span>
              <span className="sm:hidden">Save</span>
            </Button>
            <Button variant="outline" size="default" data-testid="button-export-chart" className="flex-1 sm:flex-initial">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="default" size="default" data-testid="button-apply-changes" className="w-full sm:w-auto">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Apply Changes</span>
              <span className="sm:hidden">Apply</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ChartBuilder />
      </div>
    </div>
  );
}

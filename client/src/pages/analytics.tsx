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
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" data-testid="button-save-chart">
              <Save className="h-4 w-4" />
              Save Chart
            </Button>
            <Button variant="outline" size="default" data-testid="button-export-chart">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="default" size="default" data-testid="button-apply-changes">
              <Play className="h-4 w-4" />
              Apply Changes
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

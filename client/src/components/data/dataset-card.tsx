import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Trash2, Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useDeleteDataset } from "@/lib/api-hooks";
import type { Dataset } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface DatasetCardProps {
  dataset: Dataset;
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  const deleteMutation = useDeleteDataset();
  const [showPreview, setShowPreview] = useState(false);

  const typeColors = {
    csv: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    excel: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${dataset.name}"?`)) {
      deleteMutation.mutate(dataset.id);
    }
  };

  const previewData = (dataset.uploadedData as any[] || []).slice(0, 10);
  const columns = dataset.columns || [];

  return (
    <>
      <Card className="hover-elevate" data-testid={`dataset-card-${dataset.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{dataset.name}</CardTitle>
                <CardDescription className="mt-1">
                  {dataset.rowCount.toLocaleString()} rows • {columns.length} columns
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={typeColors[dataset.type as "csv" | "excel"] || typeColors.csv}
              data-testid={`badge-type-${dataset.type}`}
            >
              {dataset.type.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(dataset.createdAt), { addSuffix: true })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowPreview(true)}
                data-testid={`button-view-${dataset.id}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-testid={`button-download-${dataset.id}`}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-${dataset.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{dataset.name}</DialogTitle>
            <DialogDescription>
              Preview of first 10 rows • Total: {dataset.rowCount.toLocaleString()} rows, {columns.length} columns
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map((col) => (
                      <TableCell key={col} className="whitespace-nowrap">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

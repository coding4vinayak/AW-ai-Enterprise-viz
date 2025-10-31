import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { FileDown, FileSpreadsheet, FileImage } from "lucide-react";
import { exportDashboard } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardElement?: HTMLElement | null;
  dashboardData?: any[];
  dashboardName?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  dashboardElement,
  dashboardData,
  dashboardName = "Dashboard",
}: ExportDialogProps) {
  const [format, setFormat] = useState<"pdf" | "png" | "excel">("pdf");
  const [filename, setFilename] = useState(dashboardName);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === "excel") {
        if (!dashboardData || dashboardData.length === 0) {
          toast({
            title: "No data to export",
            description: "There is no data available to export to Excel.",
            variant: "destructive",
          });
          setIsExporting(false);
          return;
        }

        const columns = Object.keys(dashboardData[0]);
        await exportDashboard({
          filename,
          format,
          data: dashboardData,
          columns,
        });
      } else {
        if (!dashboardElement) {
          toast({
            title: "Export failed",
            description: "Dashboard element not found. Please try again.",
            variant: "destructive",
          });
          setIsExporting(false);
          return;
        }

        await exportDashboard({
          filename,
          format,
          element: dashboardElement,
        });
      }

      toast({
        title: "Export successful",
        description: `Dashboard exported as ${format.toUpperCase()}.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle>Export Dashboard</DialogTitle>
          <DialogDescription>
            Choose the format and configure export settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)}>
              <div className="flex items-center space-x-2 rounded-md border border-border p-4 hover-elevate">
                <RadioGroupItem value="pdf" id="pdf" data-testid="radio-format-pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <FileDown className="h-4 w-4" />
                  <div>
                    <div className="font-medium">PDF Document</div>
                    <div className="text-sm text-muted-foreground">
                      Full dashboard as a PDF file
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border border-border p-4 hover-elevate">
                <RadioGroupItem value="png" id="png" data-testid="radio-format-png" />
                <Label htmlFor="png" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <FileImage className="h-4 w-4" />
                  <div>
                    <div className="font-medium">PNG Image</div>
                    <div className="text-sm text-muted-foreground">
                      Dashboard screenshot as PNG
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border border-border p-4 hover-elevate">
                <RadioGroupItem value="excel" id="excel" data-testid="radio-format-excel" />
                <Label htmlFor="excel" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Excel Spreadsheet</div>
                    <div className="text-sm text-muted-foreground">
                      Raw data in Excel format
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              data-testid="input-filename"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-export"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !filename}
            data-testid="button-confirm-export"
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

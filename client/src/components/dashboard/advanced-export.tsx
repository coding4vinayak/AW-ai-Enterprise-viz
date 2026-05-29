import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface AdvancedExportProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardRef: React.RefObject<HTMLElement>;
}

type ExportFormat = "pdf" | "png";
type PageSize = "a4" | "letter";
type Orientation = "portrait" | "landscape";

const PAGE_DIMENSIONS: Record<PageSize, Record<Orientation, { width: number; height: number }>> = {
  a4: {
    portrait: { width: 210, height: 297 },
    landscape: { width: 297, height: 210 },
  },
  letter: {
    portrait: { width: 216, height: 279 },
    landscape: { width: 279, height: 216 },
  },
};

export function AdvancedExport({ isOpen, onClose, dashboardRef }: AdvancedExportProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [includeTitle, setIncludeTitle] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!dashboardRef.current) return;

    setExporting(true);

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      if (format === "png") {
        const link = document.createElement("a");
        link.download = `dashboard-export-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const dimensions = PAGE_DIMENSIONS[pageSize][orientation];
        const pdf = new jsPDF({
          orientation,
          unit: "mm",
          format: pageSize,
        });

        if (includeTitle) {
          pdf.setFontSize(16);
          pdf.text("Dashboard Export", 14, 20);
          pdf.setFontSize(10);
          pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        }

        const imgData = canvas.toDataURL("image/png");
        const titleOffset = includeTitle ? 35 : 10;
        const imgWidth = dimensions.width - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const maxHeight = dimensions.height - titleOffset - 10;
        const finalHeight = Math.min(imgHeight, maxHeight);

        pdf.addImage(imgData, "PNG", 10, titleOffset, imgWidth, finalHeight);
        pdf.save(`dashboard-export-${Date.now()}.pdf`);
      }

      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {format === "pdf" && (
            <>
              <div className="space-y-2">
                <Label>Page Size</Label>
                <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Orientation</Label>
                <Select value={orientation} onValueChange={(v) => setOrientation(v as Orientation)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-title">Include Title</Label>
                <Switch
                  id="include-title"
                  checked={includeTitle}
                  onCheckedChange={setIncludeTitle}
                />
              </div>
            </>
          )}

          <Button onClick={handleExport} disabled={exporting} className="w-full">
            <Download className="h-4 w-4 mr-1" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AdvancedExport;

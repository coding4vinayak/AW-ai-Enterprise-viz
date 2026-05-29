import { useRef, useState } from "react";
import { LayoutEditor } from "@/components/dashboard/layout-editor";
import { AdvancedExport } from "@/components/dashboard/advanced-export";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { LayoutWidget } from "@/components/dashboard/layout-editor";

export default function LayoutEditorPage() {
  const { toast } = useToast();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const handleSave = (layout: LayoutWidget[]) => {
    toast({
      title: "Layout saved",
      description: `Saved layout with ${layout.length} widgets.`,
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Layout Editor</h1>
          <p className="text-muted-foreground">
            Drag and drop widgets to customize your dashboard layout.
          </p>
        </div>
        <Button variant="outline" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
      <div ref={dashboardRef}>
        <LayoutEditor onSave={handleSave} />
      </div>
      <AdvancedExport
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        dashboardRef={dashboardRef}
      />
    </div>
  );
}

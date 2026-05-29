import { LayoutEditor } from "@/components/dashboard/layout-editor";
import { useToast } from "@/hooks/use-toast";
import type { LayoutWidget } from "@/components/dashboard/layout-editor";

export default function LayoutEditorPage() {
  const { toast } = useToast();

  const handleSave = (layout: LayoutWidget[]) => {
    toast({
      title: "Layout saved",
      description: `Saved layout with ${layout.length} widgets.`,
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Layout Editor</h1>
        <p className="text-muted-foreground">
          Drag and drop widgets to customize your dashboard layout.
        </p>
      </div>
      <LayoutEditor onSave={handleSave} />
    </div>
  );
}

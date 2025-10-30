import { useState, useCallback, useEffect, useRef } from "react";
import { Responsive, WidthProvider, Layout as RGLLayout, Layouts } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Edit3, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

interface DashboardGridProps {
  layout: GridItem[];
  onLayoutChange?: (layout: GridItem[]) => void;
  onSave?: (layout: GridItem[]) => void;
  children: React.ReactNode;
  editable?: boolean;
}

export function DashboardGrid({
  layout: initialLayout,
  onLayoutChange,
  onSave,
  children,
  editable = true,
}: DashboardGridProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<GridItem[]>(initialLayout);
  const [currentLayouts, setCurrentLayouts] = useState<Layouts>({ lg: initialLayout });
  const savedLayoutsSnapshot = useRef<Layouts>({ lg: initialLayout });
  const { toast } = useToast();

  useEffect(() => {
    setCurrentLayout(initialLayout);
    const newLayouts = { lg: initialLayout };
    setCurrentLayouts(newLayouts);
    if (!isEditMode) {
      savedLayoutsSnapshot.current = JSON.parse(JSON.stringify(newLayouts));
    }
  }, [initialLayout, isEditMode]);

  const handleLayoutChange = useCallback(
    (newLayout: RGLLayout[], allLayouts: Layouts) => {
      const formattedLayout: GridItem[] = newLayout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
        maxW: item.maxW,
        maxH: item.maxH,
        static: item.static,
      }));
      
      setCurrentLayout(formattedLayout);
      setCurrentLayouts(allLayouts);
      
      if (isEditMode && onLayoutChange) {
        onLayoutChange(formattedLayout);
      }
    },
    [isEditMode, onLayoutChange]
  );

  const handleSave = () => {
    if (onSave) {
      onSave(currentLayout);
      toast({
        title: "Layout saved",
        description: "Your dashboard layout has been saved successfully.",
      });
    }
    setIsEditMode(false);
  };

  const handleCancel = () => {
    const restoredLayouts = JSON.parse(JSON.stringify(savedLayoutsSnapshot.current));
    const restoredLgLayout = (restoredLayouts.lg || []) as GridItem[];
    
    setCurrentLayouts(restoredLayouts);
    setCurrentLayout(restoredLgLayout);
    setIsEditMode(false);
    
    if (onLayoutChange) {
      onLayoutChange(restoredLgLayout);
    }
    
    toast({
      title: "Changes discarded",
      description: "Layout changes have been discarded.",
    });
  };

  const handleEnterEditMode = () => {
    savedLayoutsSnapshot.current = JSON.parse(JSON.stringify(currentLayouts));
    setIsEditMode(true);
    toast({
      title: "Edit mode enabled",
      description: "Drag and resize charts to customize your dashboard layout.",
    });
  };

  return (
    <div className="relative">
      {/* Edit Mode Controls */}
      {editable && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border p-4 bg-card">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isEditMode ? "bg-orange-500" : "bg-green-500"}`} />
            <span className="text-sm font-medium">
              {isEditMode ? "Edit Mode Active" : "View Mode"}
            </span>
            {isEditMode && (
              <span className="text-xs text-muted-foreground">
                Drag charts to rearrange • Resize from corners
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {!isEditMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnterEditMode}
                data-testid="button-enable-edit-mode"
              >
                <Edit3 className="h-4 w-4" />
                Edit Layout
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  data-testid="button-cancel-edit"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  data-testid="button-save-layout"
                >
                  <Save className="h-4 w-4" />
                  Save Layout
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={currentLayouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        preventCollision={false}
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
}

export function createDefaultLayout(items: number): GridItem[] {
  return Array.from({ length: items }, (_, i) => ({
    i: `item-${i}`,
    x: (i % 3) * 4,
    y: Math.floor(i / 3) * 2,
    w: 4,
    h: 2,
    minW: 2,
    minH: 2,
  }));
}

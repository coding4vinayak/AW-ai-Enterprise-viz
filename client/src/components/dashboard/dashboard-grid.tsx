import { useState, useCallback, useEffect, useRef } from "react";
import { Responsive, WidthProvider, Layout as RGLLayout, Layouts } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Edit3, Save, X, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Chart } from '@shared/types';
import { AdvancedChartRenderer } from '@/components/charts/advanced-chart-renderer';

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
  charts: Chart[];
  isEditMode?: boolean;
}

export function DashboardGrid({
  layout: initialLayout,
  onLayoutChange,
  onSave,
  children,
  editable = true,
  charts,
  isEditMode = false,
}: DashboardGridProps) {
  const [currentLayout, setCurrentLayout] = useState<GridItem[]>(initialLayout);
  const [currentLayouts, setCurrentLayouts] = useState<Layouts>({ lg: initialLayout });
  const savedLayoutsSnapshot = useRef<Layouts>({ lg: initialLayout });
  const { toast } = useToast();
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [internalIsEditMode, setIsEditMode] = useState<boolean>(isEditMode);

  useEffect(() => {
    setCurrentLayout(initialLayout);
    const newLayouts = { lg: initialLayout };
    setCurrentLayouts(newLayouts);
    if (!internalIsEditMode) {
      savedLayoutsSnapshot.current = JSON.parse(JSON.stringify(newLayouts));
    }
  }, [initialLayout, internalIsEditMode]);

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

      if (internalIsEditMode && onLayoutChange) {
        onLayoutChange(formattedLayout);
      }
    },
    [internalIsEditMode, onLayoutChange]
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
            <div className={`w-2 h-2 rounded-full ${internalIsEditMode ? "bg-orange-500" : "bg-green-500"}`} />
            <span className="text-sm font-medium">
              {internalIsEditMode ? "Edit Mode Active" : "View Mode"}
            </span>
            {internalIsEditMode && (
              <span className="text-xs text-muted-foreground">
                Drag charts to rearrange • Resize from corners
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {!internalIsEditMode ? (
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
      {expandedChart ? (
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">
              {charts?.find(c => c.id === expandedChart)?.name || 'Chart'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedChart(null)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[600px]">
            {charts?.find(c => c.id === expandedChart) && (
              <AdvancedChartRenderer 
                config={charts.find(c => c.id === expandedChart)!.config}
                data={[]}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={currentLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          isDraggable={internalIsEditMode}
          isResizable={internalIsEditMode}
          onLayoutChange={handleLayoutChange}
          compactType="vertical"
          preventCollision={false}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {charts && charts.length > 0 ? charts.map((chart) => (
            <Card key={chart.id} className="overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {internalIsEditMode && <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />}
                  {chart.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setExpandedChart(chart.id)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <AdvancedChartRenderer chart={chart} />
              </CardContent>
            </Card>
          )) : null}
          {children}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}

export type { GridItem };
import { useState, useCallback } from "react";
import { Responsive, WidthProvider, Layout as RGLLayout } from "react-grid-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Save, RotateCcw, X, LayoutGrid } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface LayoutWidget {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  chartType?: string;
  name?: string;
}

interface LayoutEditorProps {
  initialLayout?: LayoutWidget[];
  onSave?: (layout: LayoutWidget[]) => void;
}

const PRESET_LAYOUTS: Record<string, LayoutWidget[]> = {
  "2-column": [
    { i: "widget-1", x: 0, y: 0, w: 6, h: 4, name: "Widget 1" },
    { i: "widget-2", x: 6, y: 0, w: 6, h: 4, name: "Widget 2" },
  ],
  "3-column": [
    { i: "widget-1", x: 0, y: 0, w: 4, h: 4, name: "Widget 1" },
    { i: "widget-2", x: 4, y: 0, w: 4, h: 4, name: "Widget 2" },
    { i: "widget-3", x: 8, y: 0, w: 4, h: 4, name: "Widget 3" },
  ],
  "sidebar-main": [
    { i: "widget-1", x: 0, y: 0, w: 4, h: 8, name: "Sidebar" },
    { i: "widget-2", x: 4, y: 0, w: 8, h: 4, name: "Main Top" },
    { i: "widget-3", x: 4, y: 4, w: 8, h: 4, name: "Main Bottom" },
  ],
  "4-grid": [
    { i: "widget-1", x: 0, y: 0, w: 6, h: 4, name: "Top Left" },
    { i: "widget-2", x: 6, y: 0, w: 6, h: 4, name: "Top Right" },
    { i: "widget-3", x: 0, y: 4, w: 6, h: 4, name: "Bottom Left" },
    { i: "widget-4", x: 6, y: 4, w: 6, h: 4, name: "Bottom Right" },
  ],
};

const CHART_TYPES = ["bar", "line", "pie", "area", "scatter", "kpi", "heatmap", "funnel"];

export function LayoutEditor({ initialLayout = [], onSave }: LayoutEditorProps) {
  const [layout, setLayout] = useState<LayoutWidget[]>(initialLayout);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newWidgetName, setNewWidgetName] = useState("");
  const [newWidgetChartType, setNewWidgetChartType] = useState("bar");

  const handleLayoutChange = useCallback((newLayout: RGLLayout[]) => {
    setLayout((prev) =>
      prev.map((widget) => {
        const updated = newLayout.find((l) => l.i === widget.i);
        if (updated) {
          return { ...widget, x: updated.x, y: updated.y, w: updated.w, h: updated.h };
        }
        return widget;
      })
    );
  }, []);

  const handleAddWidget = () => {
    const id = `widget-${Date.now()}`;
    const newWidget: LayoutWidget = {
      i: id,
      x: 0,
      y: Infinity,
      w: 6,
      h: 4,
      chartType: newWidgetChartType,
      name: newWidgetName || `Widget ${layout.length + 1}`,
    };
    setLayout((prev) => [...prev, newWidget]);
    setNewWidgetName("");
    setNewWidgetChartType("bar");
    setAddDialogOpen(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setLayout((prev) => prev.filter((w) => w.i !== widgetId));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(layout);
    }
  };

  const handleReset = () => {
    setLayout(initialLayout);
  };

  const handlePreset = (presetName: string) => {
    const preset = PRESET_LAYOUTS[presetName];
    if (preset) {
      setLayout(preset.map((w) => ({ ...w })));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
        <div className="flex items-center gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Widget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Widget Name</label>
                  <Input
                    value={newWidgetName}
                    onChange={(e) => setNewWidgetName(e.target.value)}
                    placeholder="Enter widget name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Chart Type</label>
                  <Select value={newWidgetChartType} onValueChange={setNewWidgetChartType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHART_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddWidget} className="w-full">
                  Add Widget
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Presets Dropdown */}
          <Select onValueChange={handlePreset}>
            <SelectTrigger className="w-[160px]">
              <LayoutGrid className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Presets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2-column">2 Column</SelectItem>
              <SelectItem value="3-column">3 Column</SelectItem>
              <SelectItem value="sidebar-main">Sidebar + Main</SelectItem>
              <SelectItem value="4-grid">4 Grid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save Layout
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        isDraggable={true}
        isResizable={true}
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        margin={[16, 16]}
      >
        {layout.map((widget) => (
          <Card key={widget.i} className="overflow-hidden relative group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{widget.name || widget.i}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveWidget(widget.i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                {widget.chartType ? `${widget.chartType} chart` : "Empty widget"}
              </div>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

export default LayoutEditor;

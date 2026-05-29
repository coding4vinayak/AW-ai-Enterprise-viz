import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, RotateCcw, Trash2, Clock } from "lucide-react";

interface DashboardVersion {
  id: string;
  timestamp: string;
  layout: any;
  label: string;
}

interface VersionControlProps {
  dashboardId: string;
  currentLayout: any;
  onRestore: (layout: any) => void;
}

function getStorageKey(dashboardId: string): string {
  return `dashboard-versions-${dashboardId}`;
}

function loadVersions(dashboardId: string): DashboardVersion[] {
  try {
    const stored = localStorage.getItem(getStorageKey(dashboardId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveVersions(dashboardId: string, versions: DashboardVersion[]): void {
  try {
    localStorage.setItem(getStorageKey(dashboardId), JSON.stringify(versions));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

export function VersionControl({ dashboardId, currentLayout, onRestore }: VersionControlProps) {
  const [versions, setVersions] = useState<DashboardVersion[]>(() => loadVersions(dashboardId));

  useEffect(() => {
    setVersions(loadVersions(dashboardId));
  }, [dashboardId]);

  const updateVersions = useCallback((updater: (prev: DashboardVersion[]) => DashboardVersion[]) => {
    setVersions((prev) => {
      const next = updater(prev);
      saveVersions(dashboardId, next);
      return next;
    });
  }, [dashboardId]);

  const handleSaveVersion = () => {
    const newVersion: DashboardVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      layout: JSON.parse(JSON.stringify(currentLayout)),
      label: `Version ${versions.length + 1}`,
    };
    updateVersions((prev) => [newVersion, ...prev]);
  };

  const handleRestore = (version: DashboardVersion) => {
    onRestore(version.layout);
  };

  const handleDelete = (versionId: string) => {
    updateVersions((prev) => prev.filter((v) => v.id !== versionId));
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Version History</CardTitle>
        <Button size="sm" onClick={handleSaveVersion}>
          <Save className="h-4 w-4 mr-1" />
          Save Version
        </Button>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No versions saved yet. Click "Save Version" to create a snapshot.
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{version.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(version.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRestore(version)}
                      title="Restore this version"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(version.id)}
                      title="Delete this version"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default VersionControl;

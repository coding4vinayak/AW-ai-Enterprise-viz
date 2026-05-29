import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronRight } from 'lucide-react';
import type { DrillDownConfig } from '@shared/types';

interface DrillDownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  drillDownConfig?: DrillDownConfig;
  dataPoint: any;
  data: any[];
}

export function DrillDownPanel({
  isOpen,
  onClose,
  drillDownConfig,
  dataPoint,
  data,
}: DrillDownPanelProps) {
  const targetField = drillDownConfig?.targetField;

  const filteredData = targetField && dataPoint
    ? data.filter((item) => item[targetField] === dataPoint[targetField])
    : data;

  const columns = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

  const breadcrumbs = [
    { label: 'All Data', value: null },
    ...(dataPoint && targetField
      ? [{ label: `${targetField}: ${dataPoint[targetField]}`, value: dataPoint[targetField] }]
      : []),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Drill Down</SheetTitle>
          <SheetDescription>
            Explore detailed data for the selected point.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          {/* Breadcrumb trail */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={idx === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          {/* Data table */}
          {filteredData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 50).map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No data available for this selection.</p>
          )}

          {filteredData.length > 50 && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing first 50 of {filteredData.length} rows.
            </p>
          )}
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

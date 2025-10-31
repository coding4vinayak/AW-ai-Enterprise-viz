import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  sparklineData: number[];
  invertTrend?: boolean;
}

export function KPICard({
  title,
  value,
  change,
  trend,
  sparklineData,
  invertTrend = false,
}: KPICardProps) {
  const isPositive = invertTrend ? trend === "down" : trend === "up";
  const changeColor = isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500";
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  const chartData = sparklineData.map((value, index) => ({
    value,
    index,
  }));

  return (
    <Card className="hover-elevate" data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span>{Math.abs(change)}%</span>
            </div>
          </div>

          {/* Value */}
          <div>
            <p className="text-4xl font-bold font-mono" data-testid={`kpi-value-${title.toLowerCase().replace(/\s+/g, "-")}`}>
              {value}
            </p>
          </div>

          {/* Sparkline */}
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

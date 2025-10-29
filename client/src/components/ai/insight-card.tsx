import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Sparkles, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InsightCardProps {
  insight: {
    id: string;
    type: "trend" | "anomaly" | "forecast" | "summary";
    title: string;
    content: string;
    severity: "positive" | "negative" | "neutral";
    confidence: number;
    generatedAt: Date;
  };
}

export function InsightCard({ insight }: InsightCardProps) {
  const typeConfig = {
    trend: {
      icon: TrendingUp,
      color: "border-chart-1",
      bgColor: "bg-chart-1/5",
      label: "Trend Analysis",
    },
    anomaly: {
      icon: AlertTriangle,
      color: "border-chart-4",
      bgColor: "bg-chart-4/5",
      label: "Anomaly Detected",
    },
    forecast: {
      icon: Sparkles,
      color: "border-chart-3",
      bgColor: "bg-chart-3/5",
      label: "Forecast",
    },
    summary: {
      icon: FileText,
      color: "border-chart-2",
      bgColor: "bg-chart-2/5",
      label: "Summary",
    },
  };

  const severityColors = {
    positive: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    negative: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    neutral: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  };

  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <Card
      className={`border-l-4 ${config.color} ${config.bgColor}`}
      data-testid={`insight-card-${insight.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor} shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{insight.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(insight.generatedAt, { addSuffix: true })}</span>
                <span>•</span>
                <span className="font-mono">{(insight.confidence * 100).toFixed(0)}% confidence</span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={severityColors[insight.severity]}
            data-testid={`badge-severity-${insight.severity}`}
          >
            {insight.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed">{insight.content}</p>
      </CardContent>
    </Card>
  );
}

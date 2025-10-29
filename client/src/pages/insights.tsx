import { Sparkles, TrendingUp, AlertCircle, Target, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightCard } from "@/components/ai/insight-card";
import { Button } from "@/components/ui/button";

export default function Insights() {
  // Mock insights - will be replaced with AI-generated content
  const mockInsights = [
    {
      id: "1",
      type: "trend" as const,
      title: "Revenue Growth Acceleration",
      content:
        "Sales have increased by 12.5% compared to last month, primarily driven by the North region with an 18% surge. This growth is attributed to the new product launch and seasonal demand.",
      severity: "positive" as const,
      confidence: 0.92,
      generatedAt: new Date("2025-01-15T10:30:00"),
    },
    {
      id: "2",
      type: "anomaly" as const,
      title: "Unusual Churn Pattern Detected",
      content:
        "Customer churn rate dropped to 3.2% this week, down from the usual 4.5%. Analysis shows improved customer satisfaction scores and reduced support ticket resolution time.",
      severity: "positive" as const,
      confidence: 0.87,
      generatedAt: new Date("2025-01-15T09:15:00"),
    },
    {
      id: "3",
      type: "forecast" as const,
      title: "Q1 Revenue Forecast",
      content:
        "Based on current trends, Q1 2025 revenue is projected to reach $385,000, representing a 15% increase year-over-year. Key drivers include expanding customer base and improved retention.",
      severity: "neutral" as const,
      confidence: 0.84,
      generatedAt: new Date("2025-01-15T08:00:00"),
    },
    {
      id: "4",
      type: "summary" as const,
      title: "Product Performance Analysis",
      content:
        "Electronics category leads with 42% of total sales, followed by Home & Garden at 28%. Average order value increased by 5.3% due to successful cross-selling initiatives.",
      severity: "neutral" as const,
      confidence: 0.95,
      generatedAt: new Date("2025-01-14T16:45:00"),
    },
  ];

  const insightStats = [
    { label: "Total Insights", value: "47", icon: Brain },
    { label: "Trends Identified", value: "12", icon: TrendingUp },
    { label: "Anomalies Found", value: "3", icon: AlertCircle },
    { label: "Forecasts", value: "8", icon: Target },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 p-8 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              AI Insights
              <Sparkles className="h-8 w-8 text-primary" />
            </h1>
            <p className="text-base text-muted-foreground">
              AI-powered analysis and recommendations for your data
            </p>
          </div>
          <Button variant="default" size="default" data-testid="button-generate-insights">
            <Sparkles className="h-4 w-4" />
            Generate New Insights
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-screen-2xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {insightStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold font-mono">{stat.value}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Configuration Notice */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Features Configuration
              </CardTitle>
              <CardDescription>
                Advanced AI insights require OpenAI API key configuration in Settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" data-testid="link-settings">
                Configure API Key
              </Button>
            </CardContent>
          </Card>

          {/* Insights Feed */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Insights</h2>
            <div className="space-y-4">
              {mockInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

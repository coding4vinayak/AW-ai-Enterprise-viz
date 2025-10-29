
import { Sparkles, TrendingUp, AlertCircle, Target, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightCard } from "@/components/ai/insight-card";
import { Button } from "@/components/ui/button";
import { useInsights, useGenerateInsight, useDatasets } from "@/lib/api-hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Insights() {
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const { data: datasets } = useDatasets();
  const { data: insights, isLoading } = useInsights(undefined, selectedDataset || undefined);
  const generateInsight = useGenerateInsight();

  const handleGenerateInsight = () => {
    if (selectedDataset) {
      generateInsight.mutate({ datasetId: selectedDataset });
    } else {
      generateInsight.mutate({});
    }
  };

  const insightStats = [
    { label: "Total Insights", value: insights?.length.toString() || "0", icon: Brain },
    { 
      label: "Trends Identified", 
      value: insights?.filter(i => i.type === "trend").length.toString() || "0", 
      icon: TrendingUp 
    },
    { 
      label: "Anomalies Found", 
      value: insights?.filter(i => i.type === "anomaly").length.toString() || "0", 
      icon: AlertCircle 
    },
    { 
      label: "Forecasts", 
      value: insights?.filter(i => i.type === "forecast").length.toString() || "0", 
      icon: Target 
    },
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
          <div className="flex flex-wrap gap-2">
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Datasets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Datasets</SelectItem>
                {datasets?.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="default" 
              size="default" 
              onClick={handleGenerateInsight}
              disabled={generateInsight.isPending}
              data-testid="button-generate-insights"
              className="w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">{generateInsight.isPending ? "Generating..." : "Generate New Insights"}</span>
              <span className="sm:hidden">{generateInsight.isPending ? "Generating..." : "Generate"}</span>
            </Button>
          </div>
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
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading insights...
              </div>
            ) : insights && insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <InsightCard 
                    key={insight.id} 
                    insight={{
                      id: insight.id,
                      type: insight.type as "trend" | "anomaly" | "forecast" | "summary",
                      title: `${insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} Insight`,
                      content: insight.content,
                      severity: "neutral" as const,
                      confidence: 0.85,
                      generatedAt: new Date(insight.createdAt),
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI-powered insights from your uploaded data
                  </p>
                  <Button onClick={handleGenerateInsight} disabled={generateInsight.isPending}>
                    <Sparkles className="h-4 w-4" />
                    Generate First Insight
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

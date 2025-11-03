import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Sparkles, 
  Bot, 
  User, 
  MessageCircle, 
  Lightbulb,
  ChartNoAxesColumn,
  Eye,
  Send
} from 'lucide-react';
import { AdvancedChartConfig } from '@shared/types';
import { useToast } from '@/hooks/use-toast';

interface AIChartAssistantProps {
  datasetId: string;
  datasetName: string;
  datasetColumns: string[];
  currentConfig?: AdvancedChartConfig;
  onDataProcessed: (config: AdvancedChartConfig) => void;
  onExplanationReceived: (explanation: string) => void;
}

export function AIChartAssistant({ 
  datasetId, 
  datasetName, 
  datasetColumns, 
  currentConfig, 
  onDataProcessed,
  onExplanationReceived
}: AIChartAssistantProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'explain'>('create');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    
    try {
      if (activeTab === 'create') {
        // Request AI to generate chart configuration
        const response = await fetch('/api/ai/chart-suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            datasetId,
            datasetName,
            datasetColumns,
            userPrompt: prompt
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to generate chart suggestion');
        }

        const result = await response.json();
        
        if (result.config) {
          onDataProcessed(result.config);
          toast({
            title: 'Chart Suggestion Generated',
            description: 'AI has suggested a chart configuration based on your request'
          });
        } else {
          toast({
            title: 'Could not generate chart',
            description: result.message || 'Please try rephrasing your request',
            variant: 'destructive'
          });
        }
      } else {
        // Request AI to explain the current chart
        const response = await fetch('/api/ai/chart-explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            datasetId,
            datasetName,
            datasetColumns,
            chartConfig: currentConfig
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to explain chart');
        }

        const result = await response.json();
        
        if (result.explanation) {
          onExplanationReceived(result.explanation);
          toast({
            title: 'Chart Explained',
            description: 'AI has analyzed and explained your chart'
          });
        }
      }
    } catch (error: any) {
      console.error('AI chart assistant error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process your request',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Chart Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {activeTab === 'create' 
            ? 'Ask AI to create a chart based on your data' 
            : 'Get AI to explain your current chart'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'explain')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <ChartNoAxesColumn className="h-4 w-4" />
              Create Chart
            </TabsTrigger>
            <TabsTrigger value="explain" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Explain Chart
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Dataset: {datasetName}</span>
            <Badge variant="secondary" className="ml-auto">
              {datasetColumns.length} fields
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {datasetColumns.slice(0, 5).map((col, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {col}
              </Badge>
            ))}
            {datasetColumns.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{datasetColumns.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTab === 'create'
                ? 'Describe the chart you want to create (e.g., "Show sales by region as a bar chart")'
                : 'Ask a question about the current chart (e.g., "What trends do you see?")'
            }
            className="min-h-[100px]"
            disabled={isProcessing}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!prompt.trim() || isProcessing}
              className="w-fit"
            >
              {isProcessing ? (
                <>
                  <MessageCircle className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {activeTab === 'create' ? 'Create Chart' : 'Explain Chart'}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
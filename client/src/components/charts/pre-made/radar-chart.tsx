
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PreMadeRadarChartProps {
  data: any[];
  dataKey: string;
  angleKey: string;
}

export function PreMadeRadarChart({ data, dataKey, angleKey }: PreMadeRadarChartProps) {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/ai/generate-chart-insight', { chartType: 'radar', chartData: data });
    },
    onSuccess: (data: any) => {
      toast({
        title: "AI Insight",
        description: data.insight,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate insight",
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={angleKey} />
          <PolarRadiusAxis />
          <Radar name="Mike" dataKey={dataKey} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Generating...' : 'Get Insights'}
        </Button>
      </div>
    </div>
  );
}

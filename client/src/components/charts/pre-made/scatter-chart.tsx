
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PreMadeScatterChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
}

export function PreMadeScatterChart({ data, xAxisKey, yAxisKey }: PreMadeScatterChartProps) {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/ai/generate-chart-insight', { chartType: 'scatter', chartData: data });
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
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="number" dataKey={xAxisKey} name={xAxisKey} />
          <YAxis type="number" dataKey={yAxisKey} name={yAxisKey} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="A school" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Generating...' : 'Get Insights'}
        </Button>
      </div>
    </div>
  );
}

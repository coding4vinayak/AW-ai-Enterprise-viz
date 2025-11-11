
import { FunnelChart, Funnel, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PreMadeFunnelChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
}

export function PreMadeFunnelChart({ data, dataKey, nameKey }: PreMadeFunnelChartProps) {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/ai/generate-chart-insight', { chartType: 'funnel', chartData: data });
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
        <FunnelChart>
          <Tooltip />
          <Funnel
            dataKey={dataKey}
            data={data}
            isAnimationActive
          >
            <LabelList position="right" fill="#000" stroke="none" dataKey={nameKey} />
          </Funnel>
          <Legend />
        </FunnelChart>
      </ResponsiveContainer>
      <div className="mt-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Generating...' : 'Get Insights'}
        </Button>
      </div>
    </div>
  );
}

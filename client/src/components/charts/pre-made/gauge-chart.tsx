
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PreMadeGaugeChartProps {
  value: number;
  maxValue: number;
}

const COLORS = ['#0088FE', '#E0E0E0'];

export function PreMadeGaugeChart({ value, maxValue }: PreMadeGaugeChartProps) {
  const { toast } = useToast();

  const data = [
    { name: 'Value', value },
    { name: 'Remaining', value: maxValue - value },
  ];

  const mutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/ai/generate-chart-insight', { chartType: 'gauge', chartData: data });
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Generating...' : 'Get Insights'}
        </Button>
      </div>
    </div>
  );
}

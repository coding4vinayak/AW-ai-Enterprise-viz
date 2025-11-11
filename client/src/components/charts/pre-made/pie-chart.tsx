
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PreMadePieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#84cc16', '#14b8a6', '#a855f7'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-lg shadow-lg">
        <p className="label">{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export function PreMadePieChart({ data, dataKey, nameKey }: PreMadePieChartProps) {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/ai/generate-chart-insight', { chartType: 'pie', chartData: data });
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
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
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

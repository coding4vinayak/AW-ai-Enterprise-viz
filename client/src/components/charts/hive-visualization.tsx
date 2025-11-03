import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Download } from 'lucide-react';

interface HiveVisualizationProps {
  data: any[];
  customerIdField: string;
  dateField: string;
  valueField: string;
}

export function HiveVisualization({ data, customerIdField, dateField, valueField }: HiveVisualizationProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [groupByField, setGroupByField] = useState('customerId');

  // Process data into hive format
  useEffect(() => {
    if (!data || data.length === 0 || !customerIdField || !dateField || !valueField) {
      setChartData([]);
      return;
    }

    try {
      // Group data by customer ID
      const groupedData: Record<string, any[]> = {};
      
      data.forEach(row => {
        const id = row[customerIdField];
        if (!groupedData[id]) {
          groupedData[id] = [];
        }
        groupedData[id].push(row);
      });

      // Calculate summary statistics for each customer
      const processedData = Object.entries(groupedData).map(([id, customerData]) => {
        const values = customerData.map(d => parseFloat(d[valueField]) || 0);
        const dates = customerData.map(d => d[dateField]);
        
        return {
          id,
          totalValue: values.reduce((sum, val) => sum + val, 0),
          avgValue: values.reduce((sum, val) => sum + val, 0) / values.length,
          transactionCount: values.length,
          firstDate: dates[0],
          lastDate: dates[dates.length - 1],
          dateRange: dates.length > 0 ? new Date(dates[dates.length - 1]).getTime() - new Date(dates[0]).getTime() : 0
        };
      });

      // Normalize data for visualization
      const maxValue = Math.max(...processedData.map(d => d.totalValue), 1);
      const maxTransactions = Math.max(...processedData.map(d => d.transactionCount), 1);
      
      const normalizedData = processedData.map(item => ({
        ...item,
        normalizedValue: (item.totalValue / maxValue) * 100,
        normalizedTransactions: (item.transactionCount / maxTransactions) * 100
      }));

      setChartData(normalizedData);
    } catch (error) {
      console.error('Error processing hive data:', error);
      setChartData([]);
    }
  }, [data, customerIdField, dateField, valueField, groupByField]);

  const handleRefresh = () => {
    // Re-trigger data processing
  };

  const handleExport = () => {
    // Export functionality would go here
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hive Data Visualization</CardTitle>
        <div className="flex gap-2">
          <Select value={groupByField} onValueChange={setGroupByField}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customerId">Customer ID</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="value">Value</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis 
                  type="number" 
                  dataKey="normalizedValue" 
                  name="Total Value" 
                  label={{ value: 'Total Value (Normalized)', position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="normalizedTransactions" 
                  name="Transaction Count" 
                  label={{ value: 'Transaction Count (Normalized)', angle: -90, position: 'insideLeft' }} 
                />
                <ZAxis type="number" dataKey="avgValue" range={[100, 500]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  formatter={(value, name) => {
                    if (name === 'normalizedValue') return [`${(value as number).toFixed(2)}%`, 'Total Value'];
                    if (name === 'normalizedTransactions') return [`${(value as number).toFixed(2)}%`, 'Transaction Count'];
                    if (name === 'avgValue') return [`${(value as number).toFixed(2)}`, 'Average Value'];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
                <Legend />
                <Scatter name="Customers" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${(entry.normalizedValue + entry.normalizedTransactions) % 360}, 70%, 50%)`} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center">
                {data.length === 0 
                  ? 'Please configure fields to visualize customer hive data' 
                  : 'No data available for visualization'}
              </p>
            </div>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Top Customers by Value</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {chartData
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .slice(0, 5)
                    .map((customer, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{customer.id}</span>
                        <Badge variant="default">${customer.totalValue.toFixed(2)}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Customer Activity</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {chartData
                    .sort((a, b) => b.transactionCount - a.transactionCount)
                    .slice(0, 5)
                    .map((customer, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{customer.id}</span>
                        <Badge variant="secondary">{customer.transactionCount} transactions</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Customer Segments</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Value</span>
                    <Badge variant="default">{chartData.filter(c => c.totalValue > (Math.max(...chartData.map(d => d.totalValue)) * 0.7)).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Value</span>
                    <Badge variant="secondary">{chartData.filter(c => c.totalValue <= (Math.max(...chartData.map(d => d.totalValue)) * 0.7) && c.totalValue > (Math.max(...chartData.map(d => d.totalValue)) * 0.3)).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Value</span>
                    <Badge variant="outline">{chartData.filter(c => c.totalValue <= (Math.max(...chartData.map(d => d.totalValue)) * 0.3)).length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
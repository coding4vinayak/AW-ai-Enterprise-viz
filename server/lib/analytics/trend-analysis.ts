
export interface TrendAnalysisResult {
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  confidence: number;
  predictions: Array<{ x: any; y: number }>;
  changeRate: number;
}

export class TrendAnalyzer {
  static analyzeTrend(data: any[], xField: string, yField: string): TrendAnalysisResult {
    const points = data.map((row, idx) => ({
      x: idx,
      y: Number(row[yField]) || 0
    }));

    const { slope, intercept } = this.linearRegression(points);
    const predictions = this.generatePredictions(points, slope, intercept, 5);
    
    return {
      trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      slope,
      confidence: this.calculateRSquared(points, slope, intercept),
      predictions,
      changeRate: this.calculateChangeRate(points)
    };
  }

  private static linearRegression(points: Array<{ x: number; y: number }>) {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + (p.x * p.y), 0);
    const sumX2 = points.reduce((sum, p) => sum + (p.x * p.x), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private static calculateRSquared(
    points: Array<{ x: number; y: number }>,
    slope: number,
    intercept: number
  ): number {
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    
    const totalSS = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
    const residualSS = points.reduce((sum, p) => {
      const predicted = slope * p.x + intercept;
      return sum + Math.pow(p.y - predicted, 2);
    }, 0);

    return 1 - (residualSS / totalSS);
  }

  private static generatePredictions(
    points: Array<{ x: number; y: number }>,
    slope: number,
    intercept: number,
    count: number
  ) {
    const lastX = points[points.length - 1].x;
    const predictions = [];

    for (let i = 1; i <= count; i++) {
      const x = lastX + i;
      const y = slope * x + intercept;
      predictions.push({ x, y: Math.max(0, y) });
    }

    return predictions;
  }

  private static calculateChangeRate(points: Array<{ x: number; y: number }>): number {
    if (points.length < 2) return 0;
    
    const first = points[0].y;
    const last = points[points.length - 1].y;
    
    return first !== 0 ? ((last - first) / first) * 100 : 0;
  }
}

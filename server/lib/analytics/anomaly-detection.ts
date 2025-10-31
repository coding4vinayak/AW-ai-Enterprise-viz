
export interface Anomaly {
  index: number;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

export class AnomalyDetector {
  static detectAnomalies(data: any[], field: string, sensitivity: number = 2): Anomaly[] {
    const values = data.map(row => Number(row[field]) || 0);
    const { mean, stdDev } = this.calculateStats(values);
    
    const anomalies: Anomaly[] = [];
    
    values.forEach((value, index) => {
      const deviation = Math.abs(value - mean) / stdDev;
      
      if (deviation > sensitivity) {
        anomalies.push({
          index,
          value,
          expected: mean,
          deviation,
          severity: deviation > sensitivity * 2 ? 'high' : deviation > sensitivity * 1.5 ? 'medium' : 'low'
        });
      }
    });
    
    return anomalies;
  }

  private static calculateStats(values: number[]) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, stdDev, variance };
  }

  static detectSeasonality(data: any[], field: string): {
    hasSeasonality: boolean;
    period?: number;
    strength?: number;
  } {
    const values = data.map(row => Number(row[field]) || 0);
    
    // Simple autocorrelation check
    const maxLag = Math.min(Math.floor(values.length / 2), 30);
    let maxCorr = 0;
    let bestPeriod = 0;
    
    for (let lag = 2; lag <= maxLag; lag++) {
      const corr = this.autocorrelation(values, lag);
      if (corr > maxCorr) {
        maxCorr = corr;
        bestPeriod = lag;
      }
    }
    
    return {
      hasSeasonality: maxCorr > 0.5,
      period: bestPeriod,
      strength: maxCorr
    };
  }

  private static autocorrelation(values: number[], lag: number): number {
    const n = values.length - lag;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }
    
    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }
    
    return numerator / denominator;
  }
}

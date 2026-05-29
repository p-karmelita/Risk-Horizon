import type { AgentPerformanceMetrics, LiveModeContext } from "@/lib/types";

export class PerformanceTracker {
  private metrics: AgentPerformanceMetrics[] = [];
  private startTime: number = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.metrics = [];
    this.startTime = Date.now();
  }

  addMetric(metric: AgentPerformanceMetrics) {
    this.metrics.push(metric);
  }

  getMetrics(): AgentPerformanceMetrics[] {
    return [...this.metrics];
  }

  getSummary(): LiveModeContext {
    const totalDuration = Date.now() - this.startTime;
    const successfulMetrics = this.metrics.filter(m => m.success);
    // Each real Bright Data HTTP request logs a metric carrying details.zone;
    // wrapper/aggregation metrics do not, so this counts actual API calls only.
    const apiCallsCount = this.metrics.filter(m => Boolean(m.details?.zone)).length;

    return {
      enabled: true,
      metrics: this.metrics,
      totalDuration,
      apiCallsCount,
      successRate: this.metrics.length > 0 
        ? (successfulMetrics.length / this.metrics.length) * 100 
        : 0
    };
  }

  logSummary() {
    const summary = this.getSummary();
    console.log("\n=== Agent Performance Summary ===");
    console.log(`Total Duration: ${summary.totalDuration}ms`);
    console.log(`API Calls: ${summary.apiCallsCount}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(1)}%`);
    console.log(`Total Stages: ${summary.metrics.length}`);
    
    console.log("\nStage Breakdown:");
    summary.metrics.forEach(metric => {
      const status = metric.success ? "✓" : "✗";
      const duration = metric.duration ? `${metric.duration}ms` : "N/A";
      console.log(`  ${status} ${metric.stage}: ${duration}`);
      if (metric.error) {
        console.log(`    Error: ${metric.error}`);
      }
    });
    console.log("================================\n");
  }

  getStageMetrics(stageName: string): AgentPerformanceMetrics | undefined {
    return this.metrics.find(m => m.stage === stageName);
  }

  getAverageDuration(): number {
    const metricsWithDuration = this.metrics.filter(m => m.duration !== undefined);
    if (metricsWithDuration.length === 0) return 0;
    
    const total = metricsWithDuration.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metricsWithDuration.length;
  }

  getFailedStages(): AgentPerformanceMetrics[] {
    return this.metrics.filter(m => !m.success);
  }

  exportMetrics(): string {
    return JSON.stringify({
      summary: this.getSummary(),
      detailedMetrics: this.metrics
    }, null, 2);
  }
}

// Global tracker instance for the current request
let globalTracker: PerformanceTracker | null = null;

export function getGlobalTracker(): PerformanceTracker {
  if (!globalTracker) {
    globalTracker = new PerformanceTracker();
  }
  return globalTracker;
}

export function resetGlobalTracker() {
  globalTracker = new PerformanceTracker();
  return globalTracker;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

export function formatMetricForDisplay(metric: AgentPerformanceMetrics): string {
  const status = metric.success ? "✓" : "✗";
  const duration = metric.duration ? formatDuration(metric.duration) : "pending";
  let output = `${status} ${metric.stage} (${duration})`;
  
  if (metric.details) {
    const details = Object.entries(metric.details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    output += `\n  Details: ${details}`;
  }
  
  if (metric.error) {
    output += `\n  Error: ${metric.error}`;
  }
  
  return output;
}

// Made with Bob

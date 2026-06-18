export class PerformanceMonitor {
  private static metrics: Record<string, number[]> = {};
  private static memoryLogs: NodeJS.MemoryUsage[] = [];

  /**
   * Tracks the execution time of an asynchronous function.
   * @param label The identifier for the metric.
   * @param fn The function to execute and measure.
   */
  public static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = process.hrtime.bigint();
    try {
      const result = await fn();
      return result;
    } finally {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6; // Convert nanoseconds to milliseconds

      if (!this.metrics[label]) {
        this.metrics[label] = [];
      }
      this.metrics[label].push(durationMs);

      // Log for immediate visibility
      console.log(`[PERF] ${label} executed in ${durationMs.toFixed(2)} ms`);
    }
  }

  /**
   * Records a snapshot of the current process memory usage.
   */
  public static snapshotMemory(): void {
    const usage = process.memoryUsage();
    this.memoryLogs.push(usage);
    console.log(`[MEMORY] Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB / Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  }

  /**
   * Returns average duration for all recorded metrics.
   */
  public static getAverages(): Record<string, string> {
    const averages: Record<string, string> = {};
    for (const [label, durations] of Object.entries(this.metrics)) {
      if (durations.length === 0) continue;
      const sum = durations.reduce((a, b) => a + b, 0);
      averages[label] = (sum / durations.length).toFixed(2) + ' ms';
    }
    return averages;
  }

  /**
   * Resets all internal tracking. Useful between test suites or batch jobs.
   */
  public static clear(): void {
    this.metrics = {};
    this.memoryLogs = [];
  }
}

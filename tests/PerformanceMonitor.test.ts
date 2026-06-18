import { PerformanceMonitor } from '../src/utils/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    PerformanceMonitor.clear();
  });

  it('should measure the execution time of an asynchronous block', async () => {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const result = await PerformanceMonitor.measure('test-timer', async () => {
      await delay(50);
      return 'success';
    });

    expect(result).toBe('success');

    const averages = PerformanceMonitor.getAverages();
    expect(averages['test-timer']).toBeDefined();

    // We expect the timer to be roughly 50ms (giving a safe buffer of 10-150ms for jest environments)
    const avgStr = averages['test-timer'] || '0 ms';
    const avgValue = parseFloat(avgStr.split(' ')[0] as string);
    expect(avgValue).toBeGreaterThanOrEqual(10);
    expect(avgValue).toBeLessThanOrEqual(200);
  });

  it('should successfully record memory snapshots without crashing', () => {
    expect(() => {
      PerformanceMonitor.snapshotMemory();
    }).not.toThrow();
  });
});

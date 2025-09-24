// tests/performance.test.mjs

import {
  parallelProcess,
  MemoryCache,
  TaskQueue,
  PerformanceMonitor
} from '../src/utils/performance.mjs';

describe('Performance Utils', () => {
  describe('parallelProcess', () => {
    test('processes items in parallel with concurrency control', async () => {
      const items = Array.from({ length: 10 }, (_, i) => i);
      const processor = async (item) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return item * 2;
      };

      const startTime = Date.now();
      const result = await parallelProcess(items, processor, {
        concurrency: 3,
        onProgress: jest.fn()
      });
      const duration = Date.now() - startTime;

      expect(result.processed).toBe(10);
      expect(result.successCount).toBe(10);
      expect(result.errorCount).toBe(0);
      expect(result.results.every(r => r.success)).toBe(true);

      // Should be faster than sequential (10 * 50ms = 500ms)
      // With concurrency 3, should take roughly 4 batches * 50ms = ~200ms
      expect(duration).toBeLessThan(400);
    }, 10000);

    test('handles errors according to error strategy', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = async (item) => {
        if (item === 3) throw new Error('Test error');
        return item * 2;
      };

      // Test continue strategy
      const result = await parallelProcess(items, processor, {
        concurrency: 2,
        onError: 'continue'
      });

      expect(result.processed).toBe(5);
      expect(result.successCount).toBe(4);
      expect(result.errorCount).toBe(1);
    });

    test('collects errors when configured', async () => {
      const items = [1, 2, 3];
      const processor = async (item) => {
        if (item === 2) throw new Error('Test error');
        return item;
      };

      const result = await parallelProcess(items, processor, {
        onError: 'collect'
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].item).toBe(2);
      expect(result.errors[0].error.message).toBe('Test error');
    });

    test('calls progress callback', async () => {
      const items = [1, 2, 3];
      const processor = async (item) => item;
      const onProgress = jest.fn();

      await parallelProcess(items, processor, { onProgress });

      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          processed: expect.any(Number),
          total: 3,
          percentage: expect.any(Number)
        })
      );
    });
  });

  describe('MemoryCache', () => {
    let cache;

    beforeEach(() => {
      cache = new MemoryCache({ maxSize: 3, defaultTTL: 100 });
    });

    afterEach(() => {
      cache.clear();
    });

    test('stores and retrieves values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      expect(cache.has('key1')).toBe(true);
    });

    test('returns undefined for missing keys', () => {
      expect(cache.get('missing')).toBeUndefined();
      expect(cache.has('missing')).toBe(false);
    });

    test('respects TTL', async () => {
      cache.set('key1', 'value1', 50); // 50ms TTL

      expect(cache.get('key1')).toBe('value1');

      await new Promise(resolve => setTimeout(resolve, 70));

      expect(cache.get('key1')).toBeUndefined();
    }, 1000);

    test('evicts LRU when at max size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key1 to make it recently used
      cache.get('key1');

      // Add key4, should evict key2 (least recently used)
      cache.set('key4', 'value4');

      expect(cache.has('key1')).toBe(true);  // Recently accessed
      expect(cache.has('key2')).toBe(false); // Should be evicted
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });

    test('tracks statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('missing'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.sets).toBe(1);
      expect(stats.size).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    test('can delete entries', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);

      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });

    test('clears all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.getStats().size).toBe(0);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('TaskQueue', () => {
    let queue;

    beforeEach(() => {
      queue = new TaskQueue({ concurrency: 2 });
    });

    afterEach(() => {
      queue.clear();
    });

    test('processes tasks with concurrency limit', async () => {
      const results = [];
      const tasks = [];

      for (let i = 0; i < 5; i++) {
        const taskPromise = new Promise((resolve) => {
          queue.add(
            async () => {
              await new Promise(r => setTimeout(r, 50));
              return i;
            },
            {
              onComplete: (result) => {
                results.push(result);
                resolve(result);
              }
            }
          );
        });
        tasks.push(taskPromise);
      }

      await Promise.all(tasks);

      expect(results).toHaveLength(5);
      expect(results.sort()).toEqual([0, 1, 2, 3, 4]);
    }, 10000);

    test('respects task priority', async () => {
      const results = [];

      // Add low priority task first
      queue.add(
        async () => 'low',
        {
          priority: 1,
          onComplete: (result) => results.push(result)
        }
      );

      // Add high priority task
      queue.add(
        async () => 'high',
        {
          priority: 10,
          onComplete: (result) => results.push(result)
        }
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // High priority should be processed first
      expect(results[0]).toBe('high');
    });

    test('handles task failures', async () => {
      let errorCaught = false;

      const taskPromise = new Promise((resolve) => {
        queue.add(
          async () => {
            throw new Error('Task failed');
          },
          {
            onError: (error) => {
              errorCaught = true;
              expect(error.message).toBe('Task failed');
              resolve();
            }
          }
        );
      });

      await taskPromise;
      expect(errorCaught).toBe(true);
    });

    test('retries failed tasks', async () => {
      let attempts = 0;
      let success = false;

      const taskPromise = new Promise((resolve) => {
        queue.add(
          async () => {
            attempts++;
            if (attempts < 3) {
              throw new Error('Not yet');
            }
            return 'success';
          },
          {
            retries: 2,
            onComplete: (result) => {
              success = true;
              expect(result).toBe('success');
              resolve();
            }
          }
        );
      });

      await taskPromise;
      expect(attempts).toBe(3);
      expect(success).toBe(true);
    }, 5000);

    test('respects task timeout', async () => {
      let timedOut = false;

      const taskPromise = new Promise((resolve) => {
        queue.add(
          async () => {
            await new Promise(r => setTimeout(r, 200)); // Long running task
            return 'completed';
          },
          {
            timeout: 50, // Short timeout
            onError: (error) => {
              timedOut = true;
              expect(error.message).toContain('timeout');
              resolve();
            }
          }
        );
      });

      await taskPromise;
      expect(timedOut).toBe(true);
    }, 1000);

    test('can be paused and resumed', async () => {
      let processed = 0;

      queue.add(async () => { processed++; });
      queue.pause();

      // Add more tasks while paused
      queue.add(async () => { processed++; });
      queue.add(async () => { processed++; });

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(processed).toBe(1); // Only first task processed before pause

      queue.resume();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(processed).toBe(3); // All tasks processed after resume
    });

    test('tracks statistics', async () => {
      const tasks = [];

      // Add successful task
      tasks.push(new Promise(resolve => {
        queue.add(async () => 'success', {
          onComplete: () => resolve()
        });
      }));

      // Add failing task
      tasks.push(new Promise(resolve => {
        queue.add(async () => { throw new Error('fail'); }, {
          onError: () => resolve()
        });
      }));

      await Promise.all(tasks);

      const stats = queue.getStats();
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.totalProcessed).toBe(2);
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    afterEach(() => {
      monitor.stopAllIntervals();
    });

    test('measures timing', () => {
      monitor.startTimer('test');

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) { /* busy wait */ }

      const duration = monitor.endTimer('test');

      expect(duration).toBeGreaterThan(5);
      expect(duration).toBeLessThan(50);

      const metric = monitor.getMetric('test');
      expect(metric.duration).toBe(duration);
    });

    test('measures async functions', async () => {
      const asyncFunc = monitor.measureAsync('async-test', async (delay) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return 'result';
      });

      const result = await asyncFunc(20);

      expect(result).toBe('result');
      const metric = monitor.getMetric('async-test');
      expect(metric.duration).toBeGreaterThan(15);
      expect(metric.duration).toBeLessThan(50);
    });

    test('handles missing timer gracefully', () => {
      const duration = monitor.endTimer('nonexistent');
      expect(duration).toBeNull();
    });

    test('returns all metrics', () => {
      monitor.startTimer('test1');
      monitor.endTimer('test1');
      monitor.startTimer('test2');
      monitor.endTimer('test2');

      const metrics = monitor.getAllMetrics();
      expect(Object.keys(metrics)).toContain('test1');
      expect(Object.keys(metrics)).toContain('test2');
      expect(metrics.test1.duration).toBeDefined();
    });

    test('manages intervals', async () => {
      let callCount = 0;
      const callback = () => { callCount++; };

      monitor.startInterval('test-interval', callback, 10);

      await new Promise(resolve => setTimeout(resolve, 35));

      monitor.stopInterval('test-interval');

      expect(callCount).toBeGreaterThanOrEqual(2);
      expect(callCount).toBeLessThanOrEqual(4);
    });
  });
});
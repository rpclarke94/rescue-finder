// src/utils/performance.mjs

import { logger } from './logger.mjs';
import { retryWithBackoff } from './errorHandling.mjs';

/**
 * Process items in parallel with concurrency control
 */
export async function parallelProcess(items, processor, options = {}) {
  const {
    concurrency = 5,
    batchSize = 1,
    onProgress = null,
    onError = 'continue' // 'continue', 'fail-fast', 'collect'
  } = options;

  const results = [];
  const errors = [];
  let processed = 0;

  // Process items in batches with concurrency control
  for (let i = 0; i < items.length; i += concurrency * batchSize) {
    const batch = items.slice(i, i + concurrency * batchSize);
    const chunks = [];

    // Split batch into chunks for parallel processing
    for (let j = 0; j < batch.length; j += batchSize) {
      chunks.push(batch.slice(j, j + batchSize));
    }

    // Process chunks in parallel
    const chunkPromises = chunks.map(async (chunk, chunkIndex) => {
      try {
        const chunkResults = [];
        for (const item of chunk) {
          try {
            const result = await processor(item);
            chunkResults.push({ success: true, result, item });
            processed++;

            if (onProgress) {
              onProgress({
                processed,
                total: items.length,
                percentage: Math.round((processed / items.length) * 100),
                item
              });
            }
          } catch (error) {
            const errorInfo = { success: false, error, item };

            if (onError === 'fail-fast') {
              throw error;
            } else if (onError === 'collect') {
              errors.push(errorInfo);
            }

            chunkResults.push(errorInfo);
            processed++;
          }
        }
        return chunkResults;
      } catch (error) {
        logger.error('Chunk processing failed', {
          chunkIndex,
          chunkSize: chunk.length,
          error: error.message,
          type: 'parallel_processing_error'
        });
        throw error;
      }
    });

    try {
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults.flat());
    } catch (error) {
      if (onError === 'fail-fast') {
        throw error;
      }
      logger.warn('Some chunks failed but continuing', {
        error: error.message,
        type: 'parallel_processing_warning'
      });
    }
  }

  return {
    results,
    errors,
    processed,
    total: items.length,
    successCount: results.filter(r => r.success).length,
    errorCount: results.filter(r => !r.success).length
  };
}

/**
 * Cache with TTL support
 */
export class MemoryCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 60 * 60 * 1000; // 1 hour
    this.cache = new Map();
    this.timers = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
  }

  set(key, value, ttl = this.defaultTTL) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Evict if at max size and key doesn't exist
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    });

    // Set TTL timer
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }

    this.stats.sets++;

    logger.debug('Cache set', {
      key,
      size: this.cache.size,
      ttl,
      type: 'cache_operation'
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Update access info for LRU
    entry.accessCount++;
    entry.lastAccess = Date.now();

    this.stats.hits++;
    return entry.value;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    const existed = this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    if (existed) {
      this.stats.deletes++;
    }
    return existed;
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const lastAccess = entry.lastAccess || entry.timestamp;
      if (lastAccess < oldestTime) {
        oldestTime = lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
      logger.debug('Cache eviction', {
        key: oldestKey,
        size: this.cache.size,
        type: 'cache_eviction'
      });
    }
  }

  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;
    return {
      ...this.stats,
      hitRate: isNaN(hitRate) ? 0 : hitRate,
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

/**
 * Background task queue with priority support
 */
export class TaskQueue {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 3;
    this.running = 0;
    this.queue = [];
    this.paused = false;
    this.stats = {
      completed: 0,
      failed: 0,
      queued: 0
    };
  }

  add(task, options = {}) {
    const {
      priority = 0,
      retries = 0,
      timeout = 30000,
      onComplete = null,
      onError = null
    } = options;

    const queueItem = {
      task,
      priority,
      retries,
      timeout,
      onComplete,
      onError,
      id: Math.random().toString(36).substr(2, 9),
      attempts: 0,
      createdAt: Date.now()
    };

    // Insert based on priority (higher priority first)
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].priority < priority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, queueItem);
    this.stats.queued++;

    logger.debug('Task queued', {
      taskId: queueItem.id,
      priority,
      queueLength: this.queue.length,
      type: 'task_queue'
    });

    this.process();
    return queueItem.id;
  }

  async process() {
    if (this.paused || this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    this.running++;

    const startTime = Date.now();

    try {
      const result = await retryWithBackoff(
        () => this.executeWithTimeout(item.task, item.timeout),
        {
          maxAttempts: item.retries + 1,
          baseDelay: 1000,
          onRetry: (error, attempt) => {
            logger.warn('Task retry', {
              taskId: item.id,
              attempt,
              error: error.message,
              type: 'task_retry'
            });
          }
        }
      );

      const duration = Date.now() - startTime;
      this.stats.completed++;

      logger.debug('Task completed', {
        taskId: item.id,
        duration,
        type: 'task_completed'
      });

      if (item.onComplete) {
        item.onComplete(result);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.stats.failed++;

      logger.error('Task failed', {
        taskId: item.id,
        duration,
        error: error.message,
        type: 'task_failed'
      });

      if (item.onError) {
        item.onError(error);
      }
    } finally {
      this.running--;
      // Continue processing if there are more tasks
      if (this.queue.length > 0) {
        setImmediate(() => this.process());
      }
    }
  }

  async executeWithTimeout(task, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task timeout after ${timeout}ms`));
      }, timeout);

      Promise.resolve(task())
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  pause() {
    this.paused = true;
    logger.info('Task queue paused');
  }

  resume() {
    this.paused = false;
    logger.info('Task queue resumed');
    this.process();
  }

  getStats() {
    return {
      ...this.stats,
      running: this.running,
      queued: this.queue.length,
      totalProcessed: this.stats.completed + this.stats.failed
    };
  }

  clear() {
    this.queue = [];
    this.stats.queued = 0;
    logger.info('Task queue cleared');
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.intervals = new Map();
  }

  startTimer(name) {
    this.metrics.set(name, {
      start: process.hrtime.bigint(),
      end: null,
      duration: null
    });
  }

  endTimer(name) {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn('Timer not found', { name, type: 'performance_warning' });
      return null;
    }

    metric.end = process.hrtime.bigint();
    metric.duration = Number(metric.end - metric.start) / 1000000; // Convert to ms

    logger.debug('Performance metric', {
      name,
      duration: metric.duration,
      type: 'performance_metric'
    });

    return metric.duration;
  }

  measureAsync(name, asyncFunction) {
    return async (...args) => {
      this.startTimer(name);
      try {
        const result = await asyncFunction(...args);
        return result;
      } finally {
        this.endTimer(name);
      }
    };
  }

  getMetric(name) {
    return this.metrics.get(name);
  }

  getAllMetrics() {
    const results = {};
    for (const [name, metric] of this.metrics.entries()) {
      results[name] = {
        duration: metric.duration,
        start: metric.start,
        end: metric.end
      };
    }
    return results;
  }

  startInterval(name, callback, intervalMs = 1000) {
    const interval = setInterval(callback, intervalMs);
    this.intervals.set(name, interval);
    logger.debug('Performance interval started', { name, intervalMs });
  }

  stopInterval(name) {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
      logger.debug('Performance interval stopped', { name });
    }
  }

  stopAllIntervals() {
    for (const [name, interval] of this.intervals.entries()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    logger.debug('All performance intervals stopped');
  }
}

// Export singleton instances
export const globalCache = new MemoryCache({ maxSize: 5000, defaultTTL: 30 * 60 * 1000 }); // 30 min TTL
export const taskQueue = new TaskQueue({ concurrency: 5 });
export const performanceMonitor = new PerformanceMonitor();
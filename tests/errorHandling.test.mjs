// tests/errorHandling.test.mjs

import {
  ETLError,
  ValidationError,
  APIError,
  DatabaseError,
  retryWithBackoff,
  RateLimiter,
  CircuitBreaker,
  withErrorBoundary
} from '../src/utils/errorHandling.mjs';

describe('Error Handling Utils', () => {
  describe('ETL Error Classes', () => {
    test('ETLError creates proper error', () => {
      const error = new ETLError('Test message', 'TEST_CODE', { detail: 'test' });
      expect(error.name).toBe('ETLError');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details.detail).toBe('test');
      expect(error.timestamp).toBeDefined();
    });

    test('ValidationError extends ETLError', () => {
      const errors = [{ field: 'name', message: 'Required' }];
      const error = new ValidationError('Validation failed', errors);
      expect(error instanceof ETLError).toBe(true);
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(errors);
    });

    test('APIError extends ETLError', () => {
      const error = new APIError('API failed', 'TestAPI', 500);
      expect(error instanceof ETLError).toBe(true);
      expect(error.name).toBe('APIError');
      expect(error.service).toBe('TestAPI');
      expect(error.status).toBe(500);
    });

    test('DatabaseError extends ETLError', () => {
      const error = new DatabaseError('DB failed', 'insert');
      expect(error instanceof ETLError).toBe(true);
      expect(error.name).toBe('DatabaseError');
      expect(error.operation).toBe('insert');
    });
  });

  describe('retryWithBackoff', () => {
    test('succeeds on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('retries on failure and eventually succeeds', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(fn, { maxAttempts: 3, baseDelay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('throws after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('persistent failure'));

      await expect(retryWithBackoff(fn, { maxAttempts: 2, baseDelay: 10 }))
        .rejects.toThrow('persistent failure');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('respects retry condition', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('do not retry'));
      const retryCondition = (error) => !error.message.includes('do not retry');

      await expect(retryWithBackoff(fn, { retryCondition, baseDelay: 10 }))
        .rejects.toThrow('do not retry');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('calls onRetry callback', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      const onRetry = jest.fn();

      await retryWithBackoff(fn, { onRetry, baseDelay: 10 });
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
    });
  });

  describe('RateLimiter', () => {
    test('allows requests within limit', async () => {
      const limiter = new RateLimiter(10, 5); // 10 req/sec, burst of 5

      const start = Date.now();
      await Promise.all([
        limiter.acquire(),
        limiter.acquire(),
        limiter.acquire()
      ]);
      const elapsed = Date.now() - start;

      // Should be nearly instant for first 3 requests
      expect(elapsed).toBeLessThan(100);
    });

    test('throttles requests beyond burst limit', async () => {
      const limiter = new RateLimiter(2, 2); // 2 req/sec, burst of 2

      const times = [];
      for (let i = 0; i < 4; i++) {
        const start = Date.now();
        await limiter.acquire();
        times.push(Date.now() - start);
      }

      // First 2 should be fast, next 2 should be throttled
      expect(times[0]).toBeLessThan(50);
      expect(times[1]).toBeLessThan(50);
      expect(times[2]).toBeGreaterThan(400); // ~500ms delay
    }, 10000);
  });

  describe('CircuitBreaker', () => {
    test('allows requests when closed', async () => {
      const breaker = new CircuitBreaker({ threshold: 3 });
      const fn = jest.fn().mockResolvedValue('success');

      const result = await breaker.execute(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('opens after threshold failures', async () => {
      const breaker = new CircuitBreaker({ threshold: 2, timeout: 100 });
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      // First two failures
      await expect(breaker.execute(fn)).rejects.toThrow('fail');
      await expect(breaker.execute(fn)).rejects.toThrow('fail');

      // Third attempt should be rejected by circuit breaker
      await expect(breaker.execute(fn))
        .rejects.toThrow('Circuit breaker is OPEN');

      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('transitions to half-open after timeout', async () => {
      const breaker = new CircuitBreaker({ threshold: 1, timeout: 50 });
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      // Trigger circuit breaker
      await expect(breaker.execute(fn)).rejects.toThrow('fail');

      // Should be open
      await expect(breaker.execute(fn))
        .rejects.toThrow('Circuit breaker is OPEN');

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 60));

      // Should now allow request (half-open)
      const result = await breaker.execute(fn);
      expect(result).toBe('success');
    }, 1000);
  });

  describe('withErrorBoundary', () => {
    test('returns result on success', async () => {
      const operation = async () => 'success';
      const result = await withErrorBoundary(operation);
      expect(result).toBe('success');
    });

    test('wraps non-ETL errors', async () => {
      const operation = async () => {
        throw new Error('regular error');
      };

      await expect(withErrorBoundary(operation, { context: 'test' }))
        .rejects.toThrow(ETLError);
    });

    test('preserves ETL errors', async () => {
      const etlError = new ValidationError('validation failed');
      const operation = async () => {
        throw etlError;
      };

      await expect(withErrorBoundary(operation))
        .rejects.toBe(etlError);
    });
  });
});
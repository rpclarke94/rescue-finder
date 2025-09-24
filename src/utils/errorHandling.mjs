// src/utils/errorHandling.mjs

import { logger } from './logger.mjs';

export class ETLError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ETLError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends ETLError {
  constructor(message, errors = [], details = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class APIError extends ETLError {
  constructor(message, service, status, details = {}) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
    this.service = service;
    this.status = status;
  }
}

export class DatabaseError extends ETLError {
  constructor(message, operation, details = {}) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
    this.operation = operation;
  }
}

// Retry utility with exponential backoff
export async function retryWithBackoff(
  fn,
  options = {}
) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryCondition = (error) => true,
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!retryCondition(error) || attempt === maxAttempts) {
        logger.error('Retry failed permanently', {
          attempt,
          maxAttempts,
          error: error.message,
          type: 'retry_failed'
        });
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);

      logger.warn('Operation failed, retrying', {
        attempt,
        maxAttempts,
        delay,
        error: error.message,
        type: 'retry_attempt'
      });

      // Call retry callback if provided
      if (onRetry) {
        await onRetry(error, attempt);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Rate limiter class
export class RateLimiter {
  constructor(requestsPerSecond = 5, burstSize = 10) {
    this.requestsPerSecond = requestsPerSecond;
    this.burstSize = burstSize;
    this.tokens = burstSize;
    this.lastRefill = Date.now();
    this.queue = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  processQueue() {
    this.refillTokens();

    while (this.queue.length > 0 && this.tokens > 0) {
      this.tokens--;
      const resolve = this.queue.shift();
      resolve();
    }

    // Schedule next processing if queue is not empty
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000 / this.requestsPerSecond);
    }
  }

  refillTokens() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timePassed * this.requestsPerSecond);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.burstSize, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
}

// Circuit breaker pattern
export class CircuitBreaker {
  constructor(options = {}) {
    this.threshold = options.threshold || 5; // failure threshold
    this.timeout = options.timeout || 60000; // timeout in ms
    this.monitor = options.monitor || false;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.nextAttempt = Date.now();
    this.successCount = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new ETLError('Circuit breaker is OPEN', 'CIRCUIT_BREAKER_OPEN');
      }
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) { // require 3 successes to close
        this.state = 'CLOSED';
        logger.info('Circuit breaker closed', { type: 'circuit_breaker' });
      }
    }
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      logger.warn('Circuit breaker opened', {
        failureCount: this.failureCount,
        nextAttempt: new Date(this.nextAttempt).toISOString(),
        type: 'circuit_breaker'
      });
    }
  }
}

// Error boundary for async operations
export async function withErrorBoundary(operation, context = {}) {
  try {
    return await operation();
  } catch (error) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      code: error.code || 'UNKNOWN',
      context,
      timestamp: new Date().toISOString()
    };

    // Log error with context
    logger.error('Operation failed in error boundary', errorDetails);

    // Re-throw with additional context if it's not already an ETL error
    if (!(error instanceof ETLError)) {
      throw new ETLError(
        `Operation failed: ${error.message}`,
        'OPERATION_FAILED',
        errorDetails
      );
    }

    throw error;
  }
}

// Graceful shutdown handler
export function setupGracefulShutdown(cleanup) {
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully`, {
      signal,
      type: 'shutdown'
    });

    try {
      if (cleanup) {
        await cleanup();
      }
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack,
      type: 'uncaught_exception'
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      type: 'unhandled_rejection'
    });
    process.exit(1);
  });
}
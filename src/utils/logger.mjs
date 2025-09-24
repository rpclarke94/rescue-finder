// src/utils/logger.mjs

import fs from 'fs';
import path from 'path';

class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'info';
    this.logFile = options.logFile || process.env.LOG_FILE || null;
    this.context = options.context || 'ETL';

    // Log levels (lower number = higher priority)
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    // Ensure log directory exists if logging to file
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  writeLog(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);

    // Console output with colors
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[37m'  // White
    };
    const reset = '\x1b[0m';

    console.log(`${colors[level] || ''}${formattedMessage}${reset}`);

    // File output
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    }
  }

  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  debug(message, meta = {}) {
    this.writeLog('debug', message, meta);
  }

  // Specialized methods for ETL operations
  logProcessingStart(operation, details = {}) {
    this.info(`Starting ${operation}`, {
      operation,
      ...details,
      type: 'processing_start'
    });
  }

  logProcessingEnd(operation, details = {}) {
    this.info(`Completed ${operation}`, {
      operation,
      ...details,
      type: 'processing_end'
    });
  }

  logApiCall(service, endpoint, status, responseTime = null, details = {}) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this.writeLog(level, `API call to ${service}`, {
      service,
      endpoint,
      status,
      responseTime,
      ...details,
      type: 'api_call'
    });
  }

  logValidationError(record, errors, operation = 'validation') {
    this.warn(`Validation failed for ${operation}`, {
      record,
      errors,
      type: 'validation_error'
    });
  }

  logDataQuality(metric, value, threshold = null, details = {}) {
    const level = threshold && value < threshold ? 'warn' : 'info';
    this.writeLog(level, `Data quality metric: ${metric}`, {
      metric,
      value,
      threshold,
      ...details,
      type: 'data_quality'
    });
  }

  // Create child logger with additional context
  child(additionalContext = {}) {
    return new Logger({
      level: this.level,
      logFile: this.logFile,
      context: this.context,
      ...additionalContext
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };
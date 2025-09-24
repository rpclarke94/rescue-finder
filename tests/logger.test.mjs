// tests/logger.test.mjs

import fs from 'fs';
import path from 'path';
import { Logger } from '../src/utils/logger.mjs';

// Mock console methods
const originalLog = console.log;
const originalError = console.error;

describe('Logger', () => {
  let mockLog, mockError, testLogFile, logger;

  beforeEach(() => {
    mockLog = jest.fn();
    mockError = jest.fn();
    console.log = mockLog;
    console.error = mockError;

    testLogFile = path.join(process.cwd(), 'test.log');
    logger = new Logger({ level: 'debug', logFile: testLogFile, context: 'TEST' });

    // Clean up any existing test log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;

    // Clean up test log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('log levels', () => {
    test('respects log level filtering', () => {
      const infoLogger = new Logger({ level: 'info' });

      infoLogger.debug('debug message');
      infoLogger.info('info message');
      infoLogger.warn('warn message');
      infoLogger.error('error message');

      expect(mockLog).toHaveBeenCalledTimes(3); // info, warn, error
    });

    test('logs all levels when set to debug', () => {
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(mockLog).toHaveBeenCalledTimes(4);
    });
  });

  describe('log formatting', () => {
    test('formats messages with JSON structure', () => {
      logger.info('test message', { key: 'value' });

      const logCall = mockLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.replace(/\x1b\[[0-9;]*m/g, '')); // Remove color codes

      expect(logEntry.level).toBe('INFO');
      expect(logEntry.context).toBe('TEST');
      expect(logEntry.message).toBe('test message');
      expect(logEntry.key).toBe('value');
      expect(logEntry.timestamp).toBeDefined();
    });

    test('includes metadata in log entries', () => {
      logger.error('error occurred', {
        operation: 'test',
        duration: 123,
        details: { nested: 'value' }
      });

      const logCall = mockLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.replace(/\x1b\[[0-9;]*m/g, ''));

      expect(logEntry.operation).toBe('test');
      expect(logEntry.duration).toBe(123);
      expect(logEntry.details.nested).toBe('value');
    });
  });

  describe('file logging', () => {
    test('writes logs to file when configured', () => {
      logger.info('file test message');

      expect(fs.existsSync(testLogFile)).toBe(true);
      const fileContent = fs.readFileSync(testLogFile, 'utf8');
      const logEntry = JSON.parse(fileContent.trim());

      expect(logEntry.message).toBe('file test message');
      expect(logEntry.level).toBe('INFO');
    });

    test('appends multiple log entries to file', () => {
      logger.info('first message');
      logger.warn('second message');

      const fileContent = fs.readFileSync(testLogFile, 'utf8');
      const lines = fileContent.trim().split('\n');

      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0]).message).toBe('first message');
      expect(JSON.parse(lines[1]).message).toBe('second message');
    });

    test('handles file write errors gracefully', () => {
      const badLogger = new Logger({ logFile: '/invalid/path/test.log' });

      // Should not throw, but should log error to console
      badLogger.info('test message');

      expect(mockError).toHaveBeenCalled();
    });
  });

  describe('specialized logging methods', () => {
    test('logProcessingStart adds correct metadata', () => {
      logger.logProcessingStart('import', { records: 100 });

      const logCall = mockLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.replace(/\x1b\[[0-9;]*m/g, ''));

      expect(logEntry.message).toBe('Starting import');
      expect(logEntry.operation).toBe('import');
      expect(logEntry.records).toBe(100);
      expect(logEntry.type).toBe('processing_start');
    });

    test('logApiCall adds API-specific metadata', () => {
      logger.logApiCall('OpenAI', '/chat/completions', 200, 1500, { model: 'gpt-4' });

      const logCall = mockLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.replace(/\x1b\[[0-9;]*m/g, ''));

      expect(logEntry.service).toBe('OpenAI');
      expect(logEntry.endpoint).toBe('/chat/completions');
      expect(logEntry.status).toBe(200);
      expect(logEntry.responseTime).toBe(1500);
      expect(logEntry.model).toBe('gpt-4');
      expect(logEntry.type).toBe('api_call');
    });

    test('logValidationError adds validation-specific metadata', () => {
      const errors = [{ field: 'name', message: 'Required' }];
      logger.logValidationError({ id: 'test' }, errors);

      const logCall = mockLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.replace(/\x1b\[[0-9;]*m/g, ''));

      expect(logEntry.level).toBe('WARN');
      expect(logEntry.record.id).toBe('test');
      expect(logEntry.errors).toEqual(errors);
      expect(logEntry.type).toBe('validation_error');
    });

    test('logDataQuality logs with appropriate level based on threshold', () => {
      // Value below threshold should warn
      logger.logDataQuality('completion_rate', 0.8, 0.9);
      expect(mockLog.mock.calls[0][0]).toContain('WARN');

      // Value above threshold should info
      mockLog.mockClear();
      logger.logDataQuality('completion_rate', 0.95, 0.9);
      expect(mockLog.mock.calls[0][0]).toContain('INFO');
    });
  });

  describe('child logger', () => {
    test('creates child with additional context', () => {
      const childLogger = logger.child({ operation: 'test-op', userId: '123' });
      childLogger.info('child message');

      const logCall = mockLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.replace(/\x1b\[[0-9;]*m/g, ''));

      expect(logEntry.context).toBe('TEST');
      expect(logEntry.operation).toBe('test-op');
      expect(logEntry.userId).toBe('123');
    });

    test('child inherits parent configuration', () => {
      const childLogger = logger.child({ extra: 'data' });

      expect(childLogger.level).toBe(logger.level);
      expect(childLogger.logFile).toBe(logger.logFile);
    });
  });
});
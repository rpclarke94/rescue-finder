// src/utils/database.mjs

import { PrismaClient } from '@prisma/client';
import { logger } from './logger.mjs';
import { DatabaseError, withErrorBoundary } from './errorHandling.mjs';

class DatabaseManager {
  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Set up Prisma logging
    this.prisma.$on('query', (e) => {
      logger.debug('Database query', {
        query: e.query,
        params: e.params,
        duration: e.duration,
        type: 'database_query'
      });
    });

    this.prisma.$on('error', (e) => {
      logger.error('Database error', {
        message: e.message,
        target: e.target,
        type: 'database_error'
      });
    });

    this.prisma.$on('warn', (e) => {
      logger.warn('Database warning', {
        message: e.message,
        target: e.target,
        type: 'database_warning'
      });
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', { error: error.message });
      throw new DatabaseError('Database connection failed', 'connect', { error: error.message });
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database', { error: error.message });
    }
  }

  // Transaction wrapper with retry logic
  async withTransaction(operation, options = {}) {
    const { maxAttempts = 3, timeout = 30000 } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          return await withErrorBoundary(
            () => operation(tx),
            { operation: 'transaction', attempt }
          );
        }, { timeout });
      } catch (error) {
        logger.warn('Transaction failed', {
          attempt,
          maxAttempts,
          error: error.message,
          type: 'transaction_retry'
        });

        if (attempt === maxAttempts) {
          throw new DatabaseError(
            `Transaction failed after ${maxAttempts} attempts`,
            'transaction',
            { error: error.message, attempts: maxAttempts }
          );
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Bulk upsert with batch optimization
  async bulkUpsertDogs(records, batchSize = 100) {
    const total = records.length;
    let processed = 0;
    let errors = [];

    logger.info('Starting bulk upsert', { total, batchSize });

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      try {
        await this.withTransaction(async (tx) => {
          const promises = batch.map(record =>
            tx.dog.upsert({
              where: { externalId: record.externalId },
              update: record,
              create: record
            })
          );

          await Promise.all(promises);
        });

        processed += batch.length;
        logger.debug('Batch processed successfully', {
          batch: Math.floor(i / batchSize) + 1,
          processed,
          total,
          type: 'batch_success'
        });
      } catch (error) {
        logger.error('Batch failed', {
          batch: Math.floor(i / batchSize) + 1,
          batchSize: batch.length,
          error: error.message,
          type: 'batch_error'
        });

        // Try individual records in the failed batch
        for (const record of batch) {
          try {
            await this.prisma.dog.upsert({
              where: { externalId: record.externalId },
              update: record,
              create: record
            });
            processed++;
          } catch (recordError) {
            errors.push({
              record: record.externalId,
              error: recordError.message
            });
          }
        }
      }

      // Progress reporting
      if (i % (batchSize * 10) === 0 || i + batchSize >= records.length) {
        logger.info('Bulk upsert progress', {
          processed,
          total,
          percentage: Math.round((processed / total) * 100),
          errors: errors.length
        });
      }
    }

    return {
      total,
      processed,
      errors,
      success: processed === total
    };
  }

  // Get database statistics
  async getStats() {
    try {
      const dogCount = await this.prisma.dog.count();
      const lastUpdate = await this.prisma.dog.findFirst({
        orderBy: { lastSeen: 'desc' },
        select: { lastSeen: true }
      });

      const breedStats = await this.prisma.dog.groupBy({
        by: ['breed'],
        _count: { breed: true },
        orderBy: { _count: { breed: 'desc' } },
        take: 10
      });

      const charityStats = await this.prisma.dog.groupBy({
        by: ['charity'],
        _count: { charity: true },
        orderBy: { _count: { charity: 'desc' } },
        take: 10
      });

      return {
        totalDogs: dogCount,
        lastUpdate: lastUpdate?.lastSeen,
        topBreeds: breedStats.map(stat => ({
          breed: stat.breed,
          count: stat._count.breed
        })),
        topCharities: charityStats.map(stat => ({
          charity: stat.charity,
          count: stat._count.charity
        }))
      };
    } catch (error) {
      throw new DatabaseError('Failed to get database statistics', 'stats', { error: error.message });
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Data quality checks
  async runDataQualityChecks() {
    try {
      const checks = await Promise.all([
        // Check for missing required fields
        this.prisma.dog.count({ where: { name: { equals: '' } } }),
        this.prisma.dog.count({ where: { breed: { equals: '' } } }),
        this.prisma.dog.count({ where: { age: { equals: '' } } }),

        // Check for invalid URLs
        this.prisma.dog.count({
          where: {
            imageUrl: {
              not: { equals: '' },
              not: { startsWith: 'http' }
            }
          }
        }),

        // Check for old records (not seen in 30 days)
        this.prisma.dog.count({
          where: {
            lastSeen: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Check for duplicates by name and charity
        this.prisma.$queryRaw`
          SELECT COUNT(*) as count FROM (
            SELECT name, charity FROM Dog
            GROUP BY name, charity
            HAVING COUNT(*) > 1
          )
        `
      ]);

      const [
        missingNames,
        missingBreeds,
        missingAges,
        invalidUrls,
        staleRecords,
        duplicates
      ] = checks;

      return {
        missingNames,
        missingBreeds,
        missingAges,
        invalidUrls,
        staleRecords,
        duplicates: Array.isArray(duplicates) ? duplicates[0]?.count || 0 : duplicates
      };
    } catch (error) {
      throw new DatabaseError('Failed to run data quality checks', 'quality_check', { error: error.message });
    }
  }
}

// Export singleton instance
export const db = new DatabaseManager();

// Export class for custom instances
export { DatabaseManager };
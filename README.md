# Rescue Finder ETL Pipeline

A robust Node.js ETL pipeline for ingesting UK dog rescue listings from CSV, normalizing and enriching data fields (age, sex, breed, location), and upserting into a PostgreSQL/SQLite database via Prisma.

## Features

- **Data Ingestion**: CSV parsing with comprehensive validation and sanitization
- **AI Enhancement**: OpenAI integration for fuzzy extraction of breed, age, sex, and location data
- **Location Enrichment**: postcodes.io API integration for UK postcode → town/county/region mapping
- **Robust Error Handling**: Retry mechanisms, circuit breakers, and comprehensive logging
- **Data Validation**: Schema enforcement with Zod for input validation and sanitization
- **Performance**: Rate limiting, batch processing, and parallel operations
- **Monitoring**: Structured logging, data quality checks, and health monitoring
- **Testing**: Comprehensive test suite with Jest

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and database URL
   ```

3. **Setup database**:
   ```bash
   npm run prisma:migrate
   ```

4. **Run the ETL pipeline**:
   ```bash
   # Original version
   npm run import

   # Enhanced version with hardened error handling
   npm run import:enhanced

   # With limit for testing
   npm run import:enhanced -- --limit 50
   ```

## Scripts

- `npm run import` - Run original ETL pipeline
- `npm run import:enhanced` - Run enhanced ETL pipeline with all improvements
- `npm run export` - Export processed data to CSV
- `npm run clear` - Clear all dog records from database
- `npm run test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run prisma:studio` - Open Prisma Studio database browser

## Configuration

Environment variables (see `.env.example`):

### Required
- `OPENAI_API_KEY` - Your OpenAI API key for AI extraction
- `DATABASE_URL` - Database connection string

### Optional
- `OPENAI_MODEL_PRIMARY` - Primary OpenAI model (default: "gpt-4o-mini")
- `OPENAI_MODEL_FALLBACK` - Fallback model for retries (default: "gpt-4o-mini")
- `MAX_CONCURRENT_REQUESTS` - Max concurrent API requests (default: 5)
- `REQUEST_TIMEOUT_MS` - API request timeout (default: 45000)
- `BATCH_SIZE` - Database batch size (default: 100)
- `LOG_LEVEL` - Logging level: error, warn, info, debug (default: "info")
- `LOG_FILE` - Log file path (optional)

## Architecture

### Core Components

1. **Validation Layer** (`src/utils/validation.mjs`)
   - Input sanitization and validation
   - Schema enforcement with Zod
   - Security against injection attacks

2. **Error Handling** (`src/utils/errorHandling.mjs`)
   - Custom error classes (ETLError, ValidationError, APIError, DatabaseError)
   - Retry mechanisms with exponential backoff
   - Circuit breakers for external API protection
   - Rate limiting for API calls

3. **Database Management** (`src/utils/database.mjs`)
   - Transaction management with retry logic
   - Bulk operations with batch optimization
   - Data quality monitoring
   - Health checks

4. **Logging** (`src/utils/logger.mjs`)
   - Structured JSON logging
   - Multiple log levels and outputs
   - Specialized methods for ETL operations
   - Child loggers with context

### Data Flow

1. **CSV Ingestion**: Read and parse CSV with validation
2. **Data Sanitization**: Clean and validate all input fields
3. **Quick Rules**: Apply basic normalization for age, sex, breed
4. **AI Enhancement**: Use OpenAI for fuzzy extraction when needed
5. **Location Enrichment**: Batch lookup postcodes via postcodes.io API
6. **Data Assembly**: Combine all data sources with priority rules
7. **Final Validation**: Ensure output meets schema requirements
8. **Database Upsert**: Bulk insert/update with transaction safety
9. **Quality Monitoring**: Run data quality checks and log metrics

## Data Pipeline Details

### Breed Normalization
- 80+ canonical breed names from UK Kennel Club
- Synonym mapping for common variations (e.g., "lab" → "Labrador")
- Cross-breed detection using keywords and AI
- Fallback to "Crossbreed" or "Unknown"

### Location Resolution Priority
1. **Postcode lookup** via postcodes.io API (highest priority)
2. **AI extraction** from description and other fields
3. **Charity home location** fallback (configurable)
4. **Manual cleanup** (remove duplicates, postcodes in town field, etc.)

### Age Normalization
- Parse various formats: "2 years", "10 months", "8 weeks"
- Convert weeks to months, handle approximations
- Standardize to "X years" or "X months" format
- Age categories: Puppy, 1-3 years, 4-6 years, 7-9 years, Senior

## Error Handling & Reliability

### Retry Strategies
- **OpenAI API**: 3 attempts with exponential backoff
- **postcodes.io**: 3 attempts for 5xx errors only
- **Database**: Transaction retry with deadlock handling

### Circuit Breakers
- **OpenAI**: Opens after 5 failures, 60s timeout
- **postcodes.io**: Opens after 3 failures, 30s timeout

### Rate Limiting
- **OpenAI**: 5 requests/second with burst of 10
- **postcodes.io**: 10 requests/second with burst of 20

### Data Quality Monitoring
- Missing required fields tracking
- Invalid URL detection
- Stale record identification (>30 days)
- Duplicate detection by name + charity

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npm run test:watch
```

Test coverage includes:
- Input validation and sanitization
- Error handling and retry logic
- Logger functionality
- Database operations (mocked)
- API integrations (mocked)

## Database Schema

The main `Dog` model includes:

- **Identity**: `id`, `externalId` (stable hash-based ID)
- **Basic Info**: `name`, `age`, `sex`, `breed`, `ageCategory`
- **Location**: `location` (town), `county`, `region`
- **Media**: `imageUrl`, `link`
- **Metadata**: `charity`, `description`, `scrapedDate`, `lastSeen`
- **SEO**: `seoSlug`, `seoTitle`, `seoDesc` (for future use)
- **Timestamps**: `createdAt`, `updatedAt`

## Performance & Scalability

### Current Optimizations
- Batch database operations (100 records per transaction)
- Rate-limited API calls to respect external service limits
- Connection pooling via Prisma
- Efficient duplicate detection via stable IDs

### Scaling Considerations
- Consider switching to PostgreSQL for larger datasets
- Implement Redis caching for postcode lookups
- Add worker queues for large CSV processing
- Database indexing on frequently queried fields

## Monitoring & Observability

### Structured Logging
All operations are logged with structured JSON including:
- Operation type and context
- Performance metrics (response times, batch sizes)
- Error details with stack traces
- Data quality metrics

### Health Checks
- Database connectivity check
- External API availability
- Data freshness monitoring

### Metrics Tracked
- Processing throughput (records/minute)
- API call success rates and response times
- Validation error rates
- Data quality scores

## Security

### Input Sanitization
- Control character removal
- HTML entity escaping
- URL validation with protocol restrictions
- Postcode format validation

### API Security
- Rate limiting to prevent abuse
- Request timeouts to prevent hanging
- API key rotation support
- No credentials in logs or error messages

## Development

### Code Quality
- ESLint configuration for code standards
- Comprehensive test coverage
- Error boundary patterns
- Defensive programming practices

### Git Workflow
- `.gitignore` properly configured
- Environment variables excluded
- Build artifacts ignored
- Test coverage reports excluded

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Monitor rate limits
   - Review model availability

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database server availability
   - Review connection pool settings

3. **CSV Parsing Errors**
   - Validate CSV format and encoding
   - Check for special characters
   - Review column mapping

4. **Memory Issues**
   - Reduce batch size for large datasets
   - Implement streaming for huge files
   - Monitor memory usage during processing

### Debugging

Enable debug logging:
```bash
LOG_LEVEL=debug npm run import:enhanced
```

Check logs for detailed operation traces:
```bash
tail -f etl.log | jq
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Submit a pull request

## License

This project is private and proprietary.
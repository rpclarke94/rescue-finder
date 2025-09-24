// scripts/import_dogs_optimized.mjs

// --- Load env early and robustly ---
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// libs
import { parse } from 'csv-parse';

// Utils
import { logger } from '../src/utils/logger.mjs';
import {
  retryWithBackoff,
  RateLimiter,
  CircuitBreaker,
  setupGracefulShutdown,
  APIError,
  ValidationError
} from '../src/utils/errorHandling.mjs';
import { validateAndSanitizeCsvRow, validateDogRecord } from '../src/utils/validation.mjs';
import { db } from '../src/utils/database.mjs';
import {
  parallelProcess,
  globalCache,
  taskQueue,
  performanceMonitor
} from '../src/utils/performance.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment setup (same as enhanced version)
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '.env'),
];

let loadedEnvPath = null;
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    loadedEnvPath = p;
    break;
  }
}

logger.info('Environment loaded', {
  cwd: process.cwd(),
  loaded: loadedEnvPath || '(none found)'
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
if (!OPENAI_API_KEY) {
  logger.error('OPENAI_API_KEY missing');
  process.exit(1);
}

const config = {
  openai: {
    apiKey: OPENAI_API_KEY,
    primaryModel: process.env.OPENAI_MODEL_PRIMARY || 'gpt-4o-mini',
    fallbackModel: process.env.OPENAI_MODEL_FALLBACK || 'gpt-4o-mini',
    timeout: parseInt(process.env.REQUEST_TIMEOUT_MS) || 45000,
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 8 // Increased for optimized version
  },
  processing: {
    batchSize: parseInt(process.env.BATCH_SIZE) || 100,
    maxRetries: 3,
    parallelChunks: 4, // Process 4 chunks in parallel
    aiConcurrency: 6,  // Allow more concurrent AI calls
    postcodeConcurrency: 3
  },
  files: {
    csvPath: 'data/latest.csv'
  }
};

// Rate limiters with higher limits for optimization
const openaiLimiter = new RateLimiter(config.openai.maxConcurrent, 15);
const postcodesLimiter = new RateLimiter(config.processing.postcodeConcurrency * 3, 30);

// Circuit breakers
const openaiCircuitBreaker = new CircuitBreaker({ threshold: 8, timeout: 60000 });
const postcodesCircuitBreaker = new CircuitBreaker({ threshold: 5, timeout: 30000 });

// Same configuration constants as enhanced version
const ALLOWED_BREEDS = [
  "Affenpinscher","Afghan Hound","Airedale Terrier","Akita","Alaskan Malamute","American Bulldog","Anatolian Shepherd Dog",
  "Australian Cattle Dog","Australian Shepherd","Australian Terrier","Basenji","Basset Fauve De Bretagne","Basset Hound","Beagle",
  "Bearded Collie","Beauceron","Bedlington Terrier","Belgian Malinois","Belgian Shepherd","Bernese Mountain Dog","Bichon Frise",
  "Bloodhound","Border Collie","Border Terrier","Borzoi","Boston Terrier","Bouvier Des Flandres","Boxer","Briard","Brittany",
  "Bull Terrier","Bulldog","Bullmastiff","Cairn Terrier","Canaan Dog","Cane Corso","Cardigan Welsh Corgi",
  "Cavalier King Charles Spaniel","Cesky Terrier","Chesapeake Bay Retriever","Chihuahua","Chinese Crested","Chow Chow",
  "Clumber Spaniel","Cockapoo","Cocker Spaniel","Collie","Coton De Tulear","Crossbreed","Dachshund","Dalmatian",
  "Dandie Dinmont Terrier","Deerhound","Dobermann","Dogo Argentino","Dogue de Bordeaux","Dutch Shepherd","English Setter",
  "English Springer Spaniel","English Toy Terrier","Estrela Mountain Dog","Eurasier","Field Spaniel","Finnish Lapphund",
  "Finnish Spitz","Flat Coated Retriever","Fox Terrier","Foxhound","French Bulldog","German Pinscher","German Pointer",
  "German Shepherd","Giant Schnauzer","Glen Of Imaal Terrier","Golden Retriever","Gordon Setter","Great Dane",
  "Greater Swiss Mountain Dog","Greenland Dog","Greyhound","Griffon Bruxellois","Hamiltonstovare","Harrier","Havanese","Hovawart",
  "Hungarian Puli","Hungarian Vizsla","Hungarian Wire Haired Vizsla","Ibizan Hound","Icelandic Sheepdog",
  "Irish Red and White Setter","Irish Setter","Irish Terrier","Irish Water Spaniel","Irish Wolfhound","Italian Greyhound",
  "Jack Russell Terrier","Japanese Akita","Japanese Chin","Keeshond","Kerry Blue Terrier","King Charles Spaniel","Labrador",
  "Lagotto Romagnolo","Lakeland Terrier","Lancashire Heeler","Large Munsterlander","Leonberger","Lhasa Apso","Lurcher","Maltese",
  "Manchester Terrier","Maremma Sheepdog","Mastiff","Miniature Dachshund","Miniature Pinscher","Miniature Poodle","Miniature Schnauzer",
  "Neapolitan Mastiff","Newfoundland","Norfolk Terrier","Norwegian Buhund","Norwegian Elkhound","Norwegian Lundehund","Norwich Terrier",
  "Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Otterhound","Papillon","Parson Russell Terrier","Pekingese",
  "Pembroke Welsh Corgi","Pharaoh Hound","Pointer","Polish Lowland Sheepdog","Pomeranian","Poodle","Portuguese Water Dog","Pug",
  "Pyrenean Mountain Dog","Rhodesian Ridgeback","Rottweiler","Russian Black Terrier","Russian Toy","Saluki","Samoyed","Schipperke",
  "Schnauzer","Scottish Terrier","Sealyham Terrier","Shar Pei","Shetland Sheepdog","Shiba Inu","Shih Tzu","Siberian Husky","Skye Terrier",
  "Sloughi","Soft Coated Wheaten Terrier","Spanish Water Dog","Spinone Italiano","St Bernard","Staffordshire Bull Terrier","Sussex Spaniel",
  "Swedish Lapphund","Swedish Vallhund","Tenterfield Terrier","Tibetan Mastiff","Tibetan Spaniel","Tibetan Terrier","Utonagan",
  "Volpino Italiano","Weimaraner","Welsh Springer Spaniel","Welsh Terrier","West Highland White Terrier","Whippet",
  "White Swiss Shepherd Dog","Wire Fox Terrier","Yorkshire Terrier","Zuchon","Unknown"
];

const BREED_SYNONYM_MAP = {
  'lab':'Labrador','labrador retriever':'Labrador','gsd':'German Shepherd','alsatian':'German Shepherd',
  'staffy':'Staffordshire Bull Terrier','staffie':'Staffordshire Bull Terrier',
  'jr terrier':'Jack Russell Terrier','jack russell':'Jack Russell Terrier',
  'yorkie':'Yorkshire Terrier','shihtzu':'Shih Tzu','shih-tzu':'Shih Tzu',
  'mini schnauzer':'Miniature Schnauzer','miniature schnauzer':'Miniature Schnauzer',
  'mini poodle':'Miniature Poodle','miniature poodle':'Miniature Poodle',
  'westie':'West Highland White Terrier','sheepdog':'Collie'
};

const CHARITY_HOME_LOCATIONS = {};
const BANNED_NAMES = ['A Dog For You','A TURBO'];

// Helper functions (same as enhanced version)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function cleanName(name = '') {
  let s = String(name).trim();
  s = s.replace(/^(adopt|meet|say hello to|introducing|about)\s*[:\-]?\s+/i, '');
  s = s.replace(/\s*[-–—]?\s*(ready for adoption|for adoption|adoption|available|reserved|update.*|at .*)\s*$/i, '');
  s = s.replace(/[\[\(\{].*?[\]\)\}]/g, '');
  s = s.replace(/["""''#*]/g, '').replace(/\s{2,}/g, ' ').trim();
  s = s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return s;
}

function isValidDogName(raw = '') {
  const s = String(raw).trim();
  if (!s) return false;
  for (const b of BANNED_NAMES) if (s.toLowerCase() === b.toLowerCase()) return false;
  if (/(adopt a dog|a dog for you|available dogs|dogs for adoption)/i.test(s)) return false;
  return true;
}

function extractUrlFromCss(str = '') {
  const s = String(str).trim();
  let m = s.match(/url\(['"]?([^'")]+)['"]?\)/i);
  if (m && m[1]) return m[1];
  m = s.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i);
  if (m && m[1]) return m[1];
  return s;
}

function absolutizeImageUrl(image, link, charity) {
  let img = extractUrlFromCss(image || '').trim();
  if (!img) return '';
  if (/^https?:\/\//i.test(img)) return img;
  const m = String(link || '').match(/^https?:\/\/[^/]+/i);
  if (m) return m[0] + (img.startsWith('/') ? img : '/' + img);
  return img;
}

function stripLocationLabel(s = '') {
  return String(s).replace(/^\s*location\s*[:\-–—\u00A0]\s*/i, '').trim();
}

function onlyTownFromFreeText(s = '') {
  const cleaned = stripLocationLabel(s);
  return cleaned.split(',')[0].replace(/\b(near|area|region|district|borough)\b.*$/i, '').trim();
}

function normalizeAge(raw = '') {
  const t = String(raw).toLowerCase().replace(/approx\.?|approximately|about|around|~|nearly|roughly/g, '').trim();
  if (!t) return '';
  let m = t.match(/(\d{1,2})\s*(years?|yrs?|yo|y)\b/);
  if (m) { const y = +m[1]; return y === 1 ? '1 year' : `${y} years`; }
  m = t.match(/(\d{1,2})\s*(months?|mos?|mo|m)\b/);
  if (m) {
    const mo = +m[1]; if (mo >= 12) { const y = Math.round(mo / 12); return y === 1 ? '1 year' : `${y} years`; }
    return mo === 1 ? '1 month' : `${mo} months`;
  }
  m = t.match(/(\d{1,2})\s*(weeks?|wks?|w)\b/);
  if (m) { const wk = +m[1], mo = Math.max(1, Math.round(wk / 4)); return mo === 1 ? '1 month' : `${mo} months`; }
  m = t.match(/\b(\d{1,2})\b/);
  if (m) { const n = +m[1]; return n === 1 ? '1 year' : `${n} years`; }
  return '';
}

function normalizeSex(raw = '') {
  const t = String(raw).toLowerCase();
  if (/female|^f\b|bitch|\bshe\b|\bher\b|spayed/.test(t)) return 'Female';
  if (/male|^m\b|\bdog\b|\bhe\b|\bhis\b|neutered/.test(t)) return 'Male';
  return '';
}

function normalizeBreedText(s = '') {
  let t = s.toLowerCase();
  t = t.replace(/[\(\)\[\]\{\}]/g, ' ');
  t = t.replace(/[\/,]/g, ' ');
  t = t.replace(/[^a-z\s-]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  t = t.replace(/\bcavalier king charles\b/g, 'cavalier king charles spaniel');
  t = t.replace(/\bking charles spaniel\b/g, 'cavalier king charles spaniel');
  t = t.replace(/\bgsd\b/g, 'german shepherd');
  t = t.replace(/\bjack russell\b/g, 'jack russell terrier');
  return t;
}

function matchAllowedBreed(raw = '') {
  const t = normalizeBreedText(raw);
  if (!t) return '';
  for (const b of ALLOWED_BREEDS) if (t === b.toLowerCase()) return b;
  for (const key in BREED_SYNONYM_MAP) {
    const re = new RegExp(`\\b${key}\\b`, 'i');
    if (re.test(t)) return BREED_SYNONYM_MAP[key];
  }
  for (const b of ALLOWED_BREEDS) {
    const re = new RegExp(`\\b${b.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (re.test(t)) return b;
  }
  return '';
}

function detectCross(...texts) {
  const t = texts.join(' ').toLowerCase();
  return /\b(cross|crossbreed|mix|mixed|(^|[^a-z])x([^a-z]|$))\b/.test(t);
}

// ------------- Cached OpenAI calls -------------
async function askOpenAIJsonCC({ model, system, user, timeoutMs = config.openai.timeout }) {
  // Create cache key from inputs
  const cacheKey = `openai:${model}:${Buffer.from(system + user).toString('base64').slice(0, 32)}`;

  // Check cache first
  const cached = globalCache.get(cacheKey);
  if (cached) {
    logger.debug('OpenAI cache hit', { cacheKey: cacheKey.slice(0, 20) + '...' });
    return cached;
  }

  await openaiLimiter.acquire();

  const result = await openaiCircuitBreaker.execute(async () => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort('timeout'), timeoutMs);

    const body = {
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    };

    try {
      const startTime = Date.now();
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: ctl.signal
      });

      const responseTime = Date.now() - startTime;
      const js = await resp.json();

      logger.logApiCall('OpenAI', '/chat/completions', resp.status, responseTime, {
        model,
        prompt_length: user.length,
        cached: false
      });

      if (!resp.ok) {
        throw new APIError(`OpenAI HTTP ${resp.status}: ${JSON.stringify(js)}`, 'OpenAI', resp.status);
      }

      const txt = js?.choices?.[0]?.message?.content ?? '';
      const parsed = JSON.parse(txt);

      // Cache successful results for 30 minutes
      globalCache.set(cacheKey, parsed, 30 * 60 * 1000);

      return parsed;
    } finally {
      clearTimeout(t);
    }
  });

  return result;
}

// ------------- Parallel AI extraction -------------
async function aiExtractAll({ name, rawBreed, description, rawAge, rawSex, rawTown, postcode }) {
  const allowedJson = JSON.stringify(ALLOWED_BREEDS);
  const system = 'You extract structured data for UK dog rescue listings. Return ONE valid JSON object. No markdown.';
  const user = `
Map free text to one canonical breed from Allowed. If clearly a mix and no dominant breed, use "Crossbreed". If unknown, "Unknown".
Age: if <12 months -> "X months", otherwise "X years" (round weeks to months).
Sex: "Male" or "Female" (use pronouns/spayed/neutered hints), else "Unknown".
Infer UK **location** fields from anything available (town text, postcode pattern, description):
- "town": UK town/village name only.
- "county": administrative county or local authority (string, not code).
- "region": UK region (e.g. "East Midlands", "South East", "Wales", "Scotland", "Greater London", etc.)
If you cannot determine a field, return an empty string for it.

Return EXACT JSON keys:
{
  "breed":"<Allowed|Crossbreed|Unknown>",
  "age":"<X months|X years|Unknown>",
  "sex":"Male|Female|Unknown",
  "town":"<string, '' if unknown>",
  "county":"<string, '' if unknown>",
  "region":"<string, '' if unknown>"
}

Allowed: ${allowedJson}

Given:
Name: ${name || ''}
Provided breed: ${rawBreed || ''}
Provided age: ${rawAge || ''}
Provided sex: ${rawSex || ''}
Provided town: ${rawTown || ''}
Postcode: ${postcode || ''}

Description:
${(description || '').slice(0, 1800)}
`.trim();

  const models = [
    config.openai.primaryModel,
    config.openai.fallbackModel
  ];

  for (const [attempt, model] of models.entries()) {
    try {
      const j = await retryWithBackoff(
        () => askOpenAIJsonCC({ model, system, user }),
        {
          maxAttempts: 2,
          retryCondition: (error) => !(error instanceof APIError && error.status === 401)
        }
      );

      if (j && typeof j.breed === 'string' && typeof j.age === 'string' &&
          typeof j.sex === 'string' && typeof j.town === 'string' &&
          typeof j.county === 'string' && typeof j.region === 'string') {
        return j;
      }
      throw new Error('Invalid JSON response structure');
    } catch (e) {
      logger.warn('AI extraction failed', {
        model,
        attempt: attempt + 1,
        error: e.message,
        type: 'ai_extraction_error'
      });

      if (attempt < models.length - 1) {
        await sleep(200 * (attempt + 1));
      }
    }
  }
  return null;
}

// ------------- Cached postcodes.io lookup -------------
async function batchLookupPostcodes(postcodes) {
  const uniq = Array.from(new Set(postcodes.filter(Boolean).map(pc => String(pc).toUpperCase().trim())));
  const out = {};
  if (!uniq.length) return out;

  // Check cache first
  const uncachedPostcodes = [];
  for (const pc of uniq) {
    const cached = globalCache.get(`postcode:${pc}`);
    if (cached) {
      out[pc] = cached;
    } else {
      uncachedPostcodes.push(pc);
    }
  }

  if (uncachedPostcodes.length === 0) {
    logger.debug('All postcodes found in cache', { total: uniq.length });
    return out;
  }

  logger.debug('Postcode cache stats', {
    total: uniq.length,
    cached: uniq.length - uncachedPostcodes.length,
    uncached: uncachedPostcodes.length
  });

  // Process uncached postcodes in smaller parallel batches
  const batchResults = await parallelProcess(
    uncachedPostcodes,
    async (postcode) => {
      await postcodesLimiter.acquire();

      return await retryWithBackoff(async () => {
        const startTime = Date.now();
        const resp = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
        const responseTime = Date.now() - startTime;
        const js = await resp.json();

        logger.logApiCall('postcodes.io', `/postcodes/${postcode}`, resp.status, responseTime);

        if (resp.status === 404) {
          // Cache negative results too
          const result = { town: '', county: '', region: '', country: '' };
          globalCache.set(`postcode:${postcode}`, result, 24 * 60 * 60 * 1000); // 24h TTL
          return { postcode, result };
        }

        if (!resp.ok) {
          throw new APIError(`postcodes.io HTTP ${resp.status}`, 'postcodes.io', resp.status);
        }

        const result = {
          town: js.result?.post_town || '',
          county: js.result?.admin_county || js.result?.admin_district || '',
          region: js.result?.region || '',
          country: js.result?.country || ''
        };

        // Cache successful results for 24 hours
        globalCache.set(`postcode:${postcode}`, result, 24 * 60 * 60 * 1000);

        return { postcode, result };
      }, {
        maxAttempts: 3,
        retryCondition: (error) => error instanceof APIError && error.status >= 500
      });
    },
    {
      concurrency: config.processing.postcodeConcurrency,
      onError: 'continue'
    }
  );

  // Process results
  for (const batchResult of batchResults.results) {
    if (batchResult.success) {
      const { postcode, result } = batchResult.result;
      out[postcode] = result;
    }
  }

  return out;
}

// Same location resolution as enhanced version
function resolveLocation({ rawTown, pcRow, aiLoc, charity }) {
  let town = onlyTownFromFreeText(rawTown || '');
  let county = '';
  let region = '';

  if (pcRow) {
    town = town || pcRow.town || '';
    county = pcRow.county || county;
    region = pcRow.region || region;
  }

  if (aiLoc) {
    if (!town && aiLoc.town) town = aiLoc.town;
    if (!county && aiLoc.county) county = aiLoc.county;
    if (!region && aiLoc.region) region = aiLoc.region;
  }

  if ((!town || !county || !region) && charity) {
    const home = CHARITY_HOME_LOCATIONS[charity.toLowerCase()];
    if (home) {
      if (!town && home.town) town = home.town;
      if (!county && home.county) county = home.county;
      if (!region && home.region) region = home.region;
    }
  }

  if (town && county && town.toLowerCase() === String(county).toLowerCase()) town = '';
  if (town && region && town.toLowerCase() === String(region).toLowerCase()) town = '';
  if (/^[A-Z]{1,2}\d{1,2}[A-Z]?$/.test(town)) town = '';

  return { town, county, region };
}

// CSV reading function
async function readCsvRows(limit = Infinity) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(config.files.csvPath)
      .on('error', reject)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (rec) => {
        if (rows.length < limit) rows.push(rec);
      })
      .on('end', () => resolve(rows));
  });
}

function stableId(link = '', image = '', name = '', charity = '') {
  const s = `${(link || '').toLowerCase()}|${(image || '').toLowerCase()}|${(name || '').toLowerCase()}|${(charity || '').toLowerCase()}`;
  let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(16);
}

function ageCategory(age = '') {
  if (!age || /unknown/i.test(age)) return 'Unknown';
  const mM = age.match(/(\d+)\s*months?/i);
  const mY = age.match(/(\d+)\s*years?/i);
  if (mM) return 'Puppy';
  if (mY) {
    const y = +mY[1];
    if (y <= 3) return '1 - 3 years';
    if (y <= 6) return '4 - 6 years';
    if (y <= 9) return '7 - 9 years';
    return 'Senior';
  }
  return 'Unknown';
}

// ------------- OPTIMIZED MAIN FUNCTION -------------
async function main(limitArg) {
  const startTime = Date.now();

  // Setup graceful shutdown
  setupGracefulShutdown(async () => {
    logger.info('Cleaning up...');
    performanceMonitor.stopAllIntervals();
    await db.disconnect();
  });

  await db.connect();

  // Start performance monitoring
  performanceMonitor.startInterval('memory', () => {
    const usage = process.memoryUsage();
    logger.debug('Memory usage', {
      rss: Math.round(usage.rss / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      type: 'memory_usage'
    });
  }, 30000); // Every 30 seconds

  const limit = Number.isFinite(+limitArg) ? +limitArg : Infinity;

  logger.logProcessingStart('Optimized CSV import', {
    limit,
    file: config.files.csvPath,
    aiConcurrency: config.processing.aiConcurrency,
    parallelChunks: config.processing.parallelChunks
  });

  performanceMonitor.startTimer('total_processing');

  // Step 1: Read and validate CSV
  performanceMonitor.startTimer('csv_reading');
  const rawRows = await readCsvRows(limit);
  performanceMonitor.endTimer('csv_reading');

  logger.info('CSV loaded', { total: rawRows.length });

  // Step 2: Parallel validation and sanitization
  performanceMonitor.startTimer('validation');
  const validationResults = await parallelProcess(
    rawRows,
    (row) => {
      const validation = validateAndSanitizeCsvRow(row);
      if (!validation.success) {
        logger.logValidationError(`Row validation`, validation.errors, 'csv_validation');
      }
      return validation;
    },
    {
      concurrency: 20, // High concurrency for CPU-bound validation
      onProgress: (progress) => {
        if (progress.processed % 100 === 0) {
          logger.debug('Validation progress', progress);
        }
      }
    }
  );

  const validatedRows = validationResults.results
    .filter(r => r.success && r.result.success)
    .map(r => ({ ...r.result.data, _originalIndex: rawRows.indexOf(r.item) }));

  performanceMonitor.endTimer('validation');

  logger.info('CSV validation completed', {
    total: rawRows.length,
    valid: validatedRows.length,
    invalid: validationResults.errorCount
  });

  // Step 3: Filter processable rows
  const processableRows = validatedRows.filter(r => isValidDogName(r.name));
  logger.info('Filtered processable rows', {
    validated: validatedRows.length,
    processable: processableRows.length
  });

  // Step 4: Batch postcode lookup (with caching)
  performanceMonitor.startTimer('postcode_lookup');
  const postcodes = processableRows.map(r => r.postcode).filter(Boolean);
  const pcMap = await batchLookupPostcodes(postcodes);
  performanceMonitor.endTimer('postcode_lookup');

  logger.info('Postcode lookup completed', {
    unique_postcodes: postcodes.length,
    resolved: Object.keys(pcMap).length
  });

  // Step 5: Parallel processing of dog records
  performanceMonitor.startTimer('record_processing');

  const processedRecords = [];
  const processingErrors = [];
  let aiCalls = 0, pcHits = 0;

  // Process records in parallel chunks
  const processingResults = await parallelProcess(
    processableRows,
    async (r) => {
      const name = cleanName(r.name || '');
      const charity = String(r.charity || '').trim();
      const link = r.link?.toString().trim() || '';

      let image = absolutizeImageUrl(r.image || '', link, charity);
      if (!/^https?:\/\//i.test(image)) image = '';

      // Quick rules
      let age = normalizeAge(r.age || '');
      let sex = normalizeSex(r.sex || '');
      let breed = matchAllowedBreed(r.breed || '');
      const pcKey = r.postcode?.toString().toUpperCase().trim() || '';
      const pcRow = pcMap[pcKey] || null;
      if (pcRow) pcHits++;

      // AI for all extractions when needed
      const needAI =
        !breed || breed === 'Unknown' || detectCross(r.breed, r.description) ||
        !age || !sex || !onlyTownFromFreeText(r.town || '') || !pcRow;

      let aiLoc = null;
      if (needAI) {
        const ai = await aiExtractAll({
          name,
          rawBreed: r.breed,
          description: r.description,
          rawAge: r.age,
          rawSex: r.sex,
          rawTown: r.town,
          postcode: r.postcode
        });
        aiCalls++;

        if (ai) {
          if ((!breed || !ALLOWED_BREEDS.includes(breed)) && ai.breed && ALLOWED_BREEDS.includes(ai.breed)) {
            breed = ai.breed;
          } else if (!breed) {
            breed = detectCross(r.breed, r.description) ? 'Crossbreed' : 'Unknown';
          }
          if (!age && ai.age) age = ai.age;
          if (!sex && ai.sex) sex = ai.sex;

          aiLoc = { town: ai.town || '', county: ai.county || '', region: ai.region || '' };
        }
      }

      const { town, county, region } = resolveLocation({
        rawTown: r.town,
        pcRow,
        aiLoc,
        charity
      });

      if (!breed) breed = detectCross(r.breed, r.description) ? 'Crossbreed' : 'Unknown';
      if (!age) age = 'Unknown';
      if (!sex) sex = 'Unknown';

      const rec = {
        externalId: stableId(link, image, name, charity),
        name,
        imageUrl: image,
        link,
        age,
        sex,
        breed,
        location: town || '',
        county: county || '',
        region: region || '',
        charity,
        description: r.description || '',
        scrapedDate: r.date ? new Date(r.date) : null,
        ageCategory: ageCategory(age),
        lastSeen: new Date()
      };

      // Validate processed record
      const recordValidation = validateDogRecord(rec);
      if (!recordValidation.success) {
        throw new ValidationError(
          `Record validation failed for ${rec.externalId}`,
          recordValidation.errors
        );
      }

      return recordValidation.data;
    },
    {
      concurrency: config.processing.aiConcurrency,
      onProgress: (progress) => {
        if (progress.processed % 10 === 0) {
          logger.info('Processing progress', {
            ...progress,
            aiCalls,
            pcHits
          });
        }
      },
      onError: 'continue'
    }
  );

  // Collect results
  for (const result of processingResults.results) {
    if (result.success) {
      processedRecords.push(result.result);
    } else {
      processingErrors.push({
        error: result.error.message,
        item: result.item
      });
    }
  }

  performanceMonitor.endTimer('record_processing');

  logger.info('Record processing completed', {
    processed: processedRecords.length,
    errors: processingErrors.length,
    aiCalls: aiCalls,
    pcHits: pcHits
  });

  // Step 6: Bulk database upsert
  performanceMonitor.startTimer('database_upsert');
  const upsertResult = await db.bulkUpsertDogs(processedRecords, config.processing.batchSize);
  performanceMonitor.endTimer('database_upsert');

  // Final statistics
  const totalProcessingTime = performanceMonitor.endTimer('total_processing');
  const stats = {
    processingTime: `${Math.round(totalProcessingTime / 1000)}s`,
    totalRows: rawRows.length,
    validatedRows: validatedRows.length,
    processableRows: processableRows.length,
    processedRecords: processedRecords.length,
    upsertedRecords: upsertResult.processed,
    validationErrors: validationResults.errorCount,
    processingErrors: processingErrors.length,
    upsertErrors: upsertResult.errors.length,
    aiCalls,
    postcodeHits: pcHits,
    cacheStats: globalCache.getStats(),
    throughput: Math.round(processedRecords.length / (totalProcessingTime / 1000))
  };

  logger.logProcessingEnd('Optimized CSV import', stats);

  // Performance metrics
  const allMetrics = performanceMonitor.getAllMetrics();
  logger.info('Performance breakdown', {
    csv_reading: `${Math.round(allMetrics.csv_reading?.duration || 0)}ms`,
    validation: `${Math.round(allMetrics.validation?.duration || 0)}ms`,
    postcode_lookup: `${Math.round(allMetrics.postcode_lookup?.duration || 0)}ms`,
    record_processing: `${Math.round(allMetrics.record_processing?.duration || 0)}ms`,
    database_upsert: `${Math.round(allMetrics.database_upsert?.duration || 0)}ms`,
    type: 'performance_breakdown'
  });

  // Data quality checks
  try {
    const qualityChecks = await db.runDataQualityChecks();
    Object.entries(qualityChecks).forEach(([metric, value]) => {
      logger.logDataQuality(metric, value);
    });
  } catch (error) {
    logger.warn('Data quality checks failed', { error: error.message });
  }

  performanceMonitor.stopAllIntervals();
  await db.disconnect();
}

// CLI execution
const argLimit = globalThis.process.argv.includes('--limit')
  ? globalThis.process.argv[globalThis.process.argv.indexOf('--limit') + 1]
  : undefined;

main(argLimit).catch(async (e) => {
  logger.error('Fatal error', {
    error: e.message,
    stack: e.stack,
    type: 'fatal_error'
  });
  performanceMonitor.stopAllIntervals();
  await db.disconnect();
  globalThis.process.exit(1);
});
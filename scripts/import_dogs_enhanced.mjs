// scripts/import_dogs_enhanced.mjs

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Candidate locations for .env (project root and fallback)
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
  candidates: envCandidates,
  loaded: loadedEnvPath || '(none found)'
});

// --- Read required vars ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
if (!OPENAI_API_KEY) {
  logger.error('OPENAI_API_KEY missing. Create a .env in your project root');
  process.exit(1);
}

const config = {
  openai: {
    apiKey: OPENAI_API_KEY,
    primaryModel: process.env.OPENAI_MODEL_PRIMARY || 'gpt-4o-mini',
    fallbackModel: process.env.OPENAI_MODEL_FALLBACK || 'gpt-4o-mini',
    timeout: parseInt(process.env.REQUEST_TIMEOUT_MS) || 45000,
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 5
  },
  processing: {
    batchSize: parseInt(process.env.BATCH_SIZE) || 100,
    maxRetries: 3
  },
  files: {
    csvPath: 'data/latest.csv'
  }
};

logger.info('Configuration loaded', { config: { ...config, openai: { ...config.openai, apiKey: '***' } } });

// Rate limiters
const openaiLimiter = new RateLimiter(config.openai.maxConcurrent, 10);
const postcodesLimiter = new RateLimiter(10, 20); // postcodes.io allows higher rates

// Circuit breakers
const openaiCircuitBreaker = new CircuitBreaker({ threshold: 5, timeout: 60000 });
const postcodesCircuitBreaker = new CircuitBreaker({ threshold: 3, timeout: 30000 });

// ------------------ CONFIG ------------------

// Canonical breeds (includes Crossbreed + Unknown)
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

// Breed shorthand → canonical
const BREED_SYNONYM_MAP = {
  'lab':'Labrador','labrador retriever':'Labrador','gsd':'German Shepherd','alsatian':'German Shepherd',
  'staffy':'Staffordshire Bull Terrier','staffie':'Staffordshire Bull Terrier',
  'jr terrier':'Jack Russell Terrier','jack russell':'Jack Russell Terrier',
  'yorkie':'Yorkshire Terrier','shihtzu':'Shih Tzu','shih-tzu':'Shih Tzu',
  'mini schnauzer':'Miniature Schnauzer','miniature schnauzer':'Miniature Schnauzer',
  'mini poodle':'Miniature Poodle','miniature poodle':'Miniature Poodle',
  'westie':'West Highland White Terrier','sheepdog':'Collie'
};

const CHARITY_HOME_LOCATIONS = {
  // 'east midlands dog rescue': { town: 'Hinckley', county: 'Leicestershire', region: 'East Midlands' },
};

const BANNED_NAMES = ['A Dog For You','A TURBO'];

// ------------------ HELPERS ------------------

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

// ------------- OpenAI (Chat Completions JSON mode) -------------
async function askOpenAIJsonCC({ model, system, user, timeoutMs = config.openai.timeout }) {
  await openaiLimiter.acquire();

  return await openaiCircuitBreaker.execute(async () => {
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
        prompt_length: user.length
      });

      if (!resp.ok) {
        throw new APIError(`OpenAI HTTP ${resp.status}: ${JSON.stringify(js)}`, 'OpenAI', resp.status);
      }

      const txt = js?.choices?.[0]?.message?.content ?? '';
      return JSON.parse(txt);
    } finally {
      clearTimeout(t);
    }
  });
}

// Ask AI for breed/age/sex + town/county/region
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
        await sleep(300 * (attempt + 1));
      }
    }
  }
  return null;
}

// ------------- postcodes.io (batch) -------------
async function batchLookupPostcodes(postcodes) {
  const uniq = Array.from(new Set(postcodes.filter(Boolean).map(pc => String(pc).toUpperCase().trim())));
  const out = {};
  if (!uniq.length) return out;

  for (let i = 0; i < uniq.length; i += 100) {
    const chunk = uniq.slice(i, i + 100);

    await postcodesLimiter.acquire();

    try {
      await retryWithBackoff(async () => {
        const startTime = Date.now();
        const resp = await fetch('https://api.postcodes.io/postcodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postcodes: chunk })
        });

        const responseTime = Date.now() - startTime;
        const js = await resp.json();

        logger.logApiCall('postcodes.io', '/postcodes', resp.status, responseTime, {
          batch_size: chunk.length
        });

        if (!resp.ok) {
          throw new APIError(`postcodes.io HTTP ${resp.status}`, 'postcodes.io', resp.status);
        }

        (js.result || []).forEach(item => {
          const q = (item.query || '').toUpperCase();
          const r = item.result || {};
          out[q] = {
            town: r.post_town || '',
            county: r.admin_county || r.admin_district || '',
            region: r.region || '',
            country: r.country || ''
          };
        });
      }, {
        maxAttempts: 3,
        retryCondition: (error) => error instanceof APIError && error.status >= 500
      });

      await sleep(120);
    } catch (e) {
      logger.warn('Postcodes batch failed', {
        batch: Math.floor(i / 100) + 1,
        size: chunk.length,
        error: e.message,
        type: 'postcode_batch_error'
      });
    }
  }
  return out;
}

// ------------- Choose best location (PC → AI → Charity) -------------
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

// ------------- CSV -------------
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

// ------------- IDs & derived -------------
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

// ------------------ MAIN ------------------
async function main(limitArg) {
  const startTime = Date.now();

  // Setup graceful shutdown
  setupGracefulShutdown(async () => {
    logger.info('Cleaning up...');
    await db.disconnect();
  });

  await db.connect();

  const limit = Number.isFinite(+limitArg) ? +limitArg : Infinity;

  logger.logProcessingStart('CSV import', { limit, file: config.files.csvPath });

  const rawRows = await readCsvRows(limit);
  logger.info('CSV loaded', { total: rawRows.length, file: config.files.csvPath });

  // Validate and sanitize all rows first
  const validatedRows = [];
  const validationErrors = [];

  for (let i = 0; i < rawRows.length; i++) {
    const validation = validateAndSanitizeCsvRow(rawRows[i]);
    if (validation.success) {
      validatedRows.push({ ...validation.data, _originalIndex: i });
    } else {
      validationErrors.push({
        row: i + 1,
        errors: validation.errors
      });
      logger.logValidationError(`Row ${i + 1}`, validation.errors, 'csv_validation');
    }
  }

  logger.info('CSV validation completed', {
    total: rawRows.length,
    valid: validatedRows.length,
    invalid: validationErrors.length
  });

  if (validationErrors.length > 0) {
    logger.warn('Validation errors found', { errorCount: validationErrors.length });
  }

  // Filter out invalid names
  const processableRows = validatedRows.filter(r => isValidDogName(r.name));
  logger.info('Filtered processable rows', {
    validated: validatedRows.length,
    processable: processableRows.length,
    filtered_out: validatedRows.length - processableRows.length
  });

  // Batch postcode lookup
  const postcodes = processableRows.map(r => r.postcode).filter(Boolean);
  const pcMap = await batchLookupPostcodes(postcodes);

  let aiCalls = 0, pcHits = 0;
  const processedRecords = [];
  const processingErrors = [];

  // Process rows with progress tracking
  for (let i = 0; i < processableRows.length; i++) {
    const r = processableRows[i];

    try {
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
      if (recordValidation.success) {
        processedRecords.push(recordValidation.data);
      } else {
        processingErrors.push({
          row: r._originalIndex + 1,
          externalId: rec.externalId,
          errors: recordValidation.errors
        });
        logger.logValidationError(`Processed record ${r._originalIndex + 1}`, recordValidation.errors, 'record_validation');
      }

    } catch (error) {
      processingErrors.push({
        row: r._originalIndex + 1,
        error: error.message
      });
      logger.error('Row processing failed', {
        row: r._originalIndex + 1,
        error: error.message,
        type: 'processing_error'
      });
    }

    // Progress reporting
    if ((i + 1) % 10 === 0 || i + 1 === processableRows.length) {
      logger.info('Processing progress', {
        processed: i + 1,
        total: processableRows.length,
        percentage: Math.round(((i + 1) / processableRows.length) * 100),
        aiCalls,
        pcHits,
        errors: processingErrors.length
      });
    }

    await sleep(110); // Gentle pacing
  }

  // Bulk upsert to database
  logger.info('Starting database upsert', { records: processedRecords.length });
  const upsertResult = await db.bulkUpsertDogs(processedRecords, config.processing.batchSize);

  // Final statistics
  const processingTime = Date.now() - startTime;
  const stats = {
    processingTime: `${Math.round(processingTime / 1000)}s`,
    totalRows: rawRows.length,
    validatedRows: validatedRows.length,
    processableRows: processableRows.length,
    processedRecords: processedRecords.length,
    upsertedRecords: upsertResult.processed,
    validationErrors: validationErrors.length,
    processingErrors: processingErrors.length,
    upsertErrors: upsertResult.errors.length,
    aiCalls,
    postcodeHits: pcHits
  };

  logger.logProcessingEnd('CSV import', stats);

  // Data quality checks
  try {
    const qualityChecks = await db.runDataQualityChecks();
    logger.logDataQuality('missing_names', qualityChecks.missingNames);
    logger.logDataQuality('missing_breeds', qualityChecks.missingBreeds);
    logger.logDataQuality('missing_ages', qualityChecks.missingAges);
    logger.logDataQuality('invalid_urls', qualityChecks.invalidUrls);
    logger.logDataQuality('stale_records', qualityChecks.staleRecords);
    logger.logDataQuality('duplicates', qualityChecks.duplicates);
  } catch (error) {
    logger.warn('Data quality checks failed', { error: error.message });
  }

  await db.disconnect();
}

// CLI: node scripts/import_dogs_enhanced.mjs --limit 50
const argLimit = globalThis.process.argv.includes('--limit')
  ? globalThis.process.argv[globalThis.process.argv.indexOf('--limit') + 1]
  : undefined;

main(argLimit).catch(async (e) => {
  logger.error('Fatal error', {
    error: e.message,
    stack: e.stack,
    type: 'fatal_error'
  });
  await db.disconnect();
  globalThis.process.exit(1);
});
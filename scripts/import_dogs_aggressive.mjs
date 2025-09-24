// scripts/import_dogs_aggressive.mjs - AGGRESSIVE LOCATION RESOLUTION

// --- Load env early and robustly ---
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// libs
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

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

console.log('[env] loaded =', loadedEnvPath || '(none found)');

// --- Read required vars ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY missing');
  process.exit(1);
}
const OPENAI_MODEL_PRIMARY  = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_MODEL_FALLBACK = process.env.OPENAI_FALLBACK_MODEL || 'gpt-4o-mini';
console.log(`Model: ${OPENAI_MODEL_PRIMARY}, key loaded: ${OPENAI_API_KEY.slice(0,6)}…`);

const CSV_PATH = 'data/latest.csv';

// ------------------ CONFIG ------------------

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

// Expanded charity locations
const CHARITY_HOME_LOCATIONS = {
  'hope rescue': { town: 'Pontyclun', county: 'Rhondda Cynon Taf', region: 'Wales' },
  'many tears animal rescue': { town: 'Llanelli', county: 'Carmarthenshire', region: 'Wales' },
  'dogs trust': { town: 'London', county: 'Greater London', region: 'London' },
  'rspca': { town: 'Horsham', county: 'West Sussex', region: 'South East' },
  'battersea': { town: 'London', county: 'Greater London', region: 'London' },
  'blue cross': { town: 'Burford', county: 'Oxfordshire', region: 'South East' }
};

// Manual postcode fallbacks for common problem postcodes
const POSTCODE_FALLBACKS = {
  'NW10': { town: 'Harlesden', county: 'Greater London', region: 'London' },
  'E19': { town: 'London', county: 'Greater London', region: 'London' },
  'CF72': { town: 'Pontyclun', county: 'Rhondda Cynon Taf', region: 'Wales' },
  'SA15': { town: 'Llanelli', county: 'Carmarthenshire', region: 'Wales' }
};

const BANNED_NAMES = ['A Dog For You','A TURBO'];

// ------------------ HELPERS ------------------

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function cleanName(name='') {
  let s = String(name).trim();
  s = s.replace(/^(adopt|meet|say hello to|introducing|about)\s*[:\-]?\s+/i,'');
  s = s.replace(/^my name is(…|\.\.)\s*[\s\u00A0]*/i,''); // Remove "My Name Is…" or "My Name Is.." prefix (including non-breaking spaces) for Staffie & Stray Rescue
  s = s.replace(/\s*[-–—]?\s*(ready for adoption|for adoption|adoption|available|reserved|update.*|at .*)\s*$/i,'');
  s = s.replace(/[\[\(\{].*?[\]\)\}]/g,'');
  s = s.replace(/["""''#*]/g,'').replace(/\s{2,}/g,' ').trim();
  s = s.split(/\s+/).map(w => w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
  return s;
}

function normalizeRegion(region='') {
  const r = String(region).trim();
  if (!r) return '';

  // Normalize inconsistent region names
  const normalizations = {
    'East England': 'East of England',
    'North East England': 'North East',
    'North West England': 'North West',
    'Yorkshire and The Humber': 'Yorkshire and the Humber'
  };

  return normalizations[r] || r;
}

function isValidDogName(raw='') {
  const s = String(raw).trim();
  if (!s) return false;
  for (const b of BANNED_NAMES) if (s.toLowerCase() === b.toLowerCase()) return false;
  if (/(adopt a dog|a dog for you|available dogs|dogs for adoption)/i.test(s)) return false;
  return true;
}

function extractUrlFromCss(str='') {
  const s = String(str).trim();

  // First try to match just url() pattern
  let m = s.match(/url\(['"]?([^'")]+)['"]?\)/i);
  if (m && m[1]) return m[1];

  // Then try background-image: url() pattern
  m = s.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i);
  if (m && m[1]) return m[1];

  // If it's already a plain URL, return it
  if (/^https?:\/\//i.test(s)) return s;

  // Otherwise return the original string
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

function stripLocationLabel(s='') {
  return String(s).replace(/^\s*location\s*[:\-–—\u00A0]\s*/i,'').trim();
}

function onlyTownFromFreeText(s='') {
  const cleaned = stripLocationLabel(s);
  return cleaned.split(',')[0].replace(/\b(near|area|region|district|borough)\b.*$/i,'').trim();
}

function normalizeAge(raw='') {
  const t = String(raw).toLowerCase().replace(/approx\.?|approximately|about|around|~|nearly|roughly/g,'').trim();
  if (!t) return '';
  let m = t.match(/(\d{1,2})\s*(years?|yrs?|yo|y)\b/);
  if (m) { const y=+m[1]; return y===1?'1 year':`${y} years`; }
  m = t.match(/(\d{1,2})\s*(months?|mos?|mo|m)\b/);
  if (m) {
    const mo=+m[1]; if (mo>=12){ const y=Math.round(mo/12); return y===1?'1 year':`${y} years`; }
    return mo===1?'1 month':`${mo} months`;
  }
  m = t.match(/(\d{1,2})\s*(weeks?|wks?|w)\b/);
  if (m) { const wk=+m[1], mo=Math.max(1,Math.round(wk/4)); return mo===1?'1 month':`${mo} months`; }
  m = t.match(/\b(\d{1,2})\b/);
  if (m) { const n=+m[1]; return n===1?'1 year':`${n} years`; }
  return '';
}

function normalizeSex(raw='') {
  const t = String(raw).toLowerCase();
  if (/female|^f\b|bitch|\bshe\b|\bher\b|spayed/.test(t)) return 'Female';
  if (/male|^m\b|\bdog\b|\bhe\b|\bhis\b|neutered/.test(t)) return 'Male';
  return '';
}

function normalizeBreedText(s='') {
  let t = s.toLowerCase();
  t = t.replace(/[\(\)\[\]\{\}]/g,' ');
  t = t.replace(/[\/,]/g,' ');
  t = t.replace(/[^a-z\s-]/g,' ').replace(/\s{2,}/g,' ').trim();
  t = t.replace(/\bcavalier king charles\b/g,'cavalier king charles spaniel');
  t = t.replace(/\bking charles spaniel\b/g,'cavalier king charles spaniel');
  t = t.replace(/\bgsd\b/g,'german shepherd');
  t = t.replace(/\bjack russell\b/g,'jack russell terrier');
  return t;
}

function matchAllowedBreed(raw='') {
  const t = normalizeBreedText(raw);
  if (!t) return '';
  for (const b of ALLOWED_BREEDS) if (t === b.toLowerCase()) return b;
  for (const key in BREED_SYNONYM_MAP) {
    const re = new RegExp(`\\b${key}\\b`,'i');
    if (re.test(t)) return BREED_SYNONYM_MAP[key];
  }
  for (const b of ALLOWED_BREEDS) {
    const re = new RegExp(`\\b${b.replace(/\s+/g,'\\s+')}\\b`,'i');
    if (re.test(t)) return b;
  }
  return '';
}

function detectCross(...texts) {
  const t = texts.join(' ').toLowerCase();
  return /\b(cross|crossbreed|mix|mixed|(^|[^a-z])x([^a-z]|$))\b/.test(t);
}

// ------------- OpenAI (Chat Completions JSON mode) -------------
async function askOpenAIJsonCC({ model, system, user, timeoutMs = 45000 }) {
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
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: ctl.signal
    });
    const js = await resp.json();
    if (!resp.ok) throw new Error(`OpenAI HTTP ${resp.status}: ${JSON.stringify(js)}`);
    const txt = js?.choices?.[0]?.message?.content ?? '';
    return JSON.parse(txt);
  } finally {
    clearTimeout(t);
  }
}

// ENHANCED AI that MUST return location data
async function aiExtractLocation({ postcode, rawTown, charity, description }) {
  const system = `You are a UK location expert. You MUST return location data for UK postcodes and areas.

CRITICAL: If given a valid UK postcode, you MUST extract the town, county, and region. UK postcodes always correspond to specific locations.

Return EXACT JSON format:
{
  "town": "actual town/city name",
  "county": "county or borough name",
  "region": "UK region (London/South East/Wales/Scotland/etc)"
}

NEVER return empty strings - always provide the best available location data.`;

  const user = `Extract UK location for:
Postcode: ${postcode || 'not provided'}
Raw town: ${rawTown || 'not provided'}
Charity: ${charity || 'not provided'}
Description: ${(description || '').slice(0, 500)}

Examples:
- NW10 6BJ = Harlesden, Greater London, London
- E19 4PD = London, Greater London, London
- CF72 9NH = Pontyclun, Rhondda Cynon Taf, Wales

You MUST provide location data. Use your knowledge of UK geography.`;

  for (const [attempt, model] of [[1, OPENAI_MODEL_PRIMARY], [2, OPENAI_MODEL_FALLBACK]]) {
    try {
      const result = await askOpenAIJsonCC({ model, system, user });
      if (result && result.town && result.county && result.region) {
        console.log(`[AI LOCATION] SUCCESS attempt ${attempt}:`, result);
        return result;
      }
      console.log(`[AI LOCATION] Incomplete result attempt ${attempt}:`, result);
    } catch (e) {
      console.warn(`[AI LOCATION] attempt ${attempt} failed:`, e.message);
      await sleep(200 * attempt);
    }
  }

  // If AI fails, return manual fallback
  console.log(`[AI LOCATION] All attempts failed, using manual fallback`);
  return null;
}

// Ask AI for breed/age/sex
async function aiExtractBasics({ name, rawBreed, description, rawAge, rawSex }) {
  const allowedJson = JSON.stringify(ALLOWED_BREEDS);
  const system = 'You extract dog data from UK rescue listings. Return ONE valid JSON object.';
  const user = `
Extract dog information:
- "breed": from allowed list, use "Crossbreed" for mixes, "Unknown" if unclear
- "age": format as "X years" or "X months", "Unknown" if unclear
- "sex": "Male", "Female", or "Unknown"

Return JSON:
{
  "breed": "breed name",
  "age": "formatted age",
  "sex": "Male/Female/Unknown"
}

Allowed breeds: ${allowedJson}

Dog: ${name || ''}
Breed: ${rawBreed || ''}
Age: ${rawAge || ''}
Sex: ${rawSex || ''}
Description: ${(description || '').slice(0, 1000)}
`.trim();

  for (const [attempt, model] of [[1, OPENAI_MODEL_PRIMARY], [2, OPENAI_MODEL_FALLBACK]]) {
    try {
      const result = await askOpenAIJsonCC({ model, system, user });
      if (result && typeof result.breed === 'string' && typeof result.age === 'string' && typeof result.sex === 'string') {
        return result;
      }
    } catch (e) {
      console.warn(`[AI BASICS] attempt ${attempt} failed:`, e.message);
      await sleep(200 * attempt);
    }
  }
  return null;
}

// ------------- postcodes.io lookup -------------
async function lookupPostcode(postcode) {
  if (!postcode) return null;

  const cleanPC = postcode.toString().toUpperCase().trim().replace(/\s+/g, ' ');
  console.log(`[POSTCODE] Looking up: "${cleanPC}"`);

  try {
    const resp = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPC)}`);
    const js = await resp.json();

    if (resp.status === 200 && js.result) {
      const result = {
        town: js.result.post_town || '',
        county: js.result.admin_county || js.result.admin_district || js.result.admin_ward || '',
        region: js.result.region || js.result.country || ''
      };
      console.log(`[POSTCODE] SUCCESS:`, result);
      return result;
    } else {
      console.log(`[POSTCODE] Failed: ${resp.status}`);
      return null;
    }
  } catch (e) {
    console.warn(`[POSTCODE] Error:`, e.message);
    return null;
  }
}

// ------------- AGGRESSIVE location resolution -------------
async function resolveLocationAggressively({ rawTown, rawPostcode, charity, description }) {
  console.log(`\n[LOCATION] Starting aggressive resolution...`);
  console.log(`[LOCATION] Inputs: postcode="${rawPostcode}", town="${rawTown}", charity="${charity}"`);

  // Override location for Dogs In Distress charity
  if (charity && charity.toLowerCase().includes('dogs in distress')) {
    console.log(`[LOCATION] ✅ Override for Dogs In Distress - using Dublin, Ireland`);
    return {
      town: 'Dublin',
      county: 'Dublin',
      region: 'Ireland',
      source: 'override'
    };
  }

  let town = '', county = '', region = '';

  // 1) Try postcodes.io first
  if (rawPostcode) {
    const pcResult = await lookupPostcode(rawPostcode);
    if (pcResult && pcResult.town) {
      console.log(`[LOCATION] ✅ postcodes.io provided complete data`);
      return {
        town: pcResult.town,
        county: pcResult.county,
        region: pcResult.region,
        source: 'postcodes.io'
      };
    }
  }

  // 2) Try AI location extraction (ALWAYS call for postcodes)
  if (rawPostcode) {
    console.log(`[LOCATION] postcodes.io failed, trying AI for postcode...`);
    const aiResult = await aiExtractLocation({
      postcode: rawPostcode,
      rawTown,
      charity,
      description
    });

    if (aiResult && aiResult.town) {
      console.log(`[LOCATION] ✅ AI provided location data`);
      return {
        town: aiResult.town,
        county: aiResult.county,
        region: aiResult.region,
        source: 'AI'
      };
    }
  }

  // 3) Try postcode prefix fallback
  if (rawPostcode) {
    const prefix = rawPostcode.toString().toUpperCase().trim().split(/\s+/)[0];
    const fallback = POSTCODE_FALLBACKS[prefix];
    if (fallback) {
      console.log(`[LOCATION] ✅ Using postcode prefix fallback for ${prefix}`);
      return {
        town: fallback.town,
        county: fallback.county,
        region: fallback.region,
        source: 'postcode_fallback'
      };
    }
  }

  // 4) Try charity fallback
  if (charity) {
    const charityKey = charity.toLowerCase();
    const charityLocation = CHARITY_HOME_LOCATIONS[charityKey];
    if (charityLocation) {
      console.log(`[LOCATION] ✅ Using charity fallback for "${charity}"`);
      return {
        town: charityLocation.town,
        county: charityLocation.county,
        region: charityLocation.region,
        source: 'charity'
      };
    }
  }

  // 5) Try raw town + AI if we have something
  if (rawTown) {
    console.log(`[LOCATION] Trying AI with raw town...`);
    const aiResult = await aiExtractLocation({
      postcode: '',
      rawTown,
      charity,
      description
    });

    if (aiResult && aiResult.town) {
      console.log(`[LOCATION] ✅ AI provided data from raw town`);
      return {
        town: aiResult.town,
        county: aiResult.county,
        region: aiResult.region,
        source: 'AI_from_town'
      };
    }
  }

  console.log(`[LOCATION] ❌ All methods failed - no location data available`);
  return {
    town: '',
    county: '',
    region: '',
    source: 'failed'
  };
}

// ------------- CSV -------------
async function readCsvRows(limit = Infinity) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(CSV_PATH)
      .on('error', reject)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (rec) => {
        if (rows.length < limit) rows.push(rec);
      })
      .on('end', () => resolve(rows));
  });
}

function stableId(link='', image='', name='', charity='') {
  const s = `${(link||'').toLowerCase()}|${(image||'').toLowerCase()}|${(name||'').toLowerCase()}|${(charity||'').toLowerCase()}`;
  let h = 0; for (let i=0;i<s.length;i++){ h = ((h<<5)-h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(16);
}

function ageCategory(age='') {
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

// ------------- SEO GENERATION -------------
function generateSeoSlug(name, charity, externalId) {
  // Format: "name-charity-uniquereferencenumber"
  const cleanName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '-'); // Spaces to hyphens

  const cleanCharity = charity.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '-'); // Spaces to hyphens

  const slug = `${cleanName}-${cleanCharity}-${externalId}`;

  return slug
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 100); // Reasonable length limit
}

function generateSeoTitle(name, age, breed, town, county) {
  // Format: "Meet 'Name' - 'Age' 'Breed' in 'Town', 'County'"
  let title = `Meet ${name}`;

  const details = [];
  if (age && age !== 'Unknown') details.push(age);
  if (breed && breed !== 'Unknown') details.push(breed);

  if (details.length > 0) {
    title += ` - ${details.join(' ')}`;
  }

  const locationParts = [];
  if (town) locationParts.push(town);
  if (county) locationParts.push(county);

  if (locationParts.length > 0) {
    title += ` in ${locationParts.join(', ')}`;
  }

  return title;
}

function generateSeoDescription(name, age, breed, town, county) {
  // Format: "'Name' is a 'Age' 'Breed' looking for a loving home in 'Town', 'County'"
  let desc = `${name} is a`;

  const details = [];
  if (age && age !== 'Unknown') details.push(age);
  if (breed && breed !== 'Unknown') details.push(breed);

  if (details.length > 0) {
    desc += ` ${details.join(' ')}`;
  } else {
    desc += ` lovely dog`;
  }

  desc += ` looking for a loving home`;

  const locationParts = [];
  if (town) locationParts.push(town);
  if (county) locationParts.push(county);

  if (locationParts.length > 0) {
    desc += ` in ${locationParts.join(', ')}`;
  }

  desc += `.`;

  return desc;
}

// ------------------ MAIN ------------------
async function main(limitArg) {
  const limit = Number.isFinite(+limitArg) ? +limitArg : Infinity;
  const rawRows = await readCsvRows(limit);
  console.log(`Loaded ${rawRows.length} rows from CSV at ${CSV_PATH}`);

  let aiCalls = 0, locationSuccesses = 0, upserts = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (!isValidDogName(r.name)) {
      console.log(`skip row ${i+1}: invalid name`);
      continue;
    }

    // Filter for Staffie & Stray Rescue only
    const charityName = String(r.charity || '').trim();
    if (!charityName.toLowerCase().includes('staffie & stray rescue')) {
      continue;
    }

    console.log(`\n=== Processing row ${i+1}: ${r.name} (${r.charity}) ===`);

    let name = cleanName(r.name || '');
    const charity = String(r.charity || '').trim();

    // Remove >> suffix specifically for Ashbourne Animal Welfare
    if (charity.toLowerCase().includes('ashbourne animal welfare') && name.endsWith('>>')) {
      name = name.slice(0, -2).trim();
    }
    const link = (r.link || '').toString().trim();

    let image = absolutizeImageUrl(r.image || '', link, charity);
    if (!/^https?:\/\//i.test(image)) image = '';

    // Quick normalization
    let age = normalizeAge(r.age || '');
    let sex = normalizeSex(r.sex || '');
    let breed = matchAllowedBreed(r.breed || '');

    // Use AI for missing breed/age/sex data
    const needBasicAI = !breed || !age || !sex || detectCross(r.breed, r.description);
    if (needBasicAI) {
      console.log(`[ROW ${i+1}] Getting basic data from AI...`);
      const basics = await aiExtractBasics({
        name,
        rawBreed: r.breed,
        description: r.description,
        rawAge: r.age,
        rawSex: r.sex
      });
      aiCalls++;

      if (basics) {
        if (!breed && basics.breed && ALLOWED_BREEDS.includes(basics.breed)) {
          breed = basics.breed;
        }
        if (!age && basics.age) age = basics.age;
        if (!sex && basics.sex) sex = basics.sex;
      }
    }

    // AGGRESSIVE location resolution - ALWAYS try to get location
    const locationResult = await resolveLocationAggressively({
      rawTown: r.town,
      rawPostcode: r.postcode,
      charity,
      description: r.description
    });

    if (locationResult.town) {
      locationSuccesses++;
    }

    // Final fallbacks
    if (!breed) breed = detectCross(r.breed, r.description) ? 'Crossbreed' : 'Unknown';
    if (!age) age = 'Unknown';
    if (!sex) sex = 'Unknown';

    // Generate SEO fields
    const externalId = stableId(link, image, name, charity);
    const seoSlug = generateSeoSlug(name, charity, externalId);
    const seoTitle = generateSeoTitle(name, age, breed, locationResult.town, locationResult.county);
    const seoDesc = generateSeoDescription(name, age, breed, locationResult.town, locationResult.county);

    const rec = {
      externalId,
      name,
      imageUrl: image,
      link,
      age,
      sex,
      breed,
      location: locationResult.town || '',
      county: locationResult.county || '',
      region: normalizeRegion(locationResult.region) || '',
      charity,
      description: r.description || '',
      scrapedDate: r.date ? new Date(r.date) : null,
      ageCategory: ageCategory(age),
      seoSlug,
      seoTitle,
      seoDesc,
      lastSeen: new Date()
    };

    console.log(`[ROW ${i+1}] FINAL: "${rec.location}", "${rec.county}", "${rec.region}" (source: ${locationResult.source})`);
    console.log(`[ROW ${i+1}] SEO: slug="${seoSlug}", title="${seoTitle.slice(0,40)}..."`);

    try {
      await prisma.dog.upsert({
        where: { externalId: rec.externalId },
        update: rec,
        create: rec
      });
      upserts++;
      console.log(`[ROW ${i+1}] ✅ Saved to database`);
    } catch (e) {
      console.error(`[ROW ${i+1}] ❌ Database error:`, e.message);
    }

    await sleep(110);
    if ((i+1) % 5 === 0) {
      console.log(`\n--- Progress: ${i+1}/${rawRows.length} (AI: ${aiCalls}, locations: ${locationSuccesses}/${i+1}, saved: ${upserts}) ---`);
    }
  }

  console.log(`\n🎉 DONE! Total: ${rawRows.length}, AI: ${aiCalls}, locations: ${locationSuccesses}, saved: ${upserts}`);
  await prisma.$disconnect();
}

// CLI
const argLimit = globalThis.process.argv.includes('--limit')
  ? globalThis.process.argv[globalThis.process.argv.indexOf('--limit') + 1]
  : undefined;

main(argLimit).catch(async (e) => {
  console.error('Fatal:', e);
  await prisma.$disconnect();
  globalThis.process.exit(1);
});
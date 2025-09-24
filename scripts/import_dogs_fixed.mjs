// scripts/import_dogs_fixed.mjs - FIXED VERSION with better location handling

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
  path.resolve(process.cwd(), '.env'), // when run from project root (npm run …)
  path.resolve(__dirname, '..', '.env'), // parent of /scripts
  path.resolve(__dirname, '.env'), // same folder as script (just in case)
];

let loadedEnvPath = null;
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    loadedEnvPath = p;
    break;
  }
}

// Debug prints so we can see what's going on
console.log('[env] cwd =', process.cwd());
console.log('[env] tried =', envCandidates);
console.log('[env] loaded =', loadedEnvPath || '(none found)');

// --- Read required vars ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY missing. Create a .env in your project root with:');
  console.error('   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx');
  process.exit(1);
}
const OPENAI_MODEL_PRIMARY  = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_MODEL_FALLBACK = process.env.OPENAI_FALLBACK_MODEL || 'gpt-4o-mini';
console.log(`Model: ${OPENAI_MODEL_PRIMARY}, key loaded: ${OPENAI_API_KEY.slice(0,6)}…`);

// --- Files ---
const CSV_PATH = 'data/latest.csv';

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

// Enhanced charity home locations (adding Hope Rescue)
const CHARITY_HOME_LOCATIONS = {
  'hope rescue': { town: 'Pontyclun', county: 'Rhondda Cynon Taf', region: 'Wales' },
  'many tears animal rescue': { town: 'Llanelli', county: 'Carmarthenshire', region: 'Wales' },
  'dogs trust': { town: 'London', county: 'Greater London', region: 'London' },
  'rspca': { town: 'Horsham', county: 'West Sussex', region: 'South East' }
};

const BANNED_NAMES = ['A Dog For You','A TURBO'];

// ------------------ HELPERS ------------------

const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

function cleanName(name='') {
  let s = String(name).trim();
  s = s.replace(/^(adopt|meet|say hello to|introducing|about)\s*[:\-]?\s+/i,'');
  s = s.replace(/\s*[-–—]?\s*(ready for adoption|for adoption|adoption|available|reserved|update.*|at .*)\s*$/i,'');
  s = s.replace(/[\[\(\{].*?[\]\)\}]/g,'');
  s = s.replace(/["""''#*]/g,'').replace(/\s{2,}/g,' ').trim();
  s = s.split(/\s+/).map(w => w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
  return s;
}

function isValidDogName(raw='') {
  const s = String(raw).trim();
  if (!s) return false;
  for (const b of BANNED_NAMES) if (s.toLowerCase() === b.toLowerCase()) return false;
  if (/(adopt a dog|a dog for you|available dogs|dogs for adoption)/i.test(s)) return false;
  return true;
}

// CSS url(...) or background-image: url('...')
function extractUrlFromCss(str='') {
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

  return img; // last resort; we blank non-absolute later
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

  for (const [attempt, model] of [[1, OPENAI_MODEL_PRIMARY],[2, OPENAI_MODEL_PRIMARY],[3, OPENAI_MODEL_FALLBACK]]) {
    try {
      const j = await askOpenAIJsonCC({ model, system, user });
      if (j && typeof j.breed === 'string' && typeof j.age === 'string' &&
          typeof j.sex === 'string' && typeof j.town === 'string' &&
          typeof j.county === 'string' && typeof j.region === 'string') {
        return j;
      }
      throw new Error('Could not parse JSON');
    } catch (e) {
      console.warn(`[AI warn] [extract-all] ${model} attempt ${attempt} failed: ${e.message || e}`);
      await sleep(300 * attempt);
    }
  }
  return null;
}

// ------------- ENHANCED postcodes.io (single postcode lookup) -------------
async function lookupSinglePostcode(postcode) {
  if (!postcode) return null;

  const cleanPC = postcode.toString().toUpperCase().trim().replace(/\s+/g, ' ');

  console.log(`[POSTCODE DEBUG] Looking up: "${cleanPC}"`);

  try {
    const resp = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPC)}`);
    const js = await resp.json();

    console.log(`[POSTCODE DEBUG] Response status: ${resp.status}`);

    if (resp.status === 200 && js.result) {
      const result = {
        town: js.result.post_town || '',
        county: js.result.admin_county || js.result.admin_district || js.result.admin_ward || '',
        region: js.result.region || js.result.country || '',
        country: js.result.country || ''
      };

      console.log(`[POSTCODE DEBUG] Found data:`, result);
      return result;
    } else if (resp.status === 404) {
      console.log(`[POSTCODE DEBUG] Postcode not found: ${cleanPC}`);
      return null;
    } else {
      console.warn(`[POSTCODE DEBUG] API error: ${resp.status} - ${JSON.stringify(js)}`);
      return null;
    }
  } catch (e) {
    console.warn(`[POSTCODE DEBUG] Lookup failed for ${cleanPC}:`, e.message);
    return null;
  }
}

// ------------- ENHANCED location resolution -------------
function resolveLocation({ rawTown, pcRow, aiLoc, charity }) {
  console.log(`[LOCATION DEBUG] Resolving location for charity: "${charity}"`);
  console.log(`[LOCATION DEBUG] Raw inputs:`, {
    rawTown: rawTown || '(empty)',
    pcRow: pcRow || '(no postcode data)',
    aiLoc: aiLoc || '(no AI data)',
    charity: charity || '(no charity)'
  });

  // 1) Start with scraped town (sanitize)
  let town = onlyTownFromFreeText(rawTown || '');
  let county = '';
  let region = '';

  console.log(`[LOCATION DEBUG] Initial town from raw: "${town}"`);

  // 2) postcodes.io wins if we have it (HIGHEST PRIORITY)
  if (pcRow) {
    console.log(`[LOCATION DEBUG] Using postcode data:`, pcRow);
    town = pcRow.town || town;
    county = pcRow.county || county;
    region = pcRow.region || region;
  }

  // 3) if anything is missing, use AI values
  if (aiLoc) {
    console.log(`[LOCATION DEBUG] AI suggested:`, aiLoc);
    if (!town && aiLoc.town) {
      console.log(`[LOCATION DEBUG] Using AI town: "${aiLoc.town}"`);
      town = aiLoc.town;
    }
    if (!county && aiLoc.county) {
      console.log(`[LOCATION DEBUG] Using AI county: "${aiLoc.county}"`);
      county = aiLoc.county;
    }
    if (!region && aiLoc.region) {
      console.log(`[LOCATION DEBUG] Using AI region: "${aiLoc.region}"`);
      region = aiLoc.region;
    }
  }

  // 4) charity home fallback if still blank
  if ((!town || !county || !region) && charity) {
    const charityKey = charity.toLowerCase();
    const home = CHARITY_HOME_LOCATIONS[charityKey];
    console.log(`[LOCATION DEBUG] Checking charity "${charityKey}" for fallback location:`, home);

    if (home) {
      if (!town && home.town) {
        console.log(`[LOCATION DEBUG] Using charity town: "${home.town}"`);
        town = home.town;
      }
      if (!county && home.county) {
        console.log(`[LOCATION DEBUG] Using charity county: "${home.county}"`);
        county = home.county;
      }
      if (!region && home.region) {
        console.log(`[LOCATION DEBUG] Using charity region: "${home.region}"`);
        region = home.region;
      }
    }
  }

  // 5) last cleanups
  if (town && county && town.toLowerCase() === String(county).toLowerCase()) town = '';
  if (town && region && town.toLowerCase() === String(region).toLowerCase()) town = '';
  if (/^[A-Z]{1,2}\d{1,2}[A-Z]?$/.test(town)) town = '';

  const final = { town, county, region };
  console.log(`[LOCATION DEBUG] Final result:`, final);

  return final;
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

// ------------- IDs & derived -------------
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

// ------------------ MAIN ------------------
async function main(limitArg) {
  const limit = Number.isFinite(+limitArg) ? +limitArg : Infinity;
  const rawRows = await readCsvRows(limit);
  console.log(`Loaded ${rawRows.length} rows from CSV at ${CSV_PATH}`);

  let aiCalls = 0, pcHits = 0, upserts = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (!isValidDogName(r.name)) { console.log(`skip row ${i+1}: invalid name`); continue; }

    console.log(`\n--- Processing row ${i+1}: ${r.name} (${r.charity}) ---`);

    const name = cleanName(r.name || '');
    const charity = String(r.charity || '').trim();
    const link = (r.link || '').toString().trim();

    let image = absolutizeImageUrl(r.image || '', link, charity);
    if (!/^https?:\/\//i.test(image)) image = ''; // blank non-absolute

    // Quick rules
    let age = normalizeAge(r.age || '');
    let sex = normalizeSex(r.sex || '');
    let breed = matchAllowedBreed(r.breed || '');

    // ENHANCED postcode lookup
    const rawPostcode = (r.postcode || '').toString().trim();
    console.log(`[ROW ${i+1}] Raw postcode: "${rawPostcode}"`);

    let pcRow = null;
    if (rawPostcode) {
      pcRow = await lookupSinglePostcode(rawPostcode);
      if (pcRow) {
        pcHits++;
        console.log(`[ROW ${i+1}] Postcode lookup SUCCESS`);
      } else {
        console.log(`[ROW ${i+1}] Postcode lookup FAILED`);
      }
    }

    // AI for all extractions (breed/age/sex + town/county/region) when needed
    const needAI =
      !breed || breed === 'Unknown' || detectCross(r.breed, r.description) ||
      !age || !sex || !onlyTownFromFreeText(r.town || '') || !pcRow;

    let aiLoc = null;
    if (needAI) {
      console.log(`[ROW ${i+1}] Calling AI for extraction...`);
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
        console.log(`[ROW ${i+1}] AI extraction result:`, aiLoc);
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

    console.log(`[ROW ${i+1}] Final location: town="${rec.location}", county="${rec.county}", region="${rec.region}"`);

    try {
      await prisma.dog.upsert({
        where: { externalId: rec.externalId },
        update: rec,
        create: rec
      });
      upserts++;
    } catch (e) {
      console.error(`Row ${i+1} upsert failed:`, e.message);
    }

    await sleep(110); // gentle pacing for API calls
    if ((i+1) % 10 === 0) console.log(`.. processed ${i+1}/${rawRows.length} (AI: ${aiCalls}, postcodes: ${pcHits}, upserts: ${upserts})`);
  }

  console.log(`Done. Total: ${rawRows.length}, AI: ${aiCalls}, postcodes: ${pcHits}, upserts: ${upserts}`);
  await prisma.$disconnect();
}

// CLI: node scripts/import_dogs_fixed.mjs --limit 50
const argLimit = globalThis.process.argv.includes('--limit')
  ? globalThis.process.argv[globalThis.process.argv.indexOf('--limit') + 1]
  : undefined;

main(argLimit).catch(async (e) => {
  console.error('Fatal:', e);
  await prisma.$disconnect();
  globalThis.process.exit(1);
});
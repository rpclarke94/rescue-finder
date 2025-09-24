// scripts/export_dogs.mjs
import 'dotenv/config';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function csvEscape(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

async function main() {
  const dogs = await prisma.dog.findMany({
    orderBy: [{ lastSeen: 'desc' }, { name: 'asc' }],
  });

  const headers = [
    'id',
    'externalId',
    'name',
    'breed',
    'age',
    'sex',
    'ageCategory',
    'location',
    'county',
    'region',
    'charity',
    'imageUrl',
    'link',
    'scrapedDate',
    'lastSeen',
    'description',
  ];

  const lines = [];
  lines.push(headers.join(','));

  for (const d of dogs) {
    const row = headers.map((h) => {
      let val = d[h];
      if (val instanceof Date) val = val.toISOString();
      return csvEscape(val);
    });
    lines.push(row.join(','));
  }

  const outPath = 'dogs_export.csv';
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`✅ Exported ${dogs.length} dogs to ${outPath}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Export failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});

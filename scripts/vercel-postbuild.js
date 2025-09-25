#!/usr/bin/env node

console.log('=== Vercel Post-build Script ===')
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 30))

// Check if we have a valid DATABASE_URL
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
  console.log('⚠️  DATABASE_URL not properly set, skipping migrations')
  console.log('This is normal for preview deployments without database access')
  process.exit(0)
}

// Run migration
const { execSync } = require('child_process')

try {
  console.log('🔄 Running Prisma migrate deploy...')
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  })
  console.log('✅ Migration completed successfully')
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  // Don't fail the build if migration fails
  console.log('⚠️  Continuing with build despite migration failure')
}
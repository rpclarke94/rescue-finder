import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test basic connection
    console.log('Testing database connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20))

    // Try to connect and get a simple count
    const count = await prisma.dog.count()
    console.log(`Database connection successful. Found ${count} dogs.`)

    // Get a few sample dogs to verify data
    const sampleDogs = await prisma.dog.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        breed: true,
        charity: true
      }
    })

    return NextResponse.json({
      success: true,
      count,
      sampleDogs,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...'
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...'
    }, { status: 500 })
  }
}
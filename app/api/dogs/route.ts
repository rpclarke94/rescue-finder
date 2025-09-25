import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Fetching dogs from database...')
    const dogs = await prisma.dog.findMany({
      orderBy: [
        { lastSeen: 'desc' },
        { name: 'asc' }
      ]
      // Removed limit to show all dogs
    })
    console.log(`Found ${dogs.length} dogs in database`)

    const formattedDogs = dogs.map(dog => ({
      ...dog,
      id: dog.id.toString()
    }))

    // Get the most recent lastSeen date
    const mostRecentUpdate = dogs.length > 0 ? dogs[0].lastSeen : null

    return NextResponse.json({
      dogs: formattedDogs,
      lastUpdated: mostRecentUpdate
    })
  } catch (error) {
    console.error('Error fetching dogs:', error)
    return NextResponse.json({ error: 'Failed to fetch dogs' }, { status: 500 })
  }
}
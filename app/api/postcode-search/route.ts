import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Get coordinates for a postcode using postcodes.io
async function getPostcodeCoordinates(postcode: string) {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`)
    if (!response.ok) return null

    const data = await response.json()
    if (data.status === 200 && data.result) {
      return {
        latitude: data.result.latitude,
        longitude: data.result.longitude
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching postcode coordinates:', error)
    return null
  }
}

// Get coordinates for multiple postcodes in bulk
async function getBulkPostcodeCoordinates(postcodes: string[]) {
  try {
    const response = await fetch('https://api.postcodes.io/postcodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postcodes: postcodes })
    })

    if (!response.ok) return {}

    const data = await response.json()
    const coordinates: { [key: string]: { latitude: number; longitude: number } } = {}

    if (data.status === 200 && data.result) {
      data.result.forEach((item: any) => {
        if (item.result && item.query) {
          coordinates[item.query] = {
            latitude: item.result.latitude,
            longitude: item.result.longitude
          }
        }
      })
    }

    return coordinates
  } catch (error) {
    console.error('Error fetching bulk postcode coordinates:', error)
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postcode, radius = 25 } = await request.json()

    if (!postcode) {
      return NextResponse.json({ error: 'Postcode is required' }, { status: 400 })
    }

    // Get coordinates for the search postcode
    const searchCoords = await getPostcodeCoordinates(postcode.trim().toUpperCase())
    if (!searchCoords) {
      return NextResponse.json({ error: 'Invalid postcode' }, { status: 400 })
    }

    // Get all dogs from database
    const dogs = await prisma.dog.findMany()

    // Extract unique locations from dogs (using town, county data)
    const dogLocations = [...new Set(
      dogs
        .map(dog => {
          // Create location string from available data
          if (dog.location) return dog.location
          if (dog.county) return dog.county
          if (dog.region) return dog.region
          return null
        })
        .filter(Boolean)
    )] as string[]

    // Try to find postcodes for each location using a mapping or geocoding
    const locationCoordinates: { [key: string]: { latitude: number; longitude: number } } = {}

    // For now, let's try to get coordinates for locations by using them as search terms
    // This is a simplified approach - in production you'd want a proper location database
    for (const location of dogLocations) {
      try {
        // Try to find a postcode for this location using postcodes.io search
        const searchResponse = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(location)}`)
        if (searchResponse.ok) {
          const data = await searchResponse.json()
          if (data.status === 200 && data.result && data.result.length > 0) {
            const firstResult = data.result[0]
            locationCoordinates[location] = {
              latitude: firstResult.latitude,
              longitude: firstResult.longitude
            }
          }
        }
      } catch (error) {
        console.log(`Could not find coordinates for location: ${location}`)
      }
    }

    // Filter dogs by distance
    const dogsWithinRadius = dogs.filter(dog => {
      // Determine the location for this dog
      const dogLocation = dog.location || dog.county || dog.region
      if (!dogLocation) return false

      const dogCoords = locationCoordinates[dogLocation]
      if (!dogCoords) return false

      const distance = calculateDistance(
        searchCoords.latitude,
        searchCoords.longitude,
        dogCoords.latitude,
        dogCoords.longitude
      )

      return distance <= radius
    })

    return NextResponse.json({
      dogs: dogsWithinRadius,
      searchPostcode: postcode.trim().toUpperCase(),
      searchCoords,
      radius,
      totalFound: dogsWithinRadius.length
    })

  } catch (error) {
    console.error('Postcode search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
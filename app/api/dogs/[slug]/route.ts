import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const dog = await prisma.dog.findFirst({
      where: { seoSlug: resolvedParams.slug }
    })

    if (!dog) {
      return NextResponse.json(
        { error: 'Dog not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(dog)
  } catch (error) {
    console.error('Error fetching dog:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
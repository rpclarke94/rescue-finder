import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  message: string
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContactFormData

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!body.email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }


    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (body.message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }


    // Sanitize input data
    const sanitizedData = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      message: body.message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ip: request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'Unknown'
    }

    // For now, we'll just log the contact form submission
    // In production, you would typically:
    // 1. Send an email using a service like SendGrid, SES, or Resend
    // 2. Store the submission in a database
    // 3. Send confirmation emails to both user and admin

    console.log('Contact form submission:', {
      ...sanitizedData,
      ip: sanitizedData.ip.split(',')[0] // Only log first IP for privacy
    })

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Return success response
    return NextResponse.json(
      {
        message: 'Message sent successfully',
        data: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          timestamp: sanitizedData.timestamp
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS preflight (if needed)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
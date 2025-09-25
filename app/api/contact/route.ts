import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Send email using Resend
    try {
      await resend.emails.send({
        from: 'contact@rescuefinder.co.uk', // Now verified in Resend
        to: [process.env.CONTACT_EMAIL || 'your-email@example.com'], // Your email address
        subject: `New Contact Form Message from ${sanitizedData.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${sanitizedData.name} (${sanitizedData.email})</p>
          <p><strong>Time:</strong> ${new Date(sanitizedData.timestamp).toLocaleString()}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${sanitizedData.message.replace(/\n/g, '<br>')}
          </div>
          <hr>
          <p style="color: #666; font-size: 12px;">
            IP: ${sanitizedData.ip.split(',')[0]}<br>
            User Agent: ${sanitizedData.userAgent}
          </p>
        `,
        text: `
New Contact Form Message

From: ${sanitizedData.name} (${sanitizedData.email})
Time: ${new Date(sanitizedData.timestamp).toLocaleString()}

Message:
${sanitizedData.message}

---
IP: ${sanitizedData.ip.split(',')[0]}
User Agent: ${sanitizedData.userAgent}
        `
      })

      console.log('Contact form email sent successfully')
    } catch (emailError) {
      console.error('Failed to send contact form email:', emailError)
      // Don't fail the request if email fails - still log the submission
    }

    console.log('Contact form submission:', {
      ...sanitizedData,
      ip: sanitizedData.ip.split(',')[0] // Only log first IP for privacy
    })

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
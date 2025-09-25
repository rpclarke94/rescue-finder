import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  try {
    console.log('=== Email Test Debug ===')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_API_KEY starts with:', process.env.RESEND_API_KEY?.substring(0, 5))
    console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL)

    // Test email send
    const result = await resend.emails.send({
      from: 'contact@rescuefinder.co.uk',
      to: [process.env.CONTACT_EMAIL || 'test@example.com'],
      subject: 'Test Email from Rescue Finder',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the email functionality is working.</p>
        <p>If you received this, your contact form should be working!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
      text: `
Test Email

This is a test email to verify the email functionality is working.
If you received this, your contact form should be working!

Time: ${new Date().toLocaleString()}
      `
    })

    console.log('Email send result:', result)

    return NextResponse.json({
      success: true,
      result,
      config: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        contactEmail: process.env.CONTACT_EMAIL,
        from: 'contact@rescuefinder.co.uk'
      }
    })

  } catch (error) {
    console.error('Email test failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        contactEmail: process.env.CONTACT_EMAIL,
        from: 'contact@rescuefinder.co.uk'
      }
    }, { status: 500 })
  }
}
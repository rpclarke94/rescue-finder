import { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us - Rescue Finder',
  description: 'Get in touch with Rescue Finder. Ask questions about adopting a rescue dog or find out how to add your rescue organization.',
  openGraph: {
    title: 'Contact Us - Rescue Finder',
    description: 'Get in touch with Rescue Finder. Ask questions about adopting a rescue dog or find out how to add your rescue organization.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us - Rescue Finder',
    description: 'Get in touch with Rescue Finder. Ask questions about adopting a rescue dog or find out how to add your rescue organization.',
  }
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-content py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-300 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Have questions about adopting a rescue dog? Want to add your rescue organization to our platform?
              We'd love to hear from you!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                  Get in Touch
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">For Rescue Organizations</h3>
                      <p className="text-slate-600">Want to list your dogs on our platform? We'd love to partner with you!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl">
                <p className="text-slate-600 mb-4">
                  Please note, we cannot respond to emails regarding adopting any of the dogs you may have found on Rescue Finder. For such inquiries, please contact the charity directly.
                </p>
                <p className="text-slate-600">
                  If you are a charity and would like to add any dogs you have available to Rescue Finder, please contact us and we will get back to you as soon as possible.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Send us a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
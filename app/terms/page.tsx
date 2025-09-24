import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions - Rescue Finder',
  description: 'Terms and conditions for using Rescue Finder, the UK\'s directory of adoptable rescue dogs.',
  openGraph: {
    title: 'Terms & Conditions - Rescue Finder',
    description: 'Terms and conditions for using Rescue Finder, the UK\'s directory of adoptable rescue dogs.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms & Conditions - Rescue Finder',
    description: 'Terms and conditions for using Rescue Finder, the UK\'s directory of adoptable rescue dogs.',
  }
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-content py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-300 mb-4">
              Terms & Conditions
            </h1>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-slate-600 mb-8">
                <strong>Effective Date:</strong> 11/06/2025
              </p>

              <p className="text-slate-700 leading-relaxed mb-8">
                Welcome to Rescue Finder. By accessing or using this website, you agree to be bound by the following Terms and Conditions. If you do not agree, please do not use the site.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Use of This Website</h2>
              <p className="text-slate-700 leading-relaxed mb-8">
                Rescue Finder provides a directory of dogs available for adoption across various rescue organizations in the UK. This site is for informational purposes only. We do not directly facilitate adoptions, nor are we affiliated with the organizations whose listings appear here.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Accuracy of Information</h2>
              <p className="text-slate-700 leading-relaxed mb-8">
                We aim to keep all listings up to date, but we cannot guarantee that all information (including age, breed, availability, or contact details) is accurate, complete, or current. We recommend visiting the linked rescue centre website directly before taking action on any listing.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Third-Party Content and Links</h2>
              <p className="text-slate-700 leading-relaxed mb-8">
                Rescue Finder aggregates information from third-party organizations. We are not responsible for the policies, actions, or practices of any rescue centre or third-party website. Visiting these sites is at your own discretion.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Intellectual Property</h2>
              <p className="text-slate-700 leading-relaxed mb-8">
                All content on this website, including branding, original illustrations, layout, and structure, is the property of Rescue Finder unless otherwise stated. You may not reproduce or redistribute any material from this site without written permission.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Rescue Finder is not responsible for:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-8 ml-4">
                <li>Unsuccessful adoption attempts</li>
                <li>Misinformation in listings</li>
                <li>Any loss or damage resulting from reliance on site content</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-8">
                Use of this website is at your own risk.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Changes to These Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-8">
                We may update these Terms and Conditions at any time without notice. Your continued use of the site constitutes acceptance of any changes.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Contact</h2>
              <p className="text-slate-700 leading-relaxed">
                For questions, concerns, or requests regarding these terms, please <a href="/contact" className="text-blue-600 hover:text-blue-700 underline">contact us here</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
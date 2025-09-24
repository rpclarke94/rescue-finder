import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Rescue Finder',
  description: 'Privacy policy for Rescue Finder, explaining how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy - Rescue Finder',
    description: 'Privacy policy for Rescue Finder, explaining how we collect, use, and protect your personal information.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - Rescue Finder',
    description: 'Privacy policy for Rescue Finder, explaining how we collect, use, and protect your personal information.',
  }
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-content py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-300 mb-4">
              Privacy Policy
            </h1>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-slate-600 mb-8">
                <p><strong>Effective Date:</strong> 11/06/2025</p>
                <p><strong>Last Updated:</strong> 11/06/2025</p>
              </div>

              <p className="text-slate-700 leading-relaxed mb-8">
                This Privacy Policy explains how Rescue Finder ("we", "our", or "us") collects, uses, and protects your personal information when you use our website.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Who We Are</h2>
              <p className="text-slate-700 leading-relaxed mb-8">
                Rescue Finder is a UK-based website that helps users discover dogs available for adoption from rescue charities across the UK.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. What Personal Data We Collect</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may collect and process the following information:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 ml-4">
                <li><strong>Contact Information</strong> – if you submit a form or email us</li>
                <li><strong>Technical Information</strong> – such as IP address, browser type, and pages visited (via analytics tools)</li>
                <li><strong>Cookies</strong> – small files used to improve your experience</li>
                <li><strong>Usage Data</strong> – how users interact with the website</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-8">
                We do not collect sensitive personal data.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Collect It</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect data in the following ways:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-8 ml-4">
                <li>When you contact us via a form or email</li>
                <li>When you browse the site (via cookies or analytics)</li>
                <li>When third-party tools handle your interaction with the website</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Why We Collect It</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use your data to:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-8 ml-4">
                <li>Operate and improve the website</li>
                <li>Respond to enquiries</li>
                <li>Display dog adoption listings from external databases</li>
                <li>Monitor traffic and usage via analytics tools</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Legal Basis for Processing</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Under the UK GDPR, we rely on the following legal bases:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-8 ml-4">
                <li><strong>Legitimate interest</strong> – to run and improve the website</li>
                <li><strong>Consent</strong> – for optional features (like cookies or mailing lists)</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Sharing Your Data</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We do not sell your personal data.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may share it with trusted services we use to operate this site:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 ml-4">
                <li>Softr – website frontend</li>
                <li>Airtable – stores and displays listing data</li>
                <li>Google Analytics or similar – usage tracking</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-8">
                All third-party services are GDPR-compliant to the best of our knowledge.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Your Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Under the UK GDPR, you have the right to:
              </p>
              <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 ml-4">
                <li>Access your data</li>
                <li>Request correction or deletion</li>
                <li>Withdraw consent (where applicable)</li>
                <li>Lodge a complaint with the ICO (Information Commissioner's Office)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-8">
                To exercise any rights, <a href="/contact" className="text-blue-600 hover:text-blue-700 underline">contact us here</a>.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Data Retention</h2>
              <p className="text-slate-700 leading-relaxed mb-8">
                We only keep your personal data for as long as necessary for the purpose it was collected.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Cookies</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may use cookies to improve site functionality or analyze user activity.
              </p>
              <p className="text-slate-700 leading-relaxed mb-8">
                You can manage or disable cookies in your browser settings.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time.
              </p>
              <p className="text-slate-700 leading-relaxed mb-8">
                Please check this page for the latest version.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Questions?</h2>
              <p className="text-slate-700 leading-relaxed">
                If you have any questions about this Privacy Policy, <a href="/contact" className="text-blue-600 hover:text-blue-700 underline">contact us here</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Rescue Finder',
  description: 'Learn about Rescue Finder, the UK\'s comprehensive directory bringing together adoptable dogs from charities across the country in one place.',
  openGraph: {
    title: 'About Us - Rescue Finder',
    description: 'Learn about Rescue Finder, the UK\'s comprehensive directory bringing together adoptable dogs from charities across the country in one place.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Us - Rescue Finder',
    description: 'Learn about Rescue Finder, the UK\'s comprehensive directory bringing together adoptable dogs from charities across the country in one place.',
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-content py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-300 mb-4">
              About Rescue Finder
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Connecting rescue dogs with loving families across the UK
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-slate-700 leading-relaxed mb-6">
                There's nothing more rewarding than adopting a dog who's looking for a new home. But finding the right dog, and even knowing where to look, can be surprisingly difficult.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                Most people turn to Google, searching for nearby rescue centers or checking out the big names like The Dog's Trust or the RSPCA. But what about the smaller, local charities just a short drive away? They're often overlooked, and that means dogs in need might miss out on a second chance, and you might miss out on your perfect companion.
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                That's why I built Rescue Finder, the only directory in the UK that brings together adoptable dogs from across the country, all in one place. To keep things up to date, we check listings several times a week, adding new arrivals and removing dogs who've already found their forever homes.
              </p>

              <p className="text-slate-700 leading-relaxed">
                More charities are being added every week, and new features are being added all the time to make it even easier for you to find your new best friend.
              </p>
            </div>
          </div>

          {/* Mission Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Our Mission</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                To make it easier for people to find and adopt rescue dogs by bringing together listings from charities across the UK in one comprehensive, searchable directory.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Why It Matters</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Every dog deserves a loving home, and every family deserves to find their perfect companion. By highlighting smaller, local charities, we help more dogs get the second chance they deserve.
              </p>
            </div>
          </div>



          {/* Call to Action */}
          <div className="text-center bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Ready to Find Your New Best Friend?
            </h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Browse our directory of rescue dogs and discover your perfect companion. Every search helps connect a dog with their forever home.
            </p>
            <div className="flex justify-center">
              <a href="/" className="btn-primary">
                Browse Dogs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
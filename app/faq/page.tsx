import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Rescue Finder',
  description: 'Frequently asked questions about Rescue Finder, finding dogs for adoption, and how our directory works.',
  openGraph: {
    title: 'FAQ - Rescue Finder',
    description: 'Frequently asked questions about Rescue Finder, finding dogs for adoption, and how our directory works.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'FAQ - Rescue Finder',
    description: 'Frequently asked questions about Rescue Finder, finding dogs for adoption, and how our directory works.',
  }
}

const faqs = [
  {
    question: "I have a question about a dog or want to adopt, who do I speak to?",
    answer: "If you have a question about a dog you've found, or want to adopt, please click on the link in the dog's description to visit the charity and contact them directly or follow their adoption procedure."
  },
  {
    question: "Is Rescue Finder a charity or rescue center?",
    answer: "No, Rescue Finder is not a charity or a rehoming center. We are a directory, making it easier to find dogs from different charities across the U.K."
  },
  {
    question: "How can I put my dog up for adoption?",
    answer: "Rescue Finder is not a rehoming center and we are unable to help you put your dog up for adoption. Please contact a rehoming center near you for more advice."
  },
  {
    question: "We are a charity, how can we list our dogs on Rescue Finder?",
    answer: "If you are a charity with dogs available for adoption and would like to list them on Rescue Finder, please contact us and we will be in touch."
  },
  {
    question: "I can't find a dog on your website anymore",
    answer: "Rescue Finder is updated several times a week, and if you can no longer see a dog up for adoption then they are no longer listed as available with the charity that was rehoming them. This might mean they have already been adopted - please contact the charity for more information."
  },
  {
    question: "Do you list dogs from every charity?",
    answer: "Unfortunately no (not yet!) but we are adding more charities and more dogs to Rescue Finder each week."
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-content py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-300 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Find answers to common questions about Rescue Finder and how to adopt rescue dogs
            </p>
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-semibold text-blue-300 mb-4 leading-relaxed">
                  {faq.question}
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>


          {/* Additional Resources */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Looking to Adopt?</h3>
              </div>
              <p className="text-slate-600 mb-4">
                Browse our directory of rescue dogs and find your perfect companion.
              </p>
              <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Browse Dogs →
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Charity Partnership</h3>
              </div>
              <p className="text-slate-600 mb-4">
                Are you a rescue charity? Learn how to list your dogs on our platform.
              </p>
              <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Get in Touch →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
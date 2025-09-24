import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-6xl mb-4">🐕</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Dog Not Found
        </h1>
        <p className="text-slate-600 mb-8">
          Sorry, we couldn't find the dog you're looking for. They may have already been adopted or the link might be outdated.
        </p>
        <div className="space-y-4">
          <Link
            href="/#dogs"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-block"
          >
            Browse Available Dogs
          </Link>
          <br />
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
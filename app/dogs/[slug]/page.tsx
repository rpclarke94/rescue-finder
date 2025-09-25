import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Props {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const dog = await prisma.dog.findFirst({
    where: { seoSlug: resolvedParams.slug }
  })

  if (!dog) {
    return {
      title: 'Dog Not Found | Rescue Finder',
      description: 'The dog you are looking for could not be found.'
    }
  }

  return {
    title: dog.seoTitle || `${dog.name} - ${dog.breed} for Adoption | Rescue Finder`,
    description: dog.seoDesc || `Meet ${dog.name}, a ${dog.breed} looking for a loving home. Available through ${dog.charity}.`,
    openGraph: {
      title: dog.seoTitle || `${dog.name} - Available for Adoption`,
      description: dog.seoDesc || `Meet ${dog.name}, a ${dog.breed} looking for a loving home.`,
      images: dog.imageUrl ? [{ url: dog.imageUrl, alt: `${dog.name} - ${dog.breed}` }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: dog.seoTitle || `${dog.name} - Available for Adoption`,
      description: dog.seoDesc || `Meet ${dog.name}, a ${dog.breed} looking for a loving home.`,
      images: dog.imageUrl ? [dog.imageUrl] : [],
    },
  }
}

function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'neutral' | 'brand' | 'success' | 'warning' }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700',
    brand: 'bg-blue-100 text-blue-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-yellow-100 text-yellow-700'
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

export default async function DogPage({ params }: Props) {
  const resolvedParams = await params
  const dog = await prisma.dog.findFirst({
    where: { seoSlug: resolvedParams.slug }
  })

  if (!dog) {
    notFound()
  }

  const defaultImage = '/api/placeholder/400/300'
  const imageUrl = dog.imageUrl || defaultImage

  const locationText = [dog.county, dog.region]
    .filter(Boolean)
    .join(', ') || 'Location not specified'

  const breedText = dog.breed || 'Mixed breed'

  const getBadgeVariant = (value: string | null) => {
    if (!value || value.toLowerCase().includes('unknown')) return 'neutral'
    return 'brand'
  }

  const getSexBadgeVariant = (sex: string | null) => {
    if (!sex || sex.toLowerCase().includes('unknown')) return 'neutral'
    if (sex.toLowerCase() === 'male') return 'brand'
    if (sex.toLowerCase() === 'female') return 'success'
    return 'neutral'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-content py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/#dogs" className="text-blue-600 hover:text-blue-700">
              Dogs
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">{dog.name}</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="container-content py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left side - Image */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-lg">
              <Image
                src={imageUrl}
                alt={`${dog.name}, a ${breedText} available for adoption`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              {dog.sex && (
                <Badge variant={getSexBadgeVariant(dog.sex)}>
                  {dog.sex}
                </Badge>
              )}
              {dog.ageCategory && (
                <Badge variant={getBadgeVariant(dog.ageCategory)}>
                  {dog.ageCategory}
                </Badge>
              )}
              <Badge variant="neutral">
                {breedText}
              </Badge>
              <Badge variant="neutral">
                {locationText}
              </Badge>
            </div>
          </div>

          {/* Right side - Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {dog.name}
              </h1>
              {dog.charity && (
                <p className="text-lg text-slate-600">
                  Available through {dog.charity}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {dog.link && (
                <a
                  href={dog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 flex-1 text-center"
                >
                  Go to Charity
                </a>
              )}
              <Link
                href="/#dogs"
                className="btn-secondary flex-1 text-center"
              >
                Browse More Dogs
              </Link>
            </div>

            {/* Basic info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">About {dog.name}</h2>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Breed</span>
                  <span className="font-medium text-slate-900">{breedText}</span>
                </div>
                {dog.age && (
                  <div>
                    <span className="text-slate-500 block mb-1">Age</span>
                    <span className="font-medium text-slate-900">{dog.age}</span>
                  </div>
                )}
                {dog.sex && (
                  <div>
                    <span className="text-slate-500 block mb-1">Sex</span>
                    <span className="font-medium text-slate-900">{dog.sex}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block mb-1">Location</span>
                  <span className="font-medium text-slate-900">{locationText}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {dog.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Description</h2>
                <div className="text-slate-700 leading-relaxed space-y-4">
                  {dog.description.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Call to action */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Ready to Adopt {dog.name}?
              </h2>
              <p className="text-slate-600 mb-4">
                Contact {dog.charity} to learn more about {dog.name} and start the adoption process.
              </p>
              {dog.link && (
                <a
                  href={dog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-block"
                >
                  Contact Charity
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import Image from 'next/image'
import Link from 'next/link'

export interface Dog {
  id: string;
  externalId: string;
  name: string;
  breed: string | null;
  age: string | null;
  sex: string | null;
  ageCategory: string | null;
  location: string | null;
  county: string | null;
  region: string | null;
  charity: string | null;
  imageUrl: string | null;
  link: string | null;
  description: string | null;
  seoSlug: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  lastSeen: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DogCardProps {
  dog: Dog;
  onCardClick?: (dog: Dog) => void;
}

function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'pink' }) {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  )
}

export default function DogCard({ dog, onCardClick }: DogCardProps) {
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
    if (sex.toLowerCase() === 'female') return 'pink'
    return 'neutral'
  }

  const dogUrl = dog.seoSlug ? `/dogs/${dog.seoSlug}` : '#'

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onCardClick) {
      onCardClick(dog)
    }
  }

  return (
    <article className="card group focus-within:ring-2 focus-within:ring-blue-500/20">
      <Link
        href={dogUrl}
        className="block"
        aria-label={`View details for ${dog.name}`}
        onClick={handleClick}
      >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!dog.imageUrl ? (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-500 text-sm font-medium">Image not found</span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={`${dog.name}, a ${breedText} available for adoption`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = defaultImage
            }}
          />
        )}

        {/* Status badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 transition-opacity duration-300 group-hover:opacity-50">
          <Badge variant="brand">
            {locationText}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-300 transition-colors leading-tight">
              {dog.name}
            </h3>
            {dog.charity && (
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md shrink-0">
                {dog.charity}
              </span>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="space-y-2 mb-4">
          {dog.sex && (
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-16 shrink-0">Sex</span>
              <span className="text-slate-700 font-medium">{dog.sex}</span>
            </div>
          )}
          {dog.age && (
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-16 shrink-0">Age</span>
              <span className="text-slate-700 font-medium">{dog.age}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <span className="text-slate-500 w-16 shrink-0">Breed</span>
            <span className="text-slate-700 font-medium">{breedText}</span>
          </div>
        </div>

        {/* Description */}
        {dog.description && (
          <p className="text-slate-600 text-sm text-clamp-2 mb-6 leading-relaxed">
            {dog.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex">
          <span className="bg-blue-50 hover:bg-blue-300 focus:bg-blue-300 text-slate-700 font-medium px-4 py-2.5 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-300/20 focus:ring-offset-2 w-full text-sm text-center">
            More Details
          </span>
        </div>
      </div>
      </Link>
    </article>
  )
}
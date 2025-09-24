'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Dog } from './DogCard'

interface DogModalProps {
  dog: Dog | null
  isOpen: boolean
  onClose: () => void
}

function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'pink' }) {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  )
}

export default function DogModal({ dog, isOpen, onClose }: DogModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const lastFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      lastFocusedElement.current = document.activeElement as HTMLElement

      // Prevent body scroll
      document.body.classList.add('modal-open')

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    } else {
      // Restore body scroll
      document.body.classList.remove('modal-open')

      // Restore focus to previously focused element
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus()
      }
    }

    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    const handleTab = (e: KeyboardEvent) => {
      if (!isOpen || !modalRef.current) return

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen, onClose])

  if (!isOpen || !dog) {
    return null
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
    if (sex.toLowerCase() === 'female') return 'pink'
    return 'neutral'
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="modal-overlay modal-enter-active"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="relative p-6 pb-4 border-b border-slate-100">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 id="modal-title" className="text-2xl font-bold text-slate-900 pr-12">
            {dog.name}
          </h2>
          {dog.charity && (
            <p className="text-slate-600 mt-1">
              Available through {dog.charity}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Left side - Image */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={imageUrl}
                alt={`${dog.name}, a ${breedText} available for adoption`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = defaultImage
                }}
              />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
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
          <div className="space-y-6">
            {/* Action buttons */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row gap-3">
                {dog.link && (
                  <a
                    href={dog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-300 hover:bg-blue-400 focus:bg-blue-400 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-300/20 focus:ring-offset-2 flex-1 text-center"
                  >
                    Go to Charity
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Basic info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">About {dog.name}</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Breed</span>
                  <span className="font-medium text-slate-900">{breedText}</span>
                </div>
                {dog.age && (
                  <div>
                    <span className="text-slate-500 block">Age</span>
                    <span className="font-medium text-slate-900">{dog.age}</span>
                  </div>
                )}
                {dog.sex && (
                  <div>
                    <span className="text-slate-500 block">Sex</span>
                    <span className="font-medium text-slate-900">{dog.sex}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block">Location</span>
                  <span className="font-medium text-slate-900">{locationText}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {dog.description && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Description</h4>
                <div
                  id="modal-description"
                  className="text-slate-700 leading-relaxed space-y-3 text-sm"
                >
                  {dog.description.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
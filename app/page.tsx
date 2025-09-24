'use client'

import { useState, useEffect } from 'react'
import DogCard, { Dog } from '@/components/DogCard'
import FiltersBar from '@/components/FiltersBar'
import DogModal from '@/components/DogModal'

export default function HomePage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const dogsPerPage = 16

  useEffect(() => {
    async function fetchDogs() {
      try {
        const response = await fetch('/api/dogs')
        const data = await response.json()
        if (data.dogs) {
          const sortedDogs = data.dogs.sort((a: Dog, b: Dog) => a.name.localeCompare(b.name))
          setDogs(sortedDogs)
          setFilteredDogs(sortedDogs)
          setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : null)
        } else {
          // Fallback for old API format
          const sortedDogs = data.sort((a: Dog, b: Dog) => a.name.localeCompare(b.name))
          setDogs(sortedDogs)
          setFilteredDogs(sortedDogs)
        }
      } catch (error) {
        console.error('Error fetching dogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDogs()
  }, [])


  // Calculate pagination
  const totalPages = Math.ceil(filteredDogs.length / dogsPerPage)
  const startIndex = (currentPage - 1) * dogsPerPage
  const endIndex = startIndex + dogsPerPage
  const currentDogs = filteredDogs.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredDogs.length])

  const handleDogClick = (dog: Dog) => {
    setSelectedDog(dog)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDog(null)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container-content pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-slate-900">
                Rescue a Dog.
                <span className="block text-blue-300">Change a Life.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Discover rescue dogs across the UK looking for their forever homes.
              </p>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:flex justify-end">
              <img
                src="/images/headerimage5.png"
                alt="Dog house illustration"
                className="max-w-full h-auto w-[90%]"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Dogs Grid Section */}
      <section id="dogs" className="py-16 bg-blue-25">
        <div className="container-content">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Dogs Looking for Homes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Each of these wonderful dogs is waiting for a loving family.
              Click to learn more about their story and how you can help.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-24">
              <div className="mb-4 flex justify-center">
                <img
                  src="/images/rffavicon.png"
                  alt="Loading"
                  className="w-16 h-16 animate-pulse"
                />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Loading Dogs...</h3>
              <p className="text-slate-600">Fetching rescue dogs from our database...</p>
            </div>
          ) : dogs.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🐕</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">No Dogs Available</h3>
              <p className="text-slate-600 mb-6">
                It looks like there are no rescue dogs in our database yet.
              </p>
              <p className="text-sm text-slate-500">
                Run the ETL pipeline to import dog data: <code className="bg-slate-100 px-2 py-1 rounded">npm run import:aggressive</code>
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats */}
              <div className="text-center mb-4 space-y-1">
                <span className="text-base text-slate-600 block">
                  <span className="font-bold text-blue-300">{loading ? '...' : dogs.length}</span> dogs available from{' '}
                  <span className="font-bold text-blue-300">
                    {loading ? '...' : new Set(dogs.map(dog => dog.charity).filter(Boolean)).size}
                  </span> charities across the UK
                </span>
                {lastUpdated && (
                  <span className="text-sm text-slate-500 block">
                    Last Updated: {lastUpdated.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>

              <FiltersBar dogs={dogs} onFilteredDogsChange={setFilteredDogs} />

              {/* Dogs Grid */}
              <div className="container-content">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentDogs.map((dog) => (
                    <DogCard key={dog.id} dog={dog} onCardClick={handleDogClick} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-16">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {(() => {
                        const maxVisiblePages = 10;
                        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

                        const pages = [];

                        // Add first page if not in range
                        if (adjustedStartPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => setCurrentPage(1)}
                              className="px-3 py-2 rounded-lg font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              1
                            </button>
                          );
                          if (adjustedStartPage > 2) {
                            pages.push(<span key="start-ellipsis" className="px-2 py-2 text-slate-500">...</span>);
                          }
                        }

                        // Add visible page range
                        for (let page = adjustedStartPage; page <= endPage; page++) {
                          pages.push(
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-300 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }

                        // Add last page if not in range
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(<span key="end-ellipsis" className="px-2 py-2 text-slate-500">...</span>);
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-3 py-2 rounded-lg font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Results Info */}
                <div className="text-center mt-8 text-slate-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredDogs.length)} of {filteredDogs.length} dogs
                </div>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Dog Modal */}
      <DogModal
        dog={selectedDog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

    </div>
  )
}
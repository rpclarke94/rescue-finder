'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dog } from './DogCard'

interface FiltersBarProps {
  dogs: Dog[]
  onFilteredDogsChange: (filteredDogs: Dog[]) => void
}

export default function FiltersBar({ dogs, onFilteredDogsChange }: FiltersBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [selectedAge, setSelectedAge] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedSex, setSelectedSex] = useState('')
  const [postcodeSearch, setPostcodeSearch] = useState('')
  const [radiusMiles, setRadiusMiles] = useState(25)
  const [postcodeSearchActive, setPostcodeSearchActive] = useState(false)
  const [postcodeSearchLoading, setPostcodeSearchLoading] = useState(false)
  const [postcodeSearchResults, setPostcodeSearchResults] = useState<Dog[]>([])

  const uniqueBreeds = useMemo(() => {
    const breeds = dogs
      .map(dog => dog.breed)
      .filter(Boolean)
      .filter((breed, index, arr) => arr.indexOf(breed) === index)
      .sort()
    return breeds
  }, [dogs])

  const uniqueRegions = useMemo(() => {
    const regions = dogs
      .map(dog => dog.region)
      .filter(Boolean)
      .filter((region, index, arr) => arr.indexOf(region) === index)
      .sort()
    return regions
  }, [dogs])

  const uniqueCounties = useMemo(() => {
    const counties = dogs
      .map(dog => dog.county)
      .filter(Boolean)
      .filter((county, index, arr) => arr.indexOf(county) === index)
      .sort()
    return counties
  }, [dogs])

  const uniqueAgeCategories = useMemo(() => {
    const ageCategories = dogs
      .map(dog => dog.ageCategory)
      .filter(Boolean)
      .filter((age, index, arr) => arr.indexOf(age) === index)

    // Custom sort to put 'Puppy' first, then alphabetical
    return ageCategories.sort((a, b) => {
      if (a.toLowerCase() === 'puppy') return -1
      if (b.toLowerCase() === 'puppy') return 1
      return a.localeCompare(b)
    })
  }, [dogs])

  const uniqueSexes = useMemo(() => {
    const sexes = dogs
      .map(dog => dog.sex)
      .filter(Boolean)
      .filter((sex, index, arr) => arr.indexOf(sex) === index)
      .sort()
    return sexes
  }, [dogs])

  // Postcode search function
  const handlePostcodeSearch = async () => {
    if (!postcodeSearch.trim()) return

    setPostcodeSearchLoading(true)
    try {
      const response = await fetch('/api/postcode-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: postcodeSearch.trim(),
          radius: radiusMiles
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPostcodeSearchActive(true)
        setPostcodeSearchResults(data.dogs)
        onFilteredDogsChange(data.dogs)
      } else {
        const error = await response.json()
        alert(error.error || 'Invalid postcode')
        setPostcodeSearchActive(false)
        setPostcodeSearchResults([])
      }
    } catch (error) {
      console.error('Postcode search error:', error)
      alert('Error searching by postcode')
      setPostcodeSearchActive(false)
      setPostcodeSearchResults([])
    } finally {
      setPostcodeSearchLoading(false)
    }
  }

  const clearPostcodeSearch = () => {
    setPostcodeSearch('')
    setPostcodeSearchActive(false)
    setPostcodeSearchResults([])
  }

  const filteredDogs = useMemo(() => {
    // If postcode search is active, skip normal filtering
    if (postcodeSearchActive) {
      return dogs
    }
    let filtered = dogs.filter(dog => {
      const matchesSearch = searchTerm === '' ||
        dog.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesBreed = selectedBreed === '' || dog.breed === selectedBreed
      const matchesAge = selectedAge === '' || dog.ageCategory === selectedAge
      const matchesRegion = selectedRegion === '' || dog.region === selectedRegion
      const matchesCounty = selectedCounty === '' || dog.county === selectedCounty
      const matchesSex = selectedSex === '' || dog.sex === selectedSex

      return matchesSearch && matchesBreed && matchesAge && matchesRegion && matchesCounty && matchesSex
    })


    return filtered
  }, [dogs, searchTerm, selectedBreed, selectedAge, selectedRegion, selectedCounty, selectedSex, postcodeSearchActive])

  useEffect(() => {
    onFilteredDogsChange(filteredDogs)
  }, [filteredDogs, onFilteredDogsChange])

  const hasActiveFilters = searchTerm || selectedBreed || selectedAge || selectedRegion || selectedCounty || selectedSex || postcodeSearchActive

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedBreed('')
    setSelectedAge('')
    setSelectedRegion('')
    setSelectedCounty('')
    setSelectedSex('')
    clearPostcodeSearch()
  }

  return (
    <div className="filters-bar">
      <div className="container-content py-4">
        <div className="filters-container">

          {/* Desktop Layout */}
          <div className="hidden md:block space-y-4">
            {/* First Row: Search and Postcode Search */}
            <div className="flex items-center gap-4">
              {/* Name Search */}
              <div className="flex-1">
                <div className="input-with-icon">
                  <div className="input-icon">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 h-10"
                    aria-label="Search dogs by name"
                  />
                </div>
              </div>

              {/* Postcode Search */}
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="input-with-icon flex-1">
                    <div className="input-icon">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter postcode..."
                      value={postcodeSearch}
                      onChange={(e) => setPostcodeSearch(e.target.value.toUpperCase())}
                      className="input-field pl-10 h-10"
                      aria-label="Search by postcode"
                      onKeyPress={(e) => e.key === 'Enter' && handlePostcodeSearch()}
                    />
                  </div>
                  <select
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(Number(e.target.value))}
                    className="select-field h-10 pr-2 w-40 text-sm"
                    aria-label="Search radius"
                  >
                    <option value={10}>Within 10 miles</option>
                    <option value={25}>Within 25 miles</option>
                    <option value={50}>Within 50 miles</option>
                    <option value={100}>Within 100 miles</option>
                  </select>
                  <button
                    onClick={handlePostcodeSearch}
                    disabled={postcodeSearchLoading || !postcodeSearch.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-md text-sm font-medium transition-colors h-10"
                    aria-label="Search by postcode"
                  >
                    {postcodeSearchLoading ? 'Searching...' : 'Search'}
                  </button>
                  {postcodeSearchActive && (
                    <button
                      onClick={clearPostcodeSearch}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors h-10"
                      aria-label="Clear postcode search"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Second Row: Filters */}
            <div className="flex items-center gap-4">
              {/* Filters */}
              <div className="flex items-center gap-3 flex-1">
                <div className="select-with-icon">
                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="select-field h-10 pr-8 min-w-24"
                    aria-label="Filter by age"
                  >
                    <option value="">Age</option>
                    {uniqueAgeCategories.map((ageCategory) => (
                      <option key={ageCategory} value={ageCategory}>{ageCategory}</option>
                    ))}
                  </select>
                  <div className="select-icon">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="select-with-icon">
                  <select
                    value={selectedSex}
                    onChange={(e) => setSelectedSex(e.target.value)}
                    className="select-field h-10 pr-8 min-w-20"
                    aria-label="Filter by sex"
                  >
                    <option value="">Sex</option>
                    {uniqueSexes.map((sex) => (
                      <option key={sex} value={sex}>{sex}</option>
                    ))}
                  </select>
                  <div className="select-icon">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="select-with-icon">
                  <select
                    value={selectedBreed}
                    onChange={(e) => setSelectedBreed(e.target.value)}
                    className="select-field h-10 pr-8 min-w-28"
                    aria-label="Filter by breed"
                  >
                    <option value="">Breed</option>
                    {uniqueBreeds.map((breed) => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                  <div className="select-icon">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="select-with-icon">
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="select-field h-10 pr-8 min-w-28"
                    aria-label="Filter by county"
                  >
                    <option value="">County</option>
                    {uniqueCounties.map((county) => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                  <div className="select-icon">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="select-with-icon">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="select-field h-10 pr-8 min-w-28"
                    aria-label="Filter by region"
                  >
                    <option value="">Region</option>
                    {uniqueRegions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  <div className="select-icon">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Results and Clear */}
              <div className="flex items-center justify-end gap-3 text-sm min-w-fit">
                <span className="text-slate-600 font-medium whitespace-nowrap">
                  {postcodeSearchActive
                    ? `${postcodeSearchResults.length} dogs within ${radiusMiles} miles`
                    : `${filteredDogs.length} of ${dogs.length} dogs`
                  }
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap transition-colors underline underline-offset-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="md:hidden space-y-4">
            {/* Search - Full Width */}
            <div className="input-with-icon">
              <div className="input-icon">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-10"
                aria-label="Search dogs by name, breed, or description"
              />
            </div>


            {/* Postcode Search - Full Width */}
            <div className="space-y-3">
              <div className="input-with-icon">
                <div className="input-icon">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter postcode..."
                  value={postcodeSearch}
                  onChange={(e) => setPostcodeSearch(e.target.value.toUpperCase())}
                  className="input-field pl-10 h-10"
                  aria-label="Search by postcode"
                  onKeyPress={(e) => e.key === 'Enter' && handlePostcodeSearch()}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={radiusMiles}
                  onChange={(e) => setRadiusMiles(Number(e.target.value))}
                  className="select-field h-10 flex-1"
                  aria-label="Search radius"
                >
                  <option value={10}>Within 10 miles</option>
                  <option value={25}>Within 25 miles</option>
                  <option value={50}>Within 50 miles</option>
                  <option value={100}>Within 100 miles</option>
                </select>

                <button
                  onClick={handlePostcodeSearch}
                  disabled={postcodeSearchLoading || !postcodeSearch.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-10"
                  aria-label="Search by postcode"
                >
                  {postcodeSearchLoading ? 'Searching...' : 'Search'}
                </button>

                {postcodeSearchActive && (
                  <button
                    onClick={clearPostcodeSearch}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors h-10"
                    aria-label="Clear postcode search"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filters - 2x3 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="select-with-icon">
                <select
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  className="select-field h-10 pr-8"
                  aria-label="Filter by age"
                >
                  <option value="">All ages</option>
                  {uniqueAgeCategories.map((ageCategory) => (
                    <option key={ageCategory} value={ageCategory}>{ageCategory}</option>
                  ))}
                </select>
                <div className="select-icon">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="select-with-icon">
                <select
                  value={selectedSex}
                  onChange={(e) => setSelectedSex(e.target.value)}
                  className="select-field h-10 pr-8"
                  aria-label="Filter by sex"
                >
                  <option value="">All sexes</option>
                  {uniqueSexes.map((sex) => (
                    <option key={sex} value={sex}>{sex}</option>
                  ))}
                </select>
                <div className="select-icon">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="select-with-icon">
                <select
                  value={selectedBreed}
                  onChange={(e) => setSelectedBreed(e.target.value)}
                  className="select-field h-10 pr-8"
                  aria-label="Filter by breed"
                >
                  <option value="">All breeds</option>
                  {uniqueBreeds.map((breed) => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
                <div className="select-icon">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="select-with-icon">
                <select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="select-field h-10 pr-8"
                  aria-label="Filter by county"
                >
                  <option value="">All counties</option>
                  {uniqueCounties.map((county) => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
                <div className="select-icon">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="select-with-icon">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="select-field h-10 pr-8"
                  aria-label="Filter by region"
                >
                  <option value="">All regions</option>
                  {uniqueRegions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <div className="select-icon">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Results and Clear - Bottom */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
              <span className="text-slate-600 font-medium">
                {postcodeSearchActive
                  ? `${postcodeSearchResults.length} dogs within ${radiusMiles} miles`
                  : `${filteredDogs.length} of ${dogs.length} dogs`
                }
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
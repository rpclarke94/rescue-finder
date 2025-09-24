'use client'

import { useState, useMemo } from 'react'
import { Dog } from './DogCard'

interface DogFiltersProps {
  dogs: Dog[]
  onFilteredDogsChange: (filteredDogs: Dog[]) => void
}

export default function DogFilters({ dogs, onFilteredDogsChange }: DogFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [selectedAge, setSelectedAge] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedSex, setSelectedSex] = useState('')

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
      .sort()
    return ageCategories
  }, [dogs])

  const uniqueSexes = useMemo(() => {
    const sexes = dogs
      .map(dog => dog.sex)
      .filter(Boolean)
      .filter((sex, index, arr) => arr.indexOf(sex) === index)
      .sort()
    return sexes
  }, [dogs])

  const filteredDogs = useMemo(() => {
    return dogs.filter(dog => {
      const matchesSearch = searchTerm === '' ||
        dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dog.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (dog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesBreed = selectedBreed === '' || dog.breed === selectedBreed

      const matchesAge = selectedAge === '' || dog.ageCategory === selectedAge

      const matchesRegion = selectedRegion === '' || dog.region === selectedRegion

      const matchesCounty = selectedCounty === '' || dog.county === selectedCounty

      const matchesSex = selectedSex === '' || dog.sex === selectedSex

      return matchesSearch && matchesBreed && matchesAge && matchesRegion && matchesCounty && matchesSex
    })
  }, [dogs, searchTerm, selectedBreed, selectedAge, selectedRegion, selectedCounty, selectedSex])

  useMemo(() => {
    onFilteredDogsChange(filteredDogs)
  }, [filteredDogs, onFilteredDogsChange])

  return (
    <div className="mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Dog name, breed, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breed
            </label>
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All breeds</option>
              {uniqueBreeds.map((breed) => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All ages</option>
              {uniqueAgeCategories.map((ageCategory) => (
                <option key={ageCategory} value={ageCategory}>{ageCategory}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All regions</option>
              {uniqueRegions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              County
            </label>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All counties</option>
              {uniqueCounties.map((county) => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sex
            </label>
            <select
              value={selectedSex}
              onChange={(e) => setSelectedSex(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All</option>
              {uniqueSexes.map((sex) => (
                <option key={sex} value={sex}>{sex}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedBreed || selectedAge || selectedRegion || selectedCounty || selectedSex) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredDogs.length} of {dogs.length} dogs
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedBreed('')
                setSelectedAge('')
                setSelectedRegion('')
                setSelectedCounty('')
                setSelectedSex('')
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, MapPin, GraduationCap, Building,
  Star, Globe, Clock, Calendar, ChevronDown, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { Button } from '../components/atoms/Button'
import { mentors } from '../data/mentors'

const MENTORS_PER_PAGE = 9

// Derive unique filter options from data
const allUniversities = [...new Set(mentors.map((m) => m.university))]
const allExpertise = [...new Set(mentors.flatMap((m) => m.expertise))]
const allLanguages = [...new Set(mentors.flatMap((m) => m.languages))]
const allCountries = [...new Set(mentors.map((m) => m.country))]
const allDegrees = [...new Set(mentors.map((m) => m.degree))]

type FilterKey = 'country' | 'degree' | 'university' | 'expertise' | 'languages'

const filterConfig: { key: FilterKey; label: string; icon: typeof MapPin; options: string[] }[] = [
  { key: 'country', label: 'Country', icon: MapPin, options: allCountries },
  { key: 'degree', label: 'Degree', icon: GraduationCap, options: allDegrees },
  { key: 'university', label: 'University', icon: Building, options: allUniversities },
  { key: 'expertise', label: 'Expertise', icon: Star, options: allExpertise },
  { key: 'languages', label: 'Languages', icon: Globe, options: allLanguages },
]

export function GuidesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'highestRated' | 'mostReviews' | 'priceLow' | 'priceHigh'>(
    'highestRated',
  )
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, string[]>>({
    country: [],
    degree: [],
    university: [],
    expertise: [],
    languages: [],
  })
  const filterRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleFilter = (key: FilterKey, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[key]
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    })
    setCurrentPage(1) // Reset to page 1 when filters change
  }

  const clearAllFilters = () => {
    setActiveFilters({ country: [], degree: [], university: [], expertise: [], languages: [] })
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasActiveFilters = Object.values(activeFilters).some((v) => v.length > 0)

  const filteredMentors = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return mentors.filter((mentor) => {
      if (q) {
        const matchesSearch =
          mentor.name.toLowerCase().includes(q) ||
          mentor.title.toLowerCase().includes(q) ||
          mentor.university.toLowerCase().includes(q) ||
          mentor.bio.toLowerCase().includes(q) ||
          mentor.expertise.some((e) => e.toLowerCase().includes(q)) ||
          mentor.languages.some((l) => l.toLowerCase().includes(q))
        if (!matchesSearch) return false
      }
      if (activeFilters.country.length > 0 && !activeFilters.country.includes(mentor.country)) return false
      if (activeFilters.degree.length > 0 && !activeFilters.degree.includes(mentor.degree)) return false
      if (activeFilters.university.length > 0 && !activeFilters.university.includes(mentor.university)) return false
      if (activeFilters.expertise.length > 0 && !activeFilters.expertise.some((e) => mentor.expertise.includes(e))) return false
      if (activeFilters.languages.length > 0 && !activeFilters.languages.some((l) => mentor.languages.includes(l))) return false
      return true
    })
  }, [searchQuery, activeFilters])

  // Sorting
  const sortedMentors = useMemo(() => {
    const list = [...filteredMentors]
    list.sort((a, b) => {
      switch (sortBy) {
        case 'highestRated':
          if (b.rating !== a.rating) return b.rating - a.rating
          return b.reviews - a.reviews
        case 'mostReviews':
          if (b.reviews !== a.reviews) return b.reviews - a.reviews
          return b.rating - a.rating
        case 'priceLow':
          if (a.hourlyRate !== b.hourlyRate) return a.hourlyRate - b.hourlyRate
          return b.rating - a.rating
        case 'priceHigh':
          if (a.hourlyRate !== b.hourlyRate) return b.hourlyRate - a.hourlyRate
          return b.rating - a.rating
        default:
          return 0
      }
    })
    return list
  }, [filteredMentors, sortBy])

  // Pagination
  const totalPages = Math.ceil(sortedMentors.length / MENTORS_PER_PAGE)
  const paginatedMentors = useMemo(() => {
    const start = (currentPage - 1) * MENTORS_PER_PAGE
    return sortedMentors.slice(start, start + MENTORS_PER_PAGE)
  }, [sortedMentors, currentPage])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const startIdx = sortedMentors.length === 0 ? 0 : (currentPage - 1) * MENTORS_PER_PAGE + 1
  const endIdx = Math.min(currentPage * MENTORS_PER_PAGE, sortedMentors.length)

  const scrollToTopOfList = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col">
      {/* Page Header — scrolls away */}
      <div className="bg-gradient-to-b from-primary/5 to-surface px-6 pt-6 md:px-8 md:pt-8">
        <div className="text-center pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
            Find Your Perfect Mentor
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-text-muted md:text-base">
            Connect with experienced professionals and alumni who can guide your academic and career journey.
          </p>
        </div>
      </div>

      {/* Search + Filters — sticky */}
      <div className="sticky top-16 z-40 shrink-0 border-b border-border bg-surface/95 backdrop-blur-sm px-6 pb-4 pt-4 md:px-8" ref={filterRef}>
        {/* Search Bar */}
        <div className="mx-auto mb-3 max-w-2xl">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 flex-shrink-0 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, expertise, university, or field..."
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-text-muted"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Popular Searches */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted">Popular searches:</span>
            {['Data Science', 'MBA', 'Computer Science', 'Investment Banking', 'Product Management'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="text-xs font-medium text-accent underline-offset-2 hover:underline"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {filterConfig.map((filter) => {
            const isOpen = openFilter === filter.key
            const count = activeFilters[filter.key].length
            return (
              <div key={filter.key} className="relative">
                <button
                  onClick={() => setOpenFilter(isOpen ? null : filter.key)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    count > 0
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-surface text-text-primary hover:border-primary/40'
                  }`}
                >
                  <filter.icon className="h-3.5 w-3.5" />
                  {filter.label}
                  {count > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                      {count}
                    </span>
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 z-20 mt-1 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg">
                    <div className="max-h-52 overflow-y-auto">
                      {filter.options.map((option) => {
                        const isChecked = activeFilters[filter.key].includes(option)
                        return (
                          <label
                            key={option}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFilter(filter.key, option)}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className={isChecked ? 'font-medium text-text-primary' : 'text-text-muted'}>
                              {option}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-text-muted hover:text-text-primary"
            >
              Clear All ({Object.values(activeFilters).flat().length})
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {Object.entries(activeFilters).flatMap(([key, values]) =>
              values.map((value) => (
                <span
                  key={`${key}-${value}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {value}
                  <button
                    onClick={() => toggleFilter(key as FilterKey, value)}
                    className="rounded-full hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Showing{' '}
              <span className="font-medium text-primary">{startIdx}</span>–
              <span className="font-medium text-primary">{endIdx}</span> of{' '}
              <span className="font-medium text-primary">{sortedMentors.length}</span> mentors
            </p>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'highestRated' | 'mostReviews' | 'priceLow' | 'priceHigh')
            }
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus-visible:border-primary"
          >
            <option value="highestRated">Highest rated</option>
            <option value="mostReviews">Most reviews</option>
            <option value="priceLow">Price: low to high</option>
            <option value="priceHigh">Price: high to low</option>
          </select>
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface px-8 py-16 text-center">
            <p className="text-lg font-medium text-text-primary">No mentors found</p>
            <p className="mt-1 text-sm text-text-muted">
              Try adjusting your search or filters to find more mentors.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Mentor Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedMentors.map((mentor) => (
            <article
              key={mentor.id}
              className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/30"
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-white">
                  {mentor.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-text-primary">{mentor.name}</h2>
                  <p className="text-sm text-text-muted">{mentor.title}</p>
                  <p className="text-sm text-text-muted">{mentor.university}</p>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium text-text-primary">{mentor.rating}</span>
                  <span className="text-text-muted">({mentor.reviews})</span>
                </div>
                <div className="text-lg font-semibold text-primary">${mentor.hourlyRate}/hr</div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-text-muted">{mentor.bio}</p>

              <div className="mb-4 flex flex-wrap gap-2">
                {mentor.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mb-5 flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {mentor.availability}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {mentor.languages.join(', ')}
                </div>
              </div>

              <Button
                fullWidth
                className="mt-auto"
                onClick={() => navigate(`/guides/${mentor.id}`)}
              >
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Book Session
                </span>
              </Button>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-1">
            {/* Previous button */}
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1))
              }}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 px-2">
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-sm text-text-muted">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page)
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-white'
                        : 'text-text-primary hover:bg-background'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            {/* Next button */}
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

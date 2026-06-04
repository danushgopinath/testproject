import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, MapPin, GraduationCap, Building,
  Star, Globe, Clock, Calendar, ChevronDown, X,
} from 'lucide-react'
import { useGuides } from '../hooks/useGuides'

type FilterKey = 'university' | 'specialization' | 'language' | 'country' | 'degree'

// ── Guide card ────────────────────────────────────────────────────────────────
function GuideCard({ guide, onBook }: { guide: any; onBook: () => void }) {
  const initials = guide.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2)
  const price = guide.sessionRate ? `$${(guide.sessionRate / 100).toFixed(0)}/hr` : 'Free'
  const rating = guide.averageRating ? guide.averageRating.toFixed(1) : null
  const langs = guide.languages?.length > 0 ? guide.languages : ['English']
  const langLabel = langs.length > 1 ? `${langs[0]} +${langs.length - 1}` : langs[0]

  return (
    <article className="bg-[#f5f7fc] rounded-2xl border border-[#070738]/8 p-6 flex flex-col hover:shadow-lg transition-shadow duration-200">
      {/* Avatar + name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-full bg-[#070738] text-base font-bold text-[#F5B400]">
          {initials}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="text-[15px] font-bold text-[#070738] leading-tight">{guide.name}</h2>
          <p className="text-sm text-[#070738]/65 mt-0.5 leading-snug">{guide.currentRole || guide.headline}</p>
          {guide.university && (
            <p className="text-xs text-[#070738]/45 mt-0.5">{guide.university}</p>
          )}
        </div>
      </div>

      {/* Rating + price */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-[#F5B400] text-[#F5B400]" />
          {rating ? (
            <>
              <span className="text-sm font-bold text-[#070738]">{rating}</span>
              <span className="text-sm text-[#070738]/50">({guide.reviewCount ?? guide.totalSessions})</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-[#070738]/60">New</span>
          )}
        </div>
        <span className="text-base font-bold text-[#070738]">{price}</span>
      </div>

      {/* Bio */}
      <p className="text-sm text-[#070738]/60 leading-relaxed mb-4 line-clamp-2">
        {guide.bio || guide.journeys?.[0]?.title || 'Experienced mentor ready to help with your journey.'}
      </p>

      {/* Specialization tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(guide.specializations ?? []).slice(0, 3).map((tag: string) => (
          <span key={tag} className="px-2.5 py-1 text-[11px] font-medium border border-[#070738]/20 text-[#070738]/70 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      {/* Sessions + language */}
      <div className="flex items-center justify-between text-xs text-[#070738]/50 mb-5 mt-auto">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{guide.totalSessions} session{guide.totalSessions !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          <span>{langLabel}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onBook}
        className="flex items-center justify-center gap-2 w-full h-11 bg-[#070738] text-white text-sm font-semibold rounded-xl hover:bg-[#070738]/90 transition-colors"
      >
        <Calendar className="h-4 w-4" />
        Book Session
      </button>
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function GuidesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const [sortBy, setSortBy] = useState<'highest_rated' | 'most_reviews' | 'price_high' | 'price_low'>('highest_rated')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, string[]>>({
    university: [],
    specialization: [],
    language: [],
    country: [],
    degree: [],
  })
  const filterRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useGuides({
    search: searchQuery || undefined,
    university: activeFilters.university[0],
    specialization: activeFilters.specialization[0],
    language: activeFilters.language[0],
    limit: 50,
  })

  const rawGuides = data?.guides ?? []

  const guides = useMemo(() => {
    const sorted = [...rawGuides]
    switch (sortBy) {
      case 'highest_rated':
        return sorted.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
      case 'most_reviews':
        return sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
      case 'price_high':
        return sorted.sort((a, b) => (b.sessionRate ?? 0) - (a.sessionRate ?? 0))
      case 'price_low':
        return sorted.sort((a, b) => (a.sessionRate ?? 0) - (b.sessionRate ?? 0))
      default:
        return sorted
    }
  }, [rawGuides, sortBy])

  const allUniversities = useMemo(
    () => Array.from(new Set(guides.map((g) => g.university).filter(Boolean))) as string[],
    [guides],
  )
  const allSpecializations = useMemo(
    () => Array.from(new Set(guides.flatMap((g) => g.specializations ?? []))),
    [guides],
  )
  const allLanguages = useMemo(
    () => Array.from(new Set(guides.flatMap((g) => g.languages))),
    [guides],
  )
  const allCountries = useMemo(
    () => Array.from(new Set(guides.map((g: any) => g.country).filter(Boolean))) as string[],
    [guides],
  )
  const allDegrees = useMemo(
    () => Array.from(new Set(guides.flatMap((g: any) => g.degrees ?? []).filter(Boolean))) as string[],
    [guides],
  )

  const filterConfig: { key: FilterKey; label: string; icon: typeof MapPin; options: string[] }[] = [
    { key: 'university', label: 'University', icon: Building, options: allUniversities },
    { key: 'specialization', label: 'Expertise', icon: GraduationCap, options: allSpecializations },
    { key: 'language', label: 'Languages', icon: Globe, options: allLanguages },
    { key: 'country', label: 'Country', icon: MapPin, options: allCountries },
    { key: 'degree', label: 'Degree', icon: GraduationCap, options: allDegrees },
  ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(null)
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
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
        [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      }
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({ university: [], specialization: [], language: [], country: [], degree: [] })
    setSearchQuery('')
  }

  const hasActiveFilters = Object.values(activeFilters).some((v) => v.length > 0)
  const popularSearches = ['Data Science', 'MBA', 'Computer Science', 'Investment Banking', 'Product Management']

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">

      {/* ── HERO — scrolls away ───────────────────────────────────────────── */}
      <div
        className="px-6 md:px-8 pt-8 pb-6 bg-white"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#070738]">
            Find Your Perfect Mentor
          </h1>
          <p className="mx-auto mt-1.5 max-w-xl text-sm text-[#070738]/60 leading-relaxed">
            Connect with experienced professionals and alumni who can guide your academic and career journey.
          </p>
        </div>
      </div>

      {/* ── STICKY SEARCH + FILTERS ──────────────────────────────────────── */}
      <div
        className="sticky top-[61px] z-40 bg-white border-b border-[#070738]/8 px-6 md:px-8 pt-4 pb-4 shadow-sm"
        ref={filterRef}
      >
        <div className="mx-auto max-w-3xl">

          {/* Search bar */}
          <div style={{ outline: 'none' }} className="flex items-center gap-2 rounded-lg border border-[#070738]/15 bg-white px-4 py-2.5 shadow-sm focus-within:border-[#070738]/40 focus-within:shadow-md transition-all">
            <Search className="h-4 w-4 flex-shrink-0 text-[#070738]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, expertise, university, or field..."
              style={{ outline: 'none', boxShadow: 'none' }}
              className="w-full border-0 bg-transparent text-sm text-[#070738] placeholder:text-[#070738]/60"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#070738] hover:text-[#070738] transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Popular searches */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs text-[#070738]/60">Popular searches:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="text-xs font-medium text-[#F5B400] hover:text-[#d4970a] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div className="mx-auto max-w-3xl mt-3 flex flex-wrap items-center gap-2">
          {filterConfig.map((filter) => {
            const isOpen = openFilter === filter.key
            const count = activeFilters[filter.key].length
            return (
              <div key={filter.key} className="relative">
                <button
                  onClick={() => setOpenFilter(isOpen ? null : filter.key)}
                  className={[
                    'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition-all',
                    count > 0
                      ? 'border-[#070738] bg-[#070738] text-white'
                      : 'border-[#070738]/20 bg-white text-[#070738]/70 hover:border-[#070738]/40 hover:text-[#070738]',
                  ].join(' ')}
                >
                  <filter.icon className="h-3.5 w-3.5" />
                  {filter.label}
                  {count > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F5B400] text-[9px] font-bold text-[#070738]">
                      {count}
                    </span>
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 z-20 mt-2 w-56 rounded-xl bg-white border border-[#070738]/10 shadow-lg p-2">
                    {filter.options.length === 0 ? (
                      <p className="px-2 py-3 text-xs text-[#070738] text-center">No options available</p>
                    ) : (
                      <div className="max-h-52 overflow-y-auto">
                        {filter.options.map((option) => {
                          const isChecked = activeFilters[filter.key].includes(option)
                          return (
                            <label key={option} className="flex cursor-pointer items-center gap-2.5 px-2 py-2 text-xs rounded-lg hover:bg-[#f4f6fc] transition-colors">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFilter(filter.key, option)}
                                className="h-3.5 w-3.5 accent-[#070738]"
                              />
                              <span className={isChecked ? 'font-semibold text-[#070738]' : 'text-[#070738]/60'}>{option}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs text-[#070738] hover:text-[#070738] transition-colors">
              <X className="h-3 w-3" />Clear all
            </button>
          )}

          <span className="ml-auto text-xs text-[#070738]/60">
            <span className="font-semibold text-[#070738]">{guides.length}</span> mentors
          </span>
        </div>

        {/* Active chips */}
        {hasActiveFilters && (
          <div className="mx-auto max-w-3xl mt-3 flex flex-wrap gap-2">
            {Object.entries(activeFilters).flatMap(([key, values]) =>
              values.map((value) => (
                <span key={`${key}-${value}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#070738]/8 border border-[#070738]/20 px-3 py-1 text-[10px] font-medium text-[#070738]">
                  {value}
                  <button onClick={() => toggleFilter(key as FilterKey, value)} className="hover:text-[#070738]">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── CARDS ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white px-6 md:px-8 py-6">
        <div className="mx-auto max-w-7xl">

          {/* Sort + count row */}
          {!isLoading && guides.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-[#070738]/60">
                Showing <span className="font-semibold text-[#070738]">{guides.length}</span> mentor{guides.length !== 1 ? 's' : ''}
              </span>
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-2 pl-3 pr-3 py-2 text-sm font-medium text-[#070738] border border-[#070738]/20 rounded-lg bg-white hover:border-[#070738]/40 transition-colors"
                >
                  {sortBy === 'highest_rated' && 'Highest Rated'}
                  {sortBy === 'most_reviews' && 'Most Reviews'}
                  {sortBy === 'price_high' && 'Price: High to Low'}
                  {sortBy === 'price_low' && 'Price: Low to High'}
                  <ChevronDown className={`h-3.5 w-3.5 text-[#070738]/50 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-xl border border-[#070738]/10 bg-white shadow-lg overflow-hidden">
                    {([
                      { value: 'highest_rated', label: 'Highest Rated' },
                      { value: 'most_reviews', label: 'Most Reviews' },
                      { value: 'price_high', label: 'Price: High to Low' },
                      { value: 'price_low', label: 'Price: Low to High' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === opt.value
                            ? 'bg-[#070738] text-white font-semibold'
                            : 'text-[#070738] hover:bg-[#f4f6fc]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-24 text-center text-xs text-[#070738] uppercase tracking-widest">
              Loading mentors…
            </div>
          )}

          {!isLoading && guides.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-lg font-semibold text-[#070738]">No mentors found</p>
              <p className="mt-2 text-sm text-[#070738]/60">Try adjusting your search or filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2.5 border border-[#070738] text-[#070738] text-xs font-semibold uppercase tracking-widest hover:bg-[#070738] hover:text-white transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onBook={() => navigate(`/guides/${guide.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

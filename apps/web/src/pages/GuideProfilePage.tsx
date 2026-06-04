import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Star, Globe, GraduationCap, Briefcase,
  ExternalLink, FileText, Link2, MapPin,
} from 'lucide-react'
import { useGuide } from '../hooks/useGuides'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-6">
      <h2 className="mb-4 text-base font-bold text-[#070738] uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

export function GuideProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: guide, isLoading, isError } = useGuide(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 text-sm text-[#070738]/50">
        Loading mentor profile…
      </div>
    )
  }

  if (isError || !guide) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <button onClick={() => navigate('/guides')} className="flex items-center gap-2 text-sm text-[#070738]/60 hover:text-[#070738]">
          <ArrowLeft className="h-4 w-4" /> Back to mentors
        </button>
        <div className="mt-8 rounded-2xl border border-[#070738]/8 bg-white p-12 text-center">
          <p className="text-base font-semibold text-[#070738]">Mentor not found</p>
          <p className="mt-1 text-sm text-[#070738]/50">This profile doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const initials = guide.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2)
  const price = guide.sessionRate ? `$${(guide.sessionRate / 100).toFixed(0)}/hr` : 'Free'

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-8">

        {/* Back */}
        <button
          onClick={() => navigate('/guides')}
          className="mb-6 flex items-center gap-2 text-sm text-[#070738]/55 hover:text-[#070738] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to mentors
        </button>

        {/* ── Hero card ── */}
        <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-6 md:p-8 mb-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">

            {/* Avatar */}
            <div className="flex-shrink-0 h-20 w-20 flex items-center justify-center rounded-full bg-[#070738] text-2xl font-bold text-[#F5B400]">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#070738]">{guide.name}</h1>
                  <p className="mt-0.5 text-base text-[#070738]/65">{guide.currentRole || guide.headline}</p>
                  {guide.university && (
                    <p className="mt-0.5 text-sm text-[#070738]/45 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {guide.university}
                      {guide.graduationYear && ` · Class of ${guide.graduationYear}`}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#070738]/55">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-[#F5B400] text-[#F5B400]" />
                      {guide.averageRating
                        ? <><span className="font-bold text-[#070738]">{guide.averageRating.toFixed(1)}</span><span>({guide.reviewCount} reviews)</span></>
                        : <span className="font-semibold">New</span>
                      }
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {guide.totalSessions} sessions
                    </div>
                    {guide.languages?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {guide.languages.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {guide.linkedinUrl && (
                      <a href={guide.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#070738]/60 hover:text-[#070738] transition-colors">
                        <Link2 className="h-3.5 w-3.5" /> LinkedIn <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {guide.githubUrl && (
                      <a href={guide.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#070738]/60 hover:text-[#070738] transition-colors">
                        <Link2 className="h-3.5 w-3.5" /> GitHub <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {guide.resumeSignedUrl && guide.resumeIsPublic && (
                      <a href={guide.resumeSignedUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#070738]/60 hover:text-[#070738] transition-colors">
                        <FileText className="h-3.5 w-3.5" /> {guide.resumeFileName ?? 'Resume'} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Price + CTA (desktop) */}
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <span className="text-2xl font-bold text-[#070738]">{price}</span>
                  <button
                    onClick={() => navigate(`/guides/${guide.id}/book`)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#070738] text-white text-sm font-semibold rounded-xl hover:bg-[#070738]/90 transition-colors"
                  >
                    <Calendar className="h-4 w-4" /> Book Session
                  </button>
                </div>
              </div>

              {/* Mobile price + CTA */}
              <div className="mt-4 flex items-center justify-between sm:hidden">
                <span className="text-xl font-bold text-[#070738]">{price}</span>
                <button
                  onClick={() => navigate(`/guides/${guide.id}/book`)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#070738] text-white text-sm font-semibold rounded-xl hover:bg-[#070738]/90 transition-colors"
                >
                  <Calendar className="h-4 w-4" /> Book Session
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── Left column (2/3) ── */}
          <div className="md:col-span-2 space-y-5">

            {/* About */}
            {guide.bio && (
              <Section title="About">
                <p className="text-sm text-[#070738]/70 leading-relaxed">{guide.bio}</p>
              </Section>
            )}

            {/* Education */}
            {guide.education?.length > 0 && (
              <Section title="Education">
                <div className="space-y-4">
                  {guide.education.map((edu: any) => (
                    <div key={edu.id} className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-[#070738]/8">
                        <GraduationCap className="h-4 w-4 text-[#070738]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#070738]">{edu.school}</p>
                        <p className="text-sm text-[#070738]/65">{edu.degree} · {edu.major}</p>
                        <p className="text-xs text-[#070738]/45 mt-0.5">
                          {edu.startYear} – {edu.endYear ?? 'Present'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Experience */}
            {guide.experience?.length > 0 && (
              <Section title="Experience">
                <div className="space-y-5">
                  {guide.experience.map((exp: any) => (
                    <div key={exp.id} className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-[#070738]/8">
                        <Briefcase className="h-4 w-4 text-[#070738]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#070738]">{exp.role}</p>
                        <p className="text-sm text-[#070738]/65">{exp.organization}</p>
                        <p className="text-xs text-[#070738]/45 mt-0.5">
                          {exp.startYear} – {exp.isCurrent ? 'Present' : (exp.endYear ?? 'Present')}
                        </p>
                        {exp.responsibilities && (
                          <p className="mt-1.5 text-sm text-[#070738]/60 leading-relaxed">{exp.responsibilities}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Journeys */}
            {guide.journeys?.length > 0 && (
              <Section title="Journeys">
                <div className="space-y-4">
                  {guide.journeys.map((j: any) => (
                    <div key={j.id} className="rounded-xl border border-[#070738]/8 bg-white p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#070738]/8 px-2.5 py-0.5 text-[11px] font-medium text-[#070738]">
                          {j.type}
                        </span>
                        <span className="text-xs text-[#070738]/45">{j.institution} · {j.year}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#070738]">{j.title}</p>
                      {j.description && <p className="mt-1 text-sm text-[#070738]/60 leading-relaxed">{j.description}</p>}
                      {j.outcomes?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {j.outcomes.map((o: string) => (
                            <li key={o} className="text-xs text-[#070738]/55 flex gap-1.5">
                              <span className="text-[#F5B400]">·</span> {o}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* ── Right column (1/3) ── */}
          <div className="space-y-5">

            {/* Specializations */}
            {guide.specializations?.length > 0 && (
              <Section title="Expertise">
                <div className="flex flex-wrap gap-2">
                  {guide.specializations.map((s: string) => (
                    <span key={s} className="px-3 py-1 text-xs font-medium border border-[#070738]/20 text-[#070738]/70 rounded-lg bg-white">
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Book CTA */}
            <button
              onClick={() => navigate(`/guides/${guide.id}/book`)}
              className="flex w-full items-center justify-center gap-2 h-11 bg-[#070738] text-white text-sm font-semibold rounded-xl hover:bg-[#070738]/90 transition-colors"
            >
              <Calendar className="h-4 w-4" /> Book a Session
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
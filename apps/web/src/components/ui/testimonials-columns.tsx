import { Star } from 'lucide-react'

export interface Testimonial {
  text: string
  name: string
  role: string
  initials: string
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="mb-4 p-6 rounded-xl border border-[#070738]/10 bg-white shadow-sm w-full max-w-[300px] flex-shrink-0">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-[#F5B400] text-[#F5B400]" />
        ))}
      </div>
      <p className="text-sm text-[#5B6B85] leading-relaxed">{t.text}</p>
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#070738]/10">
        <div className="h-8 w-8 rounded-full bg-[#F5B400]/15 flex items-center justify-center text-xs font-semibold text-[#F5B400] flex-shrink-0">
          {t.initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#070738] truncate">{t.name}</p>
          <p className="text-xs text-[#5B6B85]/70 truncate">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsColumn({
  testimonials,
  duration = 18,
  className = '',
}: {
  testimonials: Testimonial[]
  duration?: number
  className?: string
}) {
  return (
    <div className={`flex flex-col overflow-hidden max-h-[600px] ${className}`}>
      <div
        className="flex flex-col animate-scroll-up"
        style={{ animationDuration: `${duration}s` }}
      >
        {[...testimonials, ...testimonials].map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>
  )
}

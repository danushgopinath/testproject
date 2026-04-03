import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, GraduationCap, Briefcase, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { BeamsBackground } from '../components/ui/beams-background'
import { TestimonialsColumn, type Testimonial } from '../components/ui/testimonials-columns'

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: '10,000+', label: 'Students Helped' },
  { value: '2,500+', label: 'Expert Guides' },
  { value: '50,000+', label: 'Sessions Booked' },
  { value: '4.9', label: 'Average Rating' },
]


const features = [
  {
    icon: <GraduationCap className="h-5 w-5" />,
    title: 'University Admissions',
    description:
      "Talk to students who got into the exact program you're targeting. Real feedback, real strategies — not recycled advice.",
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    title: 'Internship & Job Hunting',
    description:
      "Get the actual playbook from someone who landed the role you're chasing. Learn what actually moves the needle.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Career Transitions',
    description:
      "Find guides who've made the exact same leap you're planning. Honest perspective from someone who's navigated it already.",
  },
]

const steps = [
  {
    number: '01',
    title: 'Find your person',
    description:
      'Browse guides whose background matches your exact goal — program, company, career path. Filter by specialty, university, and language.',
  },
  {
    number: '02',
    title: 'Book a session',
    description:
      'Pick a time that works. Sessions are focused, one-on-one conversations — no fluff, no templates, just direct guidance.',
  },
  {
    number: '03',
    title: 'Get your answer',
    description:
      "Walk away with clarity you can act on. Whether it's essay feedback, interview prep, or a frank conversation about your path.",
  },
]

const testimonials: Testimonial[] = [
  {
    text: 'My guide helped me turn a vague plan into a concrete roadmap. The honest essay feedback made all the difference.',
    name: 'Sarah Johnson',
    role: 'MIT CS — admitted',
    initials: 'SJ',
  },
  {
    text: "Hearing the actual story behind someone's internship search gave me clarity I never got from YouTube or blogs.",
    name: 'Michael Kim',
    role: 'Product Intern · Berlin',
    initials: 'MK',
  },
  {
    text: 'I booked three sessions with different guides and used their perspectives to make my final choice with confidence.',
    name: 'Ananya Patel',
    role: 'Oxford MEng — admitted',
    initials: 'AP',
  },
  {
    text: 'The mentor helped me refine my personal narrative. I felt so much more prepared going into interviews.',
    name: 'David Lee',
    role: 'Stanford MBA — admitted',
    initials: 'DL',
  },
  {
    text: "Having someone who had been through the exact same process was invaluable. Insider tips I couldn't find anywhere else.",
    name: 'Emma Roberts',
    role: 'Google SWE Intern',
    initials: 'ER',
  },
  {
    text: "Worth every penny. My mentor reviewed my research proposal and helped me articulate my ideas much more clearly.",
    name: 'James Torres',
    role: 'Cambridge MPhil — admitted',
    initials: 'JT',
  },
  {
    text: 'I was completely lost with my application strategy. One session completely reframed how I was approaching everything.',
    name: 'Priya Mehta',
    role: 'LSE Finance — admitted',
    initials: 'PM',
  },
  {
    text: "My guide had been through the same transition. They didn't sugarcoat it, and that honesty was exactly what I needed.",
    name: 'Lucas Chen',
    role: 'Consulting → Tech transition',
    initials: 'LC',
  },
  {
    text: 'Three sessions, three different guides. Each one gave me a completely different angle on my situation. Invaluable.',
    name: 'Fatima Al-Hassan',
    role: 'McKinsey Business Analyst',
    initials: 'FA',
  },
]

const col1 = testimonials.slice(0, 3)
const col2 = testimonials.slice(3, 6)
const col3 = testimonials.slice(6, 9)


// ─── Component ───────────────────────────────────────────────────────────────

export function LandingPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleBecomeMentor = () => {
    sessionStorage.setItem('becomeMentor', 'true')
    if (user) navigate('/dashboard?becomeMentor=true')
    else navigate('/auth/login?becomeMentor=true')
  }

  return (
    <div className="w-full">

      {/* ── 1. HERO — 105dvh mobile, 100dvh desktop ── */}
      <BeamsBackground className="h-[105dvh] md:h-dvh flex flex-col justify-center">
        <div className="mx-auto max-w-5xl px-6 md:px-10 flex flex-col items-center text-center">

          {/* Eyebrow */}
          <div
            className="animate-fade-up inline-flex items-center gap-3 mb-6 md:mb-10"
            style={{ animationDelay: '0ms' }}
          >
            <span className="h-px w-8 bg-[#F5B400]" />
            <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em] font-medium">
              Peer Guidance Marketplace
            </span>
            <span className="h-px w-8 bg-[#F5B400]" />
          </div>

          {/* Headline — scales with vw: 390px→60px, 360px→55px, 1366px→110px */}
          <h1
            className="animate-fade-up font-display font-semibold leading-[0.95] tracking-tight text-white"
            style={{
              fontSize: 'clamp(28px, 15.4vw, 110px)',
              animationDelay: '100ms',
            }}
          >
            {/* Mobile: "from" wraps to its own line. Desktop: stays inline. */}
            Get guidance<span className="hidden md:inline"> from</span>
            <br />
            <span className="inline md:hidden">from<br /></span>
            <em className="text-[#F5B400] not-italic" style={{ fontStyle: 'italic' }}>
              people who've
            </em>
            <br />
            been there.
          </h1>

          {/* Subline */}
          <p
            className="animate-fade-up mt-5 md:mt-8 text-white/55 text-sm md:text-base lg:text-lg max-w-xl leading-relaxed"
            style={{ animationDelay: '220ms' }}
          >
            One conversation with the right person beats a hundred articles.
            Book one-on-one sessions with alumni and professionals from the world's top programs.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up mt-7 md:mt-10 flex flex-wrap gap-4 justify-center"
            style={{ animationDelay: '340ms' }}
          >
            <Link to="/guides">
              <button className="h-12 px-7 bg-[#F5B400] text-[#070738] text-sm font-semibold flex items-center gap-2.5 hover:bg-[#F5B400]/90 transition-colors">
                Find a Guide
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <button
              onClick={handleBecomeMentor}
              className="h-12 px-7 border border-white/20 text-white text-sm font-medium hover:border-white/40 hover:bg-white/5 transition-all"
            >
              Share Your Journey
            </button>
          </div>

        </div>
      </BeamsBackground>

      {/* ── Stats bar — first thing visible on scroll ── */}
      <div className="bg-[#070738] border-t border-white/8">
        <div className="mx-auto max-w-5xl px-6 md:px-10 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:px-10">
                <p
                  className="font-display font-semibold text-[#F5B400] leading-none"
                  style={{ fontSize: 'clamp(40px, 5vw, 64px)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-white/35 text-xs uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. PITCH ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#F7F5F0] py-24 md:py-32 px-6 md:px-10">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Headline */}
          <div>
            <span className="text-[#5B6B85] text-xs uppercase tracking-[0.3em]">Why Expertify</span>
            <h2
              className="mt-4 font-display font-semibold text-[#070738] leading-tight"
              style={{ fontSize: 'clamp(40px, 5vw, 60px)' }}
            >
              The difference
              <br />
              between advice
              <br />
              and{' '}
              <em className="text-primary" style={{ fontStyle: 'italic' }}>
                experience.
              </em>
            </h2>
            <p className="mt-8 text-[#5B6B85] text-base leading-relaxed max-w-md">
              Most guidance comes from people who haven't walked your exact path.
              Our guides have — they've sent the application, survived the process,
              and come out the other side. Their knowledge isn't theoretical.
            </p>
            <Link
              to="/guides"
              className="inline-flex items-center gap-2 mt-10 text-sm font-semibold text-[#070738] border-b border-[#070738] pb-px hover:gap-3 transition-all"
            >
              Meet our guides <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right: Feature list */}
          <div className="space-y-0">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className={`flex gap-5 py-8 ${i < features.length - 1 ? 'border-b border-[#070738]/10' : ''}`}
              >
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center border border-[#070738]/20 text-[#070738]">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#070738] text-sm">{feat.title}</h3>
                  <p className="mt-1.5 text-sm text-[#5B6B85] leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-[#070738] py-24 md:py-32 px-6 md:px-10">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-16 md:mb-20 flex items-end justify-between border-b border-white/8 pb-8">
            <div>
              <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em]">The Process</span>
              <h2
                className="mt-3 font-display font-semibold text-white leading-none"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
              >
                Simple by design
              </h2>
            </div>
            <Link to="/guides" className="hidden md:flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
              Start now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/8">
            {steps.map((step) => (
              <div key={step.number} className="relative px-0 md:px-10 py-10 md:py-0 first:pl-0 last:pr-0">
                {/* Huge background number */}
                <span
                  className="absolute top-0 right-0 md:-top-4 md:right-4 font-display font-bold text-white/[0.12] leading-none select-none pointer-events-none"
                  style={{ fontSize: '120px' }}
                >
                  {step.number}
                </span>
                <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em]">
                  Step {step.number}
                </span>
                <h3
                  className="mt-4 font-display font-semibold text-white leading-tight"
                  style={{ fontSize: 'clamp(24px, 2.5vw, 32px)' }}
                >
                  {step.title}
                </h3>
                <p className="mt-4 text-sm text-white/45 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="bg-[#F7F5F0] py-24 md:py-32">
        {/* Header */}
        <div className="mx-auto max-w-6xl px-6 md:px-10 mb-14">
          <span className="text-[#5B6B85] text-xs uppercase tracking-[0.3em]">Student Stories</span>
          <h2
            className="mt-3 font-display font-semibold text-[#070738] leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
          >
            Real results,
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B6B85' }}>real people.</em>
          </h2>
        </div>

        {/* Animated columns */}
        <div
          className="flex gap-4 justify-center px-6 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
            maxHeight: '600px',
          }}
        >
          <TestimonialsColumn testimonials={col1} duration={20} />
          <TestimonialsColumn testimonials={col2} duration={25} className="hidden md:flex" />
          <TestimonialsColumn testimonials={col3} duration={18} className="hidden lg:flex" />
        </div>
      </section>

      {/* ── 6. CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#070738] py-28 md:py-36 px-6 md:px-10 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div
            className="font-display font-bold text-white text-center leading-none select-none"
            style={{ fontSize: 'clamp(120px, 25vw, 300px)' }}
          >
            E
          </div>
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-block h-px w-16 bg-[#F5B400] mb-10" />
          <h2
            className="font-display font-semibold text-white leading-tight"
            style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
          >
            One conversation
            <br />
            <em className="text-[#F5B400]" style={{ fontStyle: 'italic' }}>
              changes everything.
            </em>
          </h2>
          <p className="mt-6 text-white/40 text-base max-w-md mx-auto leading-relaxed">
            Join thousands of students who found their path through a single honest conversation
            with someone who had already been there.
          </p>
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link to="/guides">
              <button className="h-13 px-10 bg-[#F5B400] text-[#070738] text-sm font-semibold flex items-center gap-2.5 hover:bg-[#F5B400]/90 transition-colors">
                Find a Guide
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <button
              onClick={handleBecomeMentor}
              className="h-13 px-10 border border-white/15 text-white/70 text-sm font-medium hover:border-white/30 hover:text-white transition-all"
            >
              Become a Mentor
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}

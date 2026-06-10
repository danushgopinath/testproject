import { Link } from 'react-router-dom'
import { ArrowRight, Search, CalendarCheck, MessageCircle, Star, CheckCircle, XCircle } from 'lucide-react'

const seekerSteps = [
  {
    number: '01',
    icon: <Search className="h-5 w-5" />,
    title: 'Find your person',
    description:
      'Browse guides whose background matches your exact goal — target program, company, or career path. Filter by specialization, university, and language.',
  },
  {
    number: '02',
    icon: <CalendarCheck className="h-5 w-5" />,
    title: 'Book a session',
    description:
      'Send a session request with your specific topic. The guide reviews it and confirms a time. Sessions are focused, one-on-one conversations.',
  },
  {
    number: '03',
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'Get your answer',
    description:
      "Walk away with clarity you can act on — essay feedback, interview prep, or a frank conversation about whether your path makes sense.",
  },
  {
    number: '04',
    icon: <Star className="h-5 w-5" />,
    title: 'Leave a review',
    description:
      'Help the next seeker. An honest rating after your session builds the trust that makes the whole platform work.',
  },
]

const guideSteps = [
  {
    number: '01',
    title: 'Create your profile',
    description:
      'Share the journeys you can speak to honestly — universities you applied to, roles you landed, programs you navigated. No embellishment needed.',
  },
  {
    number: '02',
    title: 'Set your availability',
    description:
      'Decide if sessions are free or paid, choose your hourly rate, and set your schedule. You control when and how often you take sessions.',
  },
  {
    number: '03',
    title: 'Accept or decline requests',
    description:
      'Every session request lands in your inbox. Review the topic and seeker background, then accept if it\'s a good fit. No obligation to take every request.',
  },
  {
    number: '04',
    title: 'Build your track record',
    description:
      'Each session adds to your rating. Strong guides get more visibility, more requests, and a reputation that carries weight on the platform.',
  },
]

const isItems = [
  'One-on-one guidance from someone who has personally done what you\'re trying to do',
  'Honest, specific feedback based on lived experience — not generic advice',
  'A focused conversation around a topic you bring to the session',
  'A place for early-career professionals and students to connect with peers ahead of them',
]

const isNotItems = [
  'Admissions consulting, essay writing, or application ghostwriting',
  'Career coaching or therapy from licensed professionals',
  'A guarantee of any outcome — guides share experience, not certainty',
  'A place to oversell credentials or mislead seekers about your background',
]

const faqs = [
  {
    q: 'How long is a session?',
    a: 'Sessions are typically 30 or 60 minutes, set by the guide. You\'ll see the duration before booking.',
  },
  {
    q: 'What happens after I send a session request?',
    a: 'The guide reviews your request and either accepts or declines. If accepted, you\'ll receive a confirmation email with the session details. If declined, no charge is made.',
  },
  {
    q: 'Are sessions free?',
    a: 'Some guides offer free sessions. Others set an hourly rate. The price is always shown on the guide\'s profile before you book.',
  },
  {
    q: 'Can I message a guide before booking?',
    a: 'Messaging is available once you have a session (pending, confirmed, or completed) with that guide. It\'s designed for pre- and post-session follow-up.',
  },
  {
    q: 'What if the session doesn\'t go well?',
    a: 'Leave an honest review — that\'s how the community self-corrects. For serious issues, contact us at support@expertify.io.',
  },
]

export function HowItWorksPage() {
  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <section className="bg-[#070738] py-28 md:py-36 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <div
            className="absolute right-0 top-0 font-bold text-white leading-none select-none"
            style={{ fontSize: '500px', lineHeight: 1 }}
          >
            ?
          </div>
        </div>
        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#F5B400]" />
            <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em] font-medium">The Process</span>
            <span className="h-px w-8 bg-[#F5B400]" />
          </div>
          <h1
            className="font-display font-semibold text-white leading-[0.95] tracking-tight"
            style={{ fontSize: 'clamp(40px, 7vw, 88px)' }}
          >
            How Expertify
            <br />
            <em className="text-[#F5B400]" style={{ fontStyle: 'italic' }}>actually works.</em>
          </h1>
          <p className="mt-8 text-white/50 text-base md:text-lg leading-relaxed max-w-xl">
            Built for students and early-career professionals who want honest, specific guidance
            from people who have actually done what they're trying to do.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/guides">
              <button className="h-11 px-7 bg-[#F5B400] text-[#070738] text-sm font-semibold flex items-center gap-2.5 hover:bg-[#F5B400]/90 transition-colors">
                Find a Guide
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── For Seekers ── */}
      <section className="bg-[#F7F5F0] py-24 md:py-32 px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex items-end justify-between border-b border-[#070738]/10 pb-8">
            <div>
              <span className="text-[#5B6B85] text-xs uppercase tracking-[0.3em]">For Seekers</span>
              <h2
                className="mt-3 font-display font-semibold text-[#070738] leading-none"
                style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}
              >
                Find clarity in four steps
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {seekerSteps.map((step) => (
              <div key={step.number} className="relative">
                <span
                  className="absolute -top-4 right-0 font-display font-bold text-[#070738]/[0.06] leading-none select-none"
                  style={{ fontSize: '100px' }}
                >
                  {step.number}
                </span>
                <div className="relative">
                  <div className="mb-4 h-10 w-10 flex items-center justify-center border border-[#070738]/20 text-[#070738]">
                    {step.icon}
                  </div>
                  <span className="text-[#F5B400] text-xs uppercase tracking-[0.25em] font-medium">Step {step.number}</span>
                  <h3 className="mt-2 font-display font-semibold text-[#070738] text-xl leading-tight">{step.title}</h3>
                  <p className="mt-3 text-sm text-[#5B6B85] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Guides ── */}
      <section className="bg-[#070738] py-24 md:py-32 px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex items-end justify-between border-b border-white/8 pb-8">
            <div>
              <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em]">For Guides</span>
              <h2
                className="mt-3 font-display font-semibold text-white leading-none"
                style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}
              >
                Share your experience
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/8">
            {guideSteps.map((step, i) => (
              <div key={step.number} className={`relative ${i > 0 ? 'md:pl-10' : ''} ${i < guideSteps.length - 1 ? 'md:pr-10' : ''} py-6 md:py-0`}>
                <span
                  className="absolute top-0 right-0 font-display font-bold text-white/[0.06] leading-none select-none"
                  style={{ fontSize: '100px' }}
                >
                  {step.number}
                </span>
                <span className="text-[#F5B400] text-xs uppercase tracking-[0.25em] font-medium">Step {step.number}</span>
                <h3
                  className="mt-4 font-display font-semibold text-white leading-tight"
                  style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}
                >
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-white/45 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What it is / is not ── */}
      <section className="bg-white py-24 md:py-32 px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="text-[#5B6B85] text-xs uppercase tracking-[0.3em]">Clarity</span>
            <h2
              className="mt-3 font-display font-semibold text-[#070738] leading-none"
              style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}
            >
              What Expertify is — and isn't
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#F7F5F0] p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#070738] mb-6">Expertify is</p>
              <ul className="space-y-4">
                {isItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                    <span className="text-sm text-[#5B6B85] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#070738]/10 bg-white p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#070738] mb-6">Expertify is not</p>
              <ul className="space-y-4">
                {isNotItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#5B6B85]" />
                    <span className="text-sm text-[#5B6B85] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#F7F5F0] py-24 md:py-32 px-6 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14">
            <span className="text-[#5B6B85] text-xs uppercase tracking-[0.3em]">Common Questions</span>
            <h2
              className="mt-3 font-display font-semibold text-[#070738] leading-none"
              style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}
            >
              FAQ
            </h2>
          </div>

          <div className="divide-y divide-[#070738]/10">
            {faqs.map(({ q, a }) => (
              <div key={q} className="py-6">
                <p className="font-semibold text-[#070738] text-sm">{q}</p>
                <p className="mt-2 text-sm text-[#5B6B85] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#070738] py-24 md:py-32 px-6 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block h-px w-16 bg-[#F5B400] mb-10" />
          <h2
            className="font-display font-semibold text-white leading-tight"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
          >
            Ready to find
            <br />
            <em className="text-[#F5B400]" style={{ fontStyle: 'italic' }}>your guide?</em>
          </h2>
          <p className="mt-6 text-white/40 text-base max-w-md mx-auto leading-relaxed">
            One honest conversation with someone who's been there is worth more than a hundred articles.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/guides">
              <button className="h-11 px-8 bg-[#F5B400] text-[#070738] text-sm font-semibold flex items-center gap-2.5 hover:bg-[#F5B400]/90 transition-colors">
                Browse Guides
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link to="/auth/signup">
              <button className="h-11 px-8 border border-white/20 text-white text-sm font-medium hover:border-white/40 hover:bg-white/5 transition-all">
                Become a Guide
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
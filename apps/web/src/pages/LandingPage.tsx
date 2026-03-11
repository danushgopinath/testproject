import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Star, CheckCircle, Shield, Globe, Target, Users, Heart } from 'lucide-react'
import { Button } from '../components/atoms/Button'
import { useAuthStore } from '../stores/authStore'

const stats = [
  { label: 'Active Students', value: '10,000+' },
  { label: 'Expert Mentors', value: '2,500+' },
  { label: 'Sessions Completed', value: '50,000+' },
  { label: 'Average Rating', value: '4.9/5' },
]

const regions = [
  { flag: '🇺🇸', name: 'United States', count: '6 universities', items: ['MIT', 'Stanford University', 'Harvard University'], more: '+ 3 more' },
  { flag: '🇬🇧', name: 'United Kingdom', count: '6 universities', items: ['Oxford University', 'Cambridge University', 'Imperial College London'], more: '+ 3 more' },
  { flag: '🇨🇦', name: 'Canada', count: '6 universities', items: ['University of Toronto', 'UBC', 'McGill University'], more: '+ 3 more' },
  { flag: '🇦🇺', name: 'Australia', count: '6 universities', items: ['University of Melbourne', 'Australian National University', 'University of Sydney'], more: '+ 3 more' },
  { flag: '🇩🇪', name: 'Germany', count: '6 universities', items: ['Technical University of Munich', 'RWTH Aachen', 'University of Heidelberg'], more: '+ 3 more' },
  { flag: '🇳🇱', name: 'Netherlands', count: '6 universities', items: ['Delft University', 'University of Amsterdam', 'Eindhoven University'], more: '+ 3 more' },
]

const testimonials = [
  { initials: 'SJ', name: 'Sarah Johnson', role: 'MIT CS admit', quote: '"My guide helped me turn a vague application plan into a concrete roadmap. The honest feedback on my essays made all the difference."' },
  { initials: 'MK', name: 'Michael Kim', role: 'Product intern · Berlin', quote: '"Hearing the actual story behind someone\'s internship search gave me clarity I never got from YouTube or blogs."' },
  { initials: 'AP', name: 'Ananya Patel', role: 'Oxford MEng admit', quote: '"I booked three short sessions with different guides and used their perspectives to make my final choice with confidence."' },
  { initials: 'DL', name: 'David Lee', role: 'Stanford MBA admit', quote: '"The mentor helped me refine my personal narrative and application strategy. I felt so much more prepared for interviews."' },
  { initials: 'ER', name: 'Emma Roberts', role: 'Google SWE intern', quote: '"Having someone who had been through the exact same process was invaluable. My mentor gave me insider tips I couldn\'t find anywhere else."' },
  { initials: 'JT', name: 'James Torres', role: 'Cambridge MPhil admit', quote: '"The session was worth every penny. My mentor reviewed my research proposal and helped me articulate my ideas much more clearly."' },
]

function TestimonialCard({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <article className="mr-5 flex w-[350px] flex-shrink-0 flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm md:w-[380px]">
      <div className="space-y-3">
        <div className="flex items-center gap-1 text-accent">
          {Array.from({ length: 5 }).map((_s, idx) => (
            <Star key={`star-${t.name}-${idx}`} className="h-4 w-4 fill-accent text-accent" />
          ))}
        </div>
        <p className="text-base leading-relaxed text-text-primary">{t.quote}</p>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {t.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{t.name}</p>
          <p className="text-sm text-text-muted">{t.role}</p>
        </div>
      </div>
    </article>
  )
}

export function LandingPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleBecomeMentor = () => {
    // Store flag that user wants to become a mentor
    sessionStorage.setItem('becomeMentor', 'true')
    if (user) {
      navigate('/dashboard?becomeMentor=true')
    } else {
      navigate('/auth/login?becomeMentor=true')
    }
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-slate-50 to-background px-6 py-16 md:px-10 md:py-24 lg:py-28">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center gap-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary">
            ✨ Trusted by 10,000+ Students Worldwide
          </span>
          <h1 className="max-w-5xl text-5xl font-bold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
            Find <span className="text-primary">Expert Guidance</span>{' '}
            <br className="hidden sm:block" />
            for Your{' '}
            <span className="text-accent">Next Big Step</span>
          </h1>
          <p className="max-w-3xl text-lg text-text-muted sm:text-xl md:text-2xl leading-relaxed">
            Get personalized guidance from experienced alumni and
            professionals who&apos;ve walked your path. Book one-on-one sessions
            and accelerate your academic and career success.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
            <Link to="/guides">
              <Button size="lg" className="h-14 px-10 text-lg font-semibold">
                <span className="flex items-center gap-3">
                  Find Your Mentor
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="h-14 px-10 text-lg font-semibold"
              onClick={handleBecomeMentor}
            >
              Become a Mentor
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-sm text-text-muted md:text-base">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-text-muted" />
              <span>No Setup Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-text-muted" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-text-muted" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — light background with dark blue text */}
      <section className="w-full border-y border-border bg-slate-50 px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 text-center sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p className="text-4xl font-bold text-primary md:text-5xl lg:text-6xl">{stat.value}</p>
              <p className="text-sm text-text-muted md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="w-full border-y border-border bg-background px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Target className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
                Empowering Students Through Expert Guidance
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-text-muted md:text-lg">
                <p>
                  At Expertify, we believe that every student deserves access to personalized guidance from
                  experienced professionals who have walked their path. Our platform bridges the gap between
                  ambitious students and accomplished mentors, creating meaningful connections that drive success.
                </p>
                <p>
                  Whether you're applying to top universities, preparing for interviews, or navigating career
                  transitions, Expertify connects you with mentors who can provide the insights and support you need.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
                <div className="relative flex h-80 w-80 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <Target className="h-40 w-40 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="w-full border-y border-border bg-surface/30 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <Heart className="h-4 w-4" />
              Our Values
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
              What We Stand For
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted md:text-lg">
              The principles that guide everything we do at Expertify
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">Community</h3>
              <p className="text-sm leading-relaxed text-text-muted">
                Building a supportive network of students and mentors who learn and grow together.
              </p>
            </div>
            <div className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">Empathy</h3>
              <p className="text-sm leading-relaxed text-text-muted">
                Understanding the challenges students face and providing compassionate, personalized support.
              </p>
            </div>
            <div className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">Excellence</h3>
              <p className="text-sm leading-relaxed text-text-muted">
                Maintaining high standards in mentorship quality and student outcomes.
              </p>
            </div>
            <div className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">Trust</h3>
              <p className="text-sm leading-relaxed text-text-muted">
                Creating a safe, secure platform where students and mentors can connect with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full border-y border-border bg-background px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <ArrowRight className="h-4 w-4" />
              How It Works
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
              Get Started in Three Simple Steps
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted md:text-lg">
              Your journey to expert guidance starts here
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group relative text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-xl">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">Find Your Mentor</h3>
              <p className="text-sm leading-relaxed text-text-muted md:text-base">
                Browse our directory of expert mentors from top universities and companies worldwide. Filter by expertise, availability, and ratings.
              </p>
            </div>
            <div className="group relative text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-xl">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">Book a Session</h3>
              <p className="text-sm leading-relaxed text-text-muted md:text-base">
                Schedule a one-on-one session at a time that works for you. Choose from various session types and durations that fit your needs.
              </p>
            </div>
            <div className="group relative text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-xl">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">Get Guidance</h3>
              <p className="text-sm leading-relaxed text-text-muted md:text-base">
                Connect with your mentor, get personalized advice, and accelerate your journey to success. Follow up with additional sessions as needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="w-full px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-muted">
              <Globe className="h-4 w-4" />
              Global Reach
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary md:text-4xl lg:text-5xl">
              Available Worldwide
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-text-muted md:text-lg">
              Connect with mentors from top universities across the globe
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <article key={region.name} className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{region.flag}</span>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{region.name}</p>
                    <p className="text-sm text-text-muted">{region.count}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-text-muted">
                  {region.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40" />
                    {region.more}
                  </li>
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — continuous one-way scroll */}
      <section className="w-full border-t border-border bg-surface/50 py-16 md:py-20 overflow-hidden">
        <div className="mx-auto max-w-6xl space-y-10 px-6 md:px-10">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              Success Stories
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary md:text-4xl lg:text-5xl">
              What Students Say
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-text-muted md:text-lg">
              Real experiences from students who booked conversations on Expertify.
            </p>
          </div>
        </div>

        {/* Scrolling track */}
        <div className="mt-10 flex animate-scroll hover:[animation-play-state:paused]">
          {testimonials.map((t) => (
            <TestimonialCard key={`a-${t.name}`} t={t} />
          ))}
          {testimonials.map((t) => (
            <TestimonialCard key={`b-${t.name}`} t={t} />
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="w-full bg-gradient-to-r from-primary via-primary/90 to-accent px-6 py-16 text-center text-white md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Ready to Start Your Journey?</h2>
          <p className="mt-4 text-base text-white/80 md:text-lg">
            Join thousands of students who have successfully navigated their journey with expert guidance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/guides">
              <Button size="lg" variant="secondary" className="h-14 px-10 text-base font-semibold border-2 border-white/20">
                Browse Mentors
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

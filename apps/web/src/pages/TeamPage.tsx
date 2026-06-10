import { Link } from 'react-router-dom'

const members = [
  {
    initials: 'DG',
    name: 'Danush Gopinath',
    role: 'Founder & CEO',
    bio: 'Built Expertify to solve the problem he faced firsthand — getting actionable guidance from people who\'ve actually been through the process, not just read about it.',
    linkedin: '#',
  },
  {
    initials: 'AR',
    name: 'Aanya Rajan',
    role: 'Head of Product',
    bio: 'Obsessed with the moment a seeker finds exactly the right guide. Shapes every feature around making that match faster, easier, and more meaningful.',
    linkedin: '#',
  },
  {
    initials: 'KM',
    name: 'Kiran Mehta',
    role: 'Lead Engineer',
    bio: 'Keeps the platform fast, reliable, and secure. Believes great software should be invisible — you only notice it when something goes wrong.',
    linkedin: '#',
  },
  {
    initials: 'SL',
    name: 'Sophia Lin',
    role: 'Community & Partnerships',
    bio: 'Recruits the guides that make Expertify worth using. Works closely with universities and companies to bring real experts onto the platform.',
    linkedin: '#',
  },
]

const values = [
  { title: 'Radical honesty', body: 'We tell seekers when a guide might not be the right fit. We tell guides when a session didn\'t go well. Honest feedback is how everyone improves.' },
  { title: 'Real experience only', body: 'Guides share what they\'ve personally lived through — no theoretical advice, no recycled blog posts. If you haven\'t been there, you can\'t guide there.' },
  { title: 'Access for all', body: 'Great guidance shouldn\'t depend on who your parents know. We\'re building the network that everyone deserves access to.' },
]

export function TeamPage() {
  return (
    <div className="w-full">

      {/* Hero */}
      <section className="bg-[#070738] py-20 md:py-28 px-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#F5B400]" />
            <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em] font-medium">Our Team</span>
            <span className="h-px w-8 bg-[#F5B400]" />
          </div>
          <h1
            className="font-display font-semibold text-white leading-tight"
            style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
          >
            The people building
            <br />
            <em className="text-[#F5B400]" style={{ fontStyle: 'italic' }}>Expertify.</em>
          </h1>
          <p className="mt-6 text-white/50 text-base leading-relaxed max-w-xl">
            A small, focused team on a mission to make peer guidance accessible to everyone — not just those lucky enough to know the right people.
          </p>
        </div>
      </section>

      {/* Team grid */}
      <section className="bg-[#F7F5F0] px-6 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {members.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl border border-[#070738]/8 p-8 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-full bg-[#070738] text-base font-bold text-[#F5B400]">
                    {m.initials}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#070738] leading-tight">{m.name}</p>
                    <p className="text-xs text-[#F5B400] font-medium uppercase tracking-wider mt-0.5">{m.role}</p>
                  </div>
                </div>
                <p className="text-sm text-[#5B6B85] leading-relaxed">{m.bio}</p>
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#070738]/50 hover:text-[#070738] transition-colors mt-auto"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white px-6 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#F5B400]" />
              <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em] font-medium">What we believe</span>
              <span className="h-px w-8 bg-[#F5B400]" />
            </div>
            <h2
              className="font-display font-semibold text-[#070738] leading-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
            >
              Our values
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="border-l-2 border-[#F5B400] pl-6 py-1">
                <p className="text-base font-semibold text-[#070738] mb-2">{v.title}</p>
                <p className="text-sm text-[#5B6B85] leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#070738] px-6 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[#F5B400] text-xs uppercase tracking-[0.3em] font-medium mb-4">Join us</p>
          <h2
            className="font-display font-semibold text-white leading-tight mb-6"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            Want to be part of this?
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            We're always looking for people who care deeply about making guidance accessible. Reach out if that sounds like you.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#F5B400] text-[#070738] text-sm font-bold px-6 py-3 rounded-full hover:bg-[#F5B400]/90 transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </section>

    </div>
  )
}
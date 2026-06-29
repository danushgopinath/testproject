import { useState, type ReactNode } from 'react'
import { MessageSquare } from 'lucide-react'

const contacts = [
  { icon: MessageSquare, label: 'Support', email: 'support@expertify.io' },
]

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="w-full">

      {/* Hero */}
      <section className="bg-[#070738] py-20 md:py-28 px-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#F5B400]" />
            <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em] font-medium">Contact</span>
            <span className="h-px w-8 bg-[#F5B400]" />
          </div>
          <h1
            className="font-display font-semibold text-white leading-tight"
            style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
          >
            We'd love to
            <br />
            <em className="text-[#F5B400]" style={{ fontStyle: 'italic' }}>hear from you.</em>
          </h1>
          <p className="mt-6 text-white/50 text-base leading-relaxed max-w-xl">
            Whether you have a question, want to partner with us, or just want to say hello — drop us a message and we'll get back to you within one business day.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[#F7F5F0] px-6 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl grid gap-12 md:grid-cols-[1fr_380px]">

          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#070738]/8 p-8 md:p-10">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#070738] mb-5">
                  <svg className="h-6 w-6 text-[#F5B400]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-[#070738] mb-2">Message sent!</h2>
                <p className="text-sm text-[#5B6B85] leading-relaxed max-w-xs">
                  Thanks for reaching out. We'll be in touch within one business day.
                </p>
                <button
                  onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setSent(false) }}
                  className="mt-8 text-xs font-medium text-[#070738]/50 hover:text-[#070738] transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-[#070738] mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Your name" required>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Jane Smith"
                        className="w-full rounded-lg border border-[#070738]/15 bg-[#F7F5F0] px-4 py-2.5 text-sm text-[#070738] placeholder:text-[#070738]/40 focus:border-[#070738]/40 focus:outline-none transition-colors"
                      />
                    </Field>
                    <Field label="Email address" required>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="jane@example.com"
                        className="w-full rounded-lg border border-[#070738]/15 bg-[#F7F5F0] px-4 py-2.5 text-sm text-[#070738] placeholder:text-[#070738]/40 focus:border-[#070738]/40 focus:outline-none transition-colors"
                      />
                    </Field>
                  </div>
                  <Field label="Subject" required>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="How can we help?"
                      className="w-full rounded-lg border border-[#070738]/15 bg-[#F7F5F0] px-4 py-2.5 text-sm text-[#070738] placeholder:text-[#070738]/40 focus:border-[#070738]/40 focus:outline-none transition-colors"
                    />
                  </Field>
                  <Field label="Message" required>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us a bit more…"
                      className="w-full rounded-lg border border-[#070738]/15 bg-[#F7F5F0] px-4 py-2.5 text-sm text-[#070738] placeholder:text-[#070738]/40 focus:border-[#070738]/40 focus:outline-none transition-colors resize-none"
                    />
                  </Field>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#070738] py-3 text-sm font-semibold text-white hover:bg-[#070738]/90 transition-colors"
                  >
                    Send message
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#070738] mb-5">Direct lines</p>
              <div className="flex flex-col gap-4">
                {contacts.map(({ icon: Icon, label, email }) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="flex items-start gap-4 rounded-xl bg-white border border-[#070738]/8 p-5 hover:border-[#070738]/20 transition-colors group"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#070738]/6 group-hover:bg-[#070738] transition-colors">
                      <Icon className="h-4 w-4 text-[#070738] group-hover:text-[#F5B400] transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-[#5B6B85] mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-[#070738]">{email}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[#070738] p-6 mt-2">
              <p className="text-[#F5B400] text-xs uppercase tracking-[0.2em] font-medium mb-3">Response time</p>
              <p className="text-white text-sm leading-relaxed">
                We reply to every message within <span className="font-semibold text-white">one business day</span>. For urgent issues, email support directly.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#070738]">
        {label}{required && <span className="text-[#F5B400] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
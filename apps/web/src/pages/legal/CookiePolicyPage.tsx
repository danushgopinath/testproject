import React from 'react'

const lastUpdated = 'June 9, 2026'

export function CookiePolicyPage() {
  return (
    <div className="w-full">

      {/* Hero */}
      <section className="bg-[#070738] py-20 md:py-28 px-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#F5B400]" />
            <span className="text-[#F5B400] text-xs uppercase tracking-[0.3em] font-medium">Legal</span>
            <span className="h-px w-8 bg-[#F5B400]" />
          </div>
          <h1
            className="font-display font-semibold text-white leading-tight"
            style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
          >
            Cookie Policy
          </h1>
          <p className="mt-4 text-white/40 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[#F7F5F0] px-6 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-10">

          <Lead>
            This Cookie Policy explains how Expertify uses cookies and similar technologies. By using Expertify, you
            consent to the use of cookies as described below.
          </Lead>

          <S title="1. What Are Cookies?">
            <P>
              Cookies are small text files placed on your device by a website when you visit it. They allow the
              website to remember your actions and preferences over time, so you do not have to re-enter information
              each time you visit or navigate between pages.
            </P>
          </S>

          <S title="2. Cookies We Use">
            <div className="overflow-hidden rounded-xl border border-[#070738]/10 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#070738] text-white">
                  <tr>
                    {['Cookie', 'Type', 'Purpose', 'Duration'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#070738]/8">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs text-[#070738]">refreshToken</td>
                    <td className="px-4 py-3 text-[#5B6B85]">Essential</td>
                    <td className="px-4 py-3 text-[#5B6B85]">Keeps you signed in between sessions via a secure HTTP-only cookie.</td>
                    <td className="px-4 py-3 text-[#5B6B85] whitespace-nowrap">7 days</td>
                  </tr>
                  <tr className="bg-[#F7F5F0]">
                    <td className="px-4 py-3 font-mono text-xs text-[#070738]">accessToken</td>
                    <td className="px-4 py-3 text-[#5B6B85]">Essential</td>
                    <td className="px-4 py-3 text-[#5B6B85]">Short-lived token stored in memory (not a cookie) used to authenticate API requests.</td>
                    <td className="px-4 py-3 text-[#5B6B85] whitespace-nowrap">15 min</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs text-[#070738]">__session</td>
                    <td className="px-4 py-3 text-[#5B6B85]">Functional</td>
                    <td className="px-4 py-3 text-[#5B6B85]">Preserves your active role (Seeker/Guide) and UI preferences across page loads.</td>
                    <td className="px-4 py-3 text-[#5B6B85] whitespace-nowrap">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <P>We intentionally minimize cookie usage. We do not use third-party advertising or tracking cookies.</P>
          </S>

          <S title="3. Third-Party Cookies">
            <P>Some features involve third-party services that may set their own cookies:</P>
            <Li>
              <strong className="font-semibold text-[#070738]">Google OAuth:</strong>{' '}
              If you sign in with Google, Google may set cookies to manage the authentication flow, governed by{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Privacy Policy</a>.
            </Li>
            <Li>
              <strong className="font-semibold text-[#070738]">LinkedIn OAuth:</strong>{' '}
              If you sign in with LinkedIn, LinkedIn may set cookies during authentication, governed by{' '}
              <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn's Privacy Policy</a>.
            </Li>
            <P>We do not integrate with advertising networks, social media tracking pixels, or third-party analytics platforms.</P>
          </S>

          <S title="4. Managing Cookies">
            <P>You can control cookies through your browser settings. Most browsers allow you to:</P>
            <Li>View cookies stored by a website and delete them individually.</Li>
            <Li>Block third-party cookies.</Li>
            <Li>Block all cookies (note: this will prevent you from staying signed in to Expertify).</Li>
            <Li>Set your browser to notify you when a website attempts to set a cookie.</Li>
            <P>Instructions for common browsers:</P>
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                { label: 'Chrome', href: 'https://support.google.com/chrome/answer/95647' },
                { label: 'Firefox', href: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer' },
                { label: 'Safari', href: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
                { label: 'Edge', href: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="rounded-full border border-[#070738]/20 bg-white px-4 py-1.5 text-xs font-medium text-[#070738] hover:bg-[#070738] hover:text-white transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </S>

          <S title="5. Do Not Track">
            <P>
              Some browsers include a "Do Not Track" (DNT) signal. Because there is no industry-standard
              interpretation of DNT, Expertify does not currently respond differently to DNT requests. We encourage
              you to use your browser's cookie controls directly.
            </P>
          </S>

          <S title="6. Changes to This Policy">
            <P>
              We may update this Cookie Policy to reflect changes in technology, regulation, or our practices.
              We will update the "Last updated" date and, for significant changes, notify you via email or in-app notice.
            </P>
          </S>

          <S title="7. Contact">
            <P>Questions about cookies or this policy?</P>
            <address className="not-italic text-sm text-[#5B6B85]">
              <p>Expertify — <a href="mailto:privacy@expertify.io" className="text-primary hover:underline">privacy@expertify.io</a></p>
            </address>
          </S>

        </div>
      </section>
    </div>
  )
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-[#5B6B85] leading-relaxed border-l-2 border-[#F5B400] pl-5">{children}</p>
}
function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-[#070738]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
function Li({ children }: { children: React.ReactNode }) {
  return <li className="flex gap-2 text-sm text-[#5B6B85] leading-relaxed list-none"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#F5B400]" /><span>{children}</span></li>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#5B6B85] leading-relaxed">{children}</p>
}
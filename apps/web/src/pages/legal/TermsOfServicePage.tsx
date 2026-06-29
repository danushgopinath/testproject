import React from 'react'

const lastUpdated = 'June 9, 2026'

export function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="mt-4 text-white/40 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[#F7F5F0] px-6 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-10">

          <Lead>
            These Terms of Service govern your access to and use of Expertify. By creating an account or using the
            Service, you agree to be bound by these Terms. If you do not agree, do not use Expertify.
          </Lead>

          <S title="1. Eligibility">
            <P>
              You must be at least 18 years old to use Expertify. By using the Service, you represent and warrant
              that you meet this requirement and have the legal capacity to enter into a binding agreement.
            </P>
          </S>

          <S title="2. Your Account">
            <Li>You are responsible for maintaining the confidentiality of your login credentials and all activity under your account.</Li>
            <Li>You must provide accurate, complete, and up-to-date information when creating your account and profile.</Li>
            <Li>You may not impersonate another person or use a false identity on the platform.</Li>
            <Li>Notify us immediately at <a href="mailto:support@expertify.io" className="text-primary hover:underline">support@expertify.io</a> if you suspect unauthorized use of your account.</Li>
            <Li>We reserve the right to suspend or terminate accounts that violate these Terms.</Li>
          </S>

          <S title="3. Guide Responsibilities">
            <P>If you register as a guide, you agree to:</P>
            <Li>Represent your experience, credentials, and background accurately and honestly.</Li>
            <Li>Only claim familiarity with journeys you have personally completed.</Li>
            <Li>Respond to session requests and messages in a timely manner.</Li>
            <Li>Conduct sessions professionally and in good faith, focused on the seeker's stated topic.</Li>
            <Li>Not solicit payment, referrals, or compensation outside the Expertify platform.</Li>
            <Li>Not provide advice requiring a professional license (legal, medical, financial) and to direct seekers to appropriate professionals when such topics arise.</Li>
          </S>

          <S title="4. Seeker Responsibilities">
            <P>If you register as a seeker, you agree to:</P>
            <Li>Attend booked sessions on time or cancel with reasonable notice.</Li>
            <Li>Engage respectfully and professionally with guides.</Li>
            <Li>Use guidance for personal decision-making only — not commercial resale or redistribution.</Li>
            <Li>Not record sessions or share session content publicly without the guide's explicit written consent.</Li>
            <Li>Leave honest, fair reviews based on your actual experience.</Li>
          </S>

          <S title="5. Prohibited Uses">
            <P>You may not use Expertify to:</P>
            <Li>Harass, threaten, or discriminate against any user based on race, gender, religion, nationality, disability, sexual orientation, or age.</Li>
            <Li>Spam, send unsolicited messages, or engage in phishing or fraud.</Li>
            <Li>Post false, misleading, or defamatory content.</Li>
            <Li>Attempt to gain unauthorized access to our systems or another user's account.</Li>
            <Li>Use automated scripts or bots to scrape or interact with the platform.</Li>
            <Li>Circumvent the platform by arranging sessions or payments outside Expertify.</Li>
            <Li>Upload content that infringes third-party intellectual property rights.</Li>
            <P>Violation of these prohibitions may result in immediate account termination.</P>
          </S>

          <S title="6. Sessions and Payments">
            <Li>Session rates are set by guides and displayed on their profiles in US dollars unless otherwise noted.</Li>
            <Li>Sessions become confirmed only after a guide explicitly accepts a booking request.</Li>
            <Li>Cancellation and refund policies are determined by individual guides and displayed at booking. Expertify is not responsible for disputes arising from cancellations.</Li>
            <Li>Expertify may charge a platform service fee on transactions. Any applicable fees will be disclosed at checkout.</Li>
          </S>

          <S title="7. Content and Intellectual Property">
            <Li>You retain ownership of content you post (profile information, messages, reviews). By posting, you grant Expertify a non-exclusive, worldwide, royalty-free license to display and distribute that content solely for operating the Service.</Li>
            <Li>Expertify's name, logo, design, and software are our intellectual property. You may not reproduce or use them without our written permission.</Li>
            <Li>We do not claim ownership of advice or guidance exchanged during sessions.</Li>
          </S>

          <S title="8. Disclaimers">
            <P>
              Expertify is a platform that connects people — we do not employ guides or certify their qualifications.
              Guidance provided is based on personal experience and is not a substitute for professional advice from
              licensed attorneys, doctors, financial advisors, or therapists. You use guidance at your own risk.
            </P>
            <P>
              The Service is provided "as is" and "as available" without warranties of any kind, express or implied.
            </P>
          </S>

          <S title="9. Limitation of Liability">
            <P>
              To the maximum extent permitted by applicable law, Expertify and its officers, directors, employees,
              and agents shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the Service.
            </P>
            <P>
              Our total liability to you for any claims shall not exceed the greater of (a) the total amount you paid
              to Expertify in the 12 months preceding the claim, or (b) $100.
            </P>
          </S>

          <S title="10. Termination">
            <P>
              You may delete your account at any time via Settings → Delete Account. We may suspend or terminate
              your account if you violate these Terms, with or without prior notice.
            </P>
          </S>

          <S title="11. Governing Law and Disputes">
            <P>
              These Terms are governed by the laws of the State of Delaware, United States. Disputes shall be resolved
              through binding arbitration under the rules of the American Arbitration Association, except that either
              party may seek injunctive relief in a court of competent jurisdiction for IP violations.
            </P>
          </S>

          <S title="12. Changes to These Terms">
            <P>
              We may modify these Terms at any time. We will notify you of material changes by email or an in-app
              notice at least 14 days before they take effect. Continued use constitutes acceptance.
            </P>
          </S>

          <S title="13. Contact">
            <P>Questions about these Terms?</P>
            <address className="not-italic text-sm text-[#5B6B85]">
              <p>Expertify — <a href="mailto:support@expertify.io" className="text-primary hover:underline">support@expertify.io</a></p>
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
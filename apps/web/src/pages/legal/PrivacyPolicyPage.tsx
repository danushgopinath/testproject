import React from 'react'

const lastUpdated = 'June 9, 2026'

export function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-white/40 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[#F7F5F0] px-6 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-10">

          <Lead>
            Expertify is committed to protecting your personal information. This Privacy Policy explains what data we
            collect, how we use it, and your rights regarding that data when you use our platform.
          </Lead>

          <S title="1. Information We Collect">
            <Sub title="Information you provide directly">
              <Li><B>Account data:</B> Name, email address, and password when you register with email.</Li>
              <Li><B>Social login data:</B> Name, email, and profile photo from Google or LinkedIn if you use OAuth sign-in.</Li>
              <Li><B>Profile data:</B> Bio, current role, company, education history, LinkedIn URL, specializations, and languages.</Li>
              <Li><B>Session data:</B> Topics, scheduled times, notes, and session duration for booked sessions.</Li>
              <Li><B>Messages:</B> Content of messages exchanged between users on the platform.</Li>
              <Li><B>Reviews:</B> Ratings and written feedback you submit after a session.</Li>
            </Sub>
            <Sub title="Information collected automatically">
              <Li><B>Usage data:</B> Pages visited, features used, and time spent on the platform.</Li>
              <Li><B>Device data:</B> Browser type, operating system, IP address, and referring URLs.</Li>
              <Li><B>Cookies:</B> Session authentication tokens and preference cookies. See our Cookie Policy for details.</Li>
            </Sub>
          </S>

          <S title="2. How We Use Your Information">
            <Li>To create and manage your account and authenticate your identity.</Li>
            <Li>To connect seekers with guides and facilitate session bookings.</Li>
            <Li>To send transactional emails — booking confirmations, session reminders, and message notifications.</Li>
            <Li>To display your public profile to other users (when your profile is set to public).</Li>
            <Li>To calculate and display guide ratings and session statistics.</Li>
            <Li>To improve the platform through aggregated, anonymized usage analytics.</Li>
            <Li>To respond to support requests and enforce our Terms of Service.</Li>
            <Li>To send product updates and tips, if you have opted in to marketing emails.</Li>
          </S>

          <S title="3. Information We Share">
            <P>We do not sell your personal information. We share data only in the following limited circumstances:</P>
            <Li><B>With other users:</B> When you are a guide, your public profile (name, role, education, specializations, rating) is visible to seekers. Messages are shared between sender and recipient only.</Li>
            <Li><B>With service providers:</B> We use trusted third-party services for infrastructure (cloud hosting), authentication (Google OAuth, LinkedIn OAuth), and email delivery. These providers are bound by confidentiality obligations.</Li>
            <Li><B>Legal compliance:</B> We may disclose information if required by law, court order, or to protect the rights and safety of our users or the public.</Li>
            <Li><B>Business transfers:</B> In the event of a merger or acquisition, user data may be transferred. We will notify you before your data is subject to a different privacy policy.</Li>
          </S>

          <S title="4. Data Retention">
            <P>
              We retain your personal data for as long as your account is active. If you delete your account, we
              permanently remove your profile, messages, and session history within 30 days, except where retention
              is required by law or for legitimate business purposes such as fraud prevention.
            </P>
          </S>

          <S title="5. Your Rights">
            <P>Depending on your jurisdiction, you may have the right to:</P>
            <Li><B>Access:</B> Request a copy of the personal data we hold about you.</Li>
            <Li><B>Correction:</B> Update inaccurate information via your Profile Settings.</Li>
            <Li><B>Deletion:</B> Delete your account and all associated data via Settings → Delete Account.</Li>
            <Li><B>Portability:</B> Request your data in a machine-readable format.</Li>
            <Li><B>Opt-out:</B> Unsubscribe from marketing emails at any time via Settings → Email &amp; Notifications.</Li>
            <P>To exercise any of these rights, contact us at <a href="mailto:support@expertify.io" className="text-primary hover:underline">support@expertify.io</a>.</P>
          </S>

          <S title="6. Security">
            <P>
              We implement industry-standard security measures including HTTPS encryption in transit, hashed passwords
              (bcrypt), and access controls for our database. No method of transmission over the internet is 100%
              secure. Notify us immediately at <a href="mailto:support@expertify.io" className="text-primary hover:underline">support@expertify.io</a> if you suspect unauthorized access.
            </P>
          </S>

          <S title="7. Children's Privacy">
            <P>
              Expertify is not intended for users under the age of 18. We do not knowingly collect personal information
              from minors. If you believe a minor has created an account, contact us and we will promptly delete the information.
            </P>
          </S>

          <S title="8. Changes to This Policy">
            <P>
              We may update this Privacy Policy from time to time. For material changes, we will notify you by email
              or a prominent in-app notice. Continued use of the Service after changes constitutes acceptance.
            </P>
          </S>

          <S title="9. Contact">
            <P>Questions about this Privacy Policy?</P>
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
function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[#070738]">{title}</h3>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  )
}
function Li({ children }: { children: React.ReactNode }) {
  return <li className="flex gap-2 text-sm text-[#5B6B85] leading-relaxed"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#F5B400]" /><span>{children}</span></li>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#5B6B85] leading-relaxed">{children}</p>
}
function B({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-[#070738]">{children}</strong>
}
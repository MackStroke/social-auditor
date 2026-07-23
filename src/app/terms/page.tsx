import Link from "next/link";

const COMPANY = "MackStroke";
const WEBSITE = "www.mackstroke.com";
const EMAIL = "info@mackstroke.com";
const APP = "Social Auditor";
const EFFECTIVE = "March 8, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/5">{title}</h2>
            <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3">{children}</div>
        </section>
    );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm mb-1.5">{title}</h3>
            <div className="text-slate-600 dark:text-slate-400">{children}</div>
        </div>
    );
}

function List({ items }: { items: string[] }) {
    return (
        <ul className="list-none space-y-1.5 mt-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-slate-200 font-sans">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
            <div className="relative p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-3xl mx-auto z-10 pb-20">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Terms & Policies</h1>
                    <p className="text-slate-500 text-sm">
                        Effective Date: <span className="text-slate-600 dark:text-slate-400">{EFFECTIVE}</span> &nbsp;·&nbsp;
                        Operated by{" "}
                        <a href={`https://${WEBSITE}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {COMPANY}
                        </a>
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs text-amber-900 dark:text-amber-300/80 leading-relaxed">
                        Please read these Terms of Service and Privacy Policy carefully before using {APP}. By accessing or using the Service, you agree to be bound by these terms.
                    </div>
                </div>

                {/* ─── PART 1: TERMS OF SERVICE ─── */}
                <div className="mb-6">
                    <span className="inline-block text-xs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4">
                        Part I — Terms of Service
                    </span>
                </div>

                <Section title="1. Acceptance of Terms">
                    <p>
                        By creating an account or using {APP} (the "Service"), provided by {COMPANY} ("{COMPANY}", "we", "us", or "our") at{" "}
                        <a href={`https://${WEBSITE}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{WEBSITE}</a>,
                        you agree to these Terms of Service ("Terms") and our Privacy Policy. If you do not agree, you must not use the Service.
                    </p>
                </Section>

                <Section title="2. Description of Service">
                    <p>
                        {APP} is an AI-powered advertising analytics platform that allows users to audit ad creatives, simulate campaign performance, conduct A/B testing on creatives, and generate ad copy using Google Gemini AI.
                    </p>
                    <p className="mt-2">
                        The Service requires users to provide their own Google Gemini API key ("User API Key"). {COMPANY} does not provide or subsidise API access to any AI model.
                    </p>
                </Section>

                <Section title="3. Eligibility">
                    <p>You must be at least 18 years old and capable of forming a binding contract to use the Service. By using {APP}, you represent that you meet these requirements.</p>
                </Section>

                <Section title="4. User Accounts">
                    <Sub title="4.1 Account Registration">
                        You must provide accurate information when creating your account. You are responsible for maintaining the confidentiality of your login credentials.
                    </Sub>
                    <Sub title="4.2 Account Security">
                        You are solely responsible for all activity that occurs under your account. Notify us immediately at{" "}
                        <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>{" "}
                        if you suspect unauthorised use.
                    </Sub>
                    <Sub title="4.3 One API Key Per Account">
                        Each account may register only one (1) Google Gemini API key. A given API key may not be associated with more than one account.
                    </Sub>
                </Section>

                <Section title="5. User API Keys & Third-Party Services">
                    <p>
                        {APP} integrates with the Google Gemini API. Your use of the Gemini API is governed by{" "}
                        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Terms of Service</a>.
                        {COMPANY} is not responsible for any charges, usage limits, or policy violations arising from your use of the Gemini API.
                    </p>
                    <p className="mt-2">
                        We store only a cryptographic SHA-256 hash of your API key in our database for the purpose of enforcing uniqueness. Your raw API key is never transmitted to or stored on our servers.
                    </p>
                </Section>

                <Section title="6. Acceptable Use">
                    <p>You agree not to:</p>
                    <List items={[
                        "Use the Service for any unlawful purpose or in violation of any applicable law.",
                        "Attempt to reverse-engineer, decompile, or extract source code from the Service.",
                        "Use the Service to infringe on intellectual property rights of third parties.",
                        "Submit offensive, harmful, or misleading content for analysis.",
                        "Attempt to circumvent the API key uniqueness enforcement or any other security measure.",
                        "Use automated systems to scrape, crawl, or overload the Service.",
                    ]} />
                </Section>

                <Section title="7. Intellectual Property">
                    <p>
                        All content, design, code, and branding of {APP} are the intellectual property of {COMPANY} and are protected by applicable copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written consent.
                    </p>
                    <p className="mt-2">
                        AI-generated content produced by the Service (audit reports, ad copy, etc.) is provided for your personal and commercial use. However, {COMPANY} makes no warranties regarding the accuracy, reliability, or fitness of AI-generated outputs. The Service employs AI models that can occasionally make mistakes, including hallucinating statistics or misidentifying trademarked/copyrighted assets. You must independently verify any outputs or claims made by the AI.
                    </p>
                </Section>

                <Section title="8. Disclaimer of Warranties">
                    <p>
                        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. {COMPANY.toUpperCase()} DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
                    </p>
                </Section>

                <Section title="9. Limitation of Liability">
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {COMPANY.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                    </p>
                </Section>

                <Section title="10. Termination">
                    <p>
                        {COMPANY} reserves the right to suspend or terminate your account at any time for violation of these Terms, without prior notice. Upon termination, your right to use the Service ceases immediately. You may delete your account at any time by contacting us at{" "}
                        <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>.
                    </p>
                </Section>

                <Section title="11. Modifications to Terms">
                    <p>
                        We may update these Terms at any time. Changes will be effective upon posting on this page with an updated effective date. Continued use of the Service after changes are posted constitutes your acceptance of the updated Terms.
                    </p>
                </Section>

                <Section title="12. Governing Law">
                    <p>
                        These Terms are governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000 and its amendments. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in India.
                    </p>
                </Section>

                {/* ─── PART 2: PRIVACY POLICY ─── */}
                <div className="mb-6 mt-12">
                    <span className="inline-block text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-4">
                        Part II — Privacy Policy
                    </span>
                </div>

                <Section title="13. Information We Collect">
                    <Sub title="13.1 Account Information">
                        When you register, we collect your email address, display name, and optionally your phone number. This information is stored securely in our authentication provider (Supabase).
                    </Sub>
                    <Sub title="13.2 API Key Data">
                        We store only a SHA-256 cryptographic hash of your Gemini API key to enforce account uniqueness. Your raw API key is stored locally in your browser's local storage and optionally synced to your account metadata for cross-device access. It is never stored in plain text on our servers.
                    </Sub>
                    <Sub title="13.3 Usage Data">
                        Audit history and reports are stored locally in your browser (localStorage), scoped to your account. We do not collect or store the content of your ad creatives on our servers beyond what is necessary to process your request in real-time.
                    </Sub>
                    <Sub title="13.4 Feature Requests & Feedback">
                        If you submit feature requests, feedback, or bug reports through the Service, we collect the text you provide and associate it with your account for review.
                    </Sub>
                </Section>

                <Section title="14. How We Use Your Information">
                    <List items={[
                        "To authenticate your identity and manage your account.",
                        "To enforce the one API key per account policy.",
                        "To provide, improve, and personalise the Service.",
                        "To respond to support requests and bug reports.",
                        "To communicate important updates, such as changes to these Terms.",
                        "To comply with applicable legal obligations.",
                    ]} />
                </Section>

                <Section title="15. Data Sharing & Third Parties">
                    <p>We do not sell, rent, or trade your personal data. We share information only in the following circumstances:</p>
                    <List items={[
                        "Supabase (auth.supabase.io): Used for authentication and secure database storage. Governed by Supabase's Privacy Policy.",
                        "Google Gemini API: Your ad creative images are sent to Google Gemini for AI analysis using your own API key. This is governed by Google's Privacy Policy and API Terms.",
                        "Legal compliance: We may disclose information if required by law, court order, or governmental authority.",
                    ]} />
                </Section>

                <Section title="16. Data Retention">
                    <p>
                        We retain your account information for as long as your account is active. Audit history stored in localStorage is retained on your device until you clear it manually. Feature requests and feedback are retained indefinitely to assist with product development.
                    </p>
                    <p className="mt-2">
                        You may request deletion of your account and all associated data by emailing{" "}
                        <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>.
                        We will process deletion requests within 30 days.
                    </p>
                </Section>

                <Section title="17. Data Security">
                    <p>
                        We implement industry-standard security measures including encrypted transport (HTTPS/TLS), Row-Level Security (RLS) on all database tables, and cryptographic hashing of sensitive data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </Section>

                <Section title="18. Your Rights">
                    <p>Under applicable Indian data protection law, you have the right to:</p>
                    <List items={[
                        "Access the personal data we hold about you.",
                        "Request correction of inaccurate information.",
                        "Request deletion of your account and associated data.",
                        "Withdraw consent for optional data processing at any time.",
                        "Lodge a complaint with a relevant supervisory authority.",
                    ]} />
                    <p className="mt-3">To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>.</p>
                </Section>

                <Section title="19. Cookies">
                    <p>
                        {APP} uses cookies solely for authentication session management via Supabase. We do not use tracking, advertising, or analytics cookies. You can configure your browser to refuse cookies, but this may prevent you from logging in to the Service.
                    </p>
                </Section>

                <Section title="20. Children's Privacy">
                    <p>
                        The Service is not directed at individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.
                    </p>
                </Section>

                <Section title="21. Contact Us">
                    <p>For any questions, concerns, or requests regarding these Terms or our Privacy Policy, please contact:</p>
                    <div className="mt-3 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl text-sm space-y-1 shadow-sm dark:shadow-none">
                        <p className="text-slate-900 dark:text-white font-semibold">{COMPANY}</p>
                        <p>
                            Website:{" "}
                            <a href={`https://${WEBSITE}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{WEBSITE}</a>
                        </p>
                        <p>
                            Email:{" "}
                            <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>
                        </p>
                    </div>
                </Section>

                {/* Footer note */}
                <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-xs text-slate-500 dark:text-slate-600">
                    <p>© {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/release-notes" className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors">Release Notes</Link>
                        <a href={`mailto:${EMAIL}`} className="hover:text-slate-700 dark:hover:text-slate-400 transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

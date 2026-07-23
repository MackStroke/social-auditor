"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

interface FAQ {
    q: string;
    a: string | React.ReactNode;
}

interface Category {
    id: string;
    title: string;
    icon: string;
    color: string;
    faqs: FAQ[];
}

const categories: Category[] = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: "rocket_launch",
        color: "text-emerald-400",
        faqs: [
            {
                q: "What is Social Auditor?",
                a: "Social Auditor is an AI-powered advertising analytics platform built by MackStroke. It lets you audit ad creatives using AI vision, simulate campaign outcomes, run A/B tests on creatives, and generate high-performing ad copy — all in one place.",
            },
            {
                q: "Do I need to create an account to use Social Auditor?",
                a: "Yes, an account is required. You can sign up using your email and password, or log in instantly using your existing Google account. Your account ensures your history, settings, and API key are securely stored and synced.",
            },
            {
                q: "How do I sign up?",
                a: "Click 'Sign In' in the sidebar and choose 'Create an account'. Enter your email and a password, or click 'Continue with Google' for one-click signup. Once signed in, you'll be guided to set up your API key before using any AI features.",
            },
            {
                q: "Is Social Auditor free to use?",
                a: "Social Auditor is free to use. However, it is a BYOK (Bring Your Own Key) platform — you must provide your own Google Gemini API key to unlock AI features. Google offers a generous free tier for Gemini API usage. There are no subscription fees charged by Social Auditor.",
            },
            {
                q: "What browsers are supported?",
                a: "Social Auditor works best on modern Chromium-based browsers (Chrome, Edge, Brave) and Firefox. Safari is supported but some animations may behave differently. Mobile browsers are supported via the responsive layout.",
            },
            {
                q: "I just signed up. What should I do first?",
                a: "After signing up, the onboarding guide will appear automatically. Your first step is to go to Settings → API Key and add your Google Gemini API key. Once that's done, you're ready to run your first audit from the Dashboard.",
            },
            {
                q: "Why do I have to accept Terms before I can sign in?",
                a: "The Terms & Policies acceptance checkbox is required to confirm you've read and agreed to our Terms of Service and Privacy Policy before using the app. You only need to accept once per sign-in session. Click the 'Terms & Policies' link to read the full document in a new tab — it won't untick the checkbox.",
            },
            {
                q: "Where can I read the Terms & Policies?",
                a: "You can read the full Terms of Service and Privacy Policy at /terms. It's also linked in the Terms acceptance checkbox on the login page, and accessible via Help → Terms & Policies in the sidebar. No login is required to read it.",
            },
            {
                q: "Where can I see what's changed in the app?",
                a: "Check /release-notes (accessible from Help → Release Notes in the sidebar). It shows a full version history with dates, what was added, improved, or fixed — categorised and colour-coded.",
            },
        ],
    },
    {
        id: "api-key",
        title: "API Key Setup",
        icon: "key",
        color: "text-amber-400",
        faqs: [
            {
                q: "What is a Gemini API key and why do I need one?",
                a: "Google Gemini is the AI that powers all analysis features in Social Auditor — creative audits, copy generation, A/B test predictions, and campaign simulations. The API key is your personal access credential. You bring your own key so you're always in full control of your data and usage costs.",
            },
            {
                q: "How do I get a free Google Gemini API key?",
                a: "1. Go to https://aistudio.google.com/apikey\n2. Sign in with your Google account.\n3. Click 'Create API Key' and select or create a Google Cloud project.\n4. Copy the key (starts with AIzaSy...) and paste it in Settings → API Key.",
            },
            {
                q: "Is my API key stored securely?",
                a: "Yes. Your raw API key is stored only in your browser's localStorage — it never leaves your device in plain text. For cross-device sync, it is stored in your Supabase account metadata (encrypted at rest). On our servers, we store only a SHA-256 hash of your key solely to enforce the one-key-per-account policy.",
            },
            {
                q: "Why can't I register my API key? I'm getting an 'already in use' error.",
                a: "Each API key can only be registered to one Social Auditor account. This prevents key sharing and ensures fair usage. If you previously used this key on another account, you'll need to remove it from that account first, or generate a new key from Google AI Studio.",
            },
            {
                q: "I logged in on a new device. Will my API key be available?",
                a: "Yes! Your API key is synced to your account. When you log in on a new device, Social Auditor will automatically restore your key from your account so you can start using AI features immediately without re-entering it.",
            },
            {
                q: "How do I delete or replace my API key?",
                a: "Go to Settings → API Key. You'll see a 'Remove Key' button next to the Save button (visible only when a key is configured). Click it, confirm the deletion, then paste and save a new key if you want to replace it.",
            },
            {
                q: "Can I use a key from a paid Google Cloud plan?",
                a: "Yes, any valid Google Gemini API key works — free tier or paid. If you're on a paid plan, you'll benefit from higher rate limits and larger context windows for more complex analyses.",
            },
            {
                q: "Why is the 'eye' icon on the API key input?",
                a: "By default your API key is masked for privacy. Click the eye icon to temporarily reveal the key so you can verify it's correct, then click again to hide it.",
            },
        ],
    },
    {
        id: "audit",
        title: "AI Creative Audit",
        icon: "image_search",
        color: "text-primary",
        faqs: [
            {
                q: "What is the AI Creative Audit?",
                a: "The Creative Audit is the core feature of Social Auditor. You upload an ad image and our AI analyses it across multiple dimensions: attention heatmap overlay, hook strength, visual hierarchy, brand presence, text legibility, emotional appeal, platform fit, and more — returning a scored performance report.",
            },
            {
                q: "What image formats and sizes are accepted?",
                a: "You can upload JPG, PNG, WebP, and GIF images. Images are automatically optimised and compressed before analysis to stay within API limits. For best results, upload the actual ad creative at its intended display size.",
            },
            {
                q: "What does the Attention Heatmap show?",
                a: "The heatmap overlays a colour gradient on your ad image to show where a viewer's eyes are most likely to land first. Hot zones (red/orange) represent high attention areas. Use this to ensure your CTA, headline, or product is in a high-attention zone.",
            },
            {
                q: "What platform should I select when auditing?",
                a: "Select the platform where the ad is intended to run — Facebook Feed, Instagram Story, Google Display, etc. The AI adjusts its critique based on the platform's visual conventions, aspect ratio norms, and audience behaviour patterns.",
            },
            {
                q: "How is the overall score calculated?",
                a: "The score is an AI-weighted composite across factors like visual clarity, brand presence, hook strength, emotional appeal, text proportion, and CTA visibility. A score of 80+ is strong. Below 60 usually means significant improvements are needed.",
            },
            {
                q: "How long does an audit take?",
                a: "Most audits complete in 10–25 seconds, depending on image complexity and Gemini API response time. A spinning indicator will show while the analysis is in progress.",
            },
            {
                q: "Why isn't the audit button working?",
                a: "The audit button requires a valid API key configured in Settings. If you haven't set one up, a setup prompt will appear. Also ensure you've uploaded an image and selected a platform before clicking Analyse.",
            },
            {
                q: "Can I re-audit the same image?",
                a: "Yes. You can upload and audit the same image as many times as you like. Each audit generates a fresh analysis. All results are saved to your History.",
            },
            {
                q: "What does the Copyright Checker do?",
                a: "When toggled on, the AI runs an additional scan for clearly restricted brand trademarks, logos, or likely copyrighted imagery to flag potential compliance risks before you publish the ad. Note that this is purely an AI estimation, not legal advice.",
            },
            {
                q: "Do I have to provide a Target Location?",
                a: "No, the Target Location is highly recommended to pinpoint cultural tone and demographics but strictly optional. If left blank, the AI evaluates the creative on broad performance metrics independent of geography.",
            },
            {
                q: "Why do Campaign Objective and Type options change when I select a Platform?",
                a: "We natively synced Social Auditor to reflect the actual ad creation flows for both Google Ads and Meta platforms. When you swap platforms, the dropdowns instantly update to show the official objectives and ad placements exclusively available for the network you intend to spend on.",
            },
        ],
    },
    {
        id: "copy",
        title: "Ad Copy Generator",
        icon: "edit_square",
        color: "text-violet-400",
        faqs: [
            {
                q: "What does the Ad Copy Generator do?",
                a: "After running a creative audit, the Ad Copy Generator uses AI to write high-converting ad copy tailored to your specific ad, campaign objective, and target platform. It generates headlines, primary text, and a call-to-action.",
            },
            {
                q: "How do I generate ad copy?",
                a: "Run an audit first from the Dashboard. After the audit results appear, click the 'Generate Ad Copy' button. The AI uses the visual analysis of your ad — combined with platform and objective context — to write copy suggestions.",
            },
            {
                q: "Can I specify my target audience for the copy?",
                a: "Yes. Before generating, you can input audience context (e.g., 'millennials interested in fitness', 'B2B SaaS decision makers'). The AI will tailor tone, vocabulary, and value proposition to match your audience.",
            },
            {
                q: "Can I regenerate different copy variations?",
                a: "Yes. Click the generate button again to get a fresh set of copy variations. Each generation may produce different angles, tones, or messaging approaches.",
            },
        ],
    },
    {
        id: "simulator",
        title: "Campaign Simulator",
        icon: "calculate",
        color: "text-cyan-400",
        faqs: [
            {
                q: "What does the Campaign Simulator do?",
                a: "The Campaign Simulator uses AI to predict the expected outcomes of your ad campaign before you go live. Input your budget, campaign objective, bid strategy, and attribution setting — and get estimated results, cost per outcome, impressions, and reach.",
            },
            {
                q: "How accurate are the predictions?",
                a: "Predictions are AI-generated estimates based on industry benchmarks and heuristic patterns, not real-time market data. They are intended as directional guidance to help you set realistic expectations, not guarantees of performance.",
            },
            {
                q: "What parameters can I configure?",
                a: "You can set: Campaign Objective (Awareness, Traffic, Leads, Sales, etc.), Total Budget, Amount Spent to Date, Attribution Setting (7-day click, 1-day view, etc.), and Bid Strategy (Highest Volume, Cost Cap, ROAS Goal, Bid Cap).",
            },
            {
                q: "I entered my parameters but nothing is showing. What's wrong?",
                a: "Make sure you've set a valid Budget (must be greater than zero) and that your Gemini API key is configured in Settings. If the API key is missing, a setup prompt will appear when you click Predict Results.",
            },
            {
                q: "Can I simulate multiple scenarios?",
                a: "Yes. Simply adjust the parameters and click 'Predict Results' again — each run generates a fresh prediction based on the current inputs. You can mentally note or screenshot different scenarios to compare.",
            },
        ],
    },
    {
        id: "ab-testing",
        title: "A/B Testing",
        icon: "compare",
        color: "text-purple-400",
        faqs: [
            {
                q: "What is Predictive A/B Testing?",
                a: "Predictive A/B Testing lets you upload two ad creative variations and have AI analyse both to predict which one will perform better — before spending any budget. You get a projected winner, individual scores out of 100, and a breakdown of which creative wins on each factor.",
            },
            {
                q: "What metrics does the AI compare?",
                a: "The AI evaluates both creatives across factors such as: visual hierarchy, hook strength, brand presence, CTA clarity, text legibility, emotional resonance, platform appropriateness, and overall creative quality.",
            },
            {
                q: "Can I provide context about my target audience?",
                a: "Yes. There's an optional 'Context / Target Audience' field where you can describe your intended audience (e.g., 'women aged 25-40 interested in skincare'). The AI factors this in when making its prediction.",
            },
            {
                q: "Does the uploaded image get stored on your servers?",
                a: "No. Images are sent directly to the Google Gemini API via your own API key for real-time analysis and are not stored on Social Auditor's servers.",
            },
            {
                q: "What image formats are supported?",
                a: "JPG, PNG, WebP, and GIF are all accepted. Images are automatically optimised before being sent for analysis. You can upload via click-to-browse or drag-and-drop.",
            },
            {
                q: "Can I clear and test a different set of images?",
                a: "Yes. Click the ✕ button on either uploaded image to remove it and upload a different one. The analysis will only run when both images are uploaded.",
            },
        ],
    },
    {
        id: "history-reports",
        title: "History & Reports",
        icon: "history",
        color: "text-teal-400",
        faqs: [
            {
                q: "Where are my audit results stored?",
                a: "Audit results are stored in your browser's local storage, scoped to your account. This means they persist across sessions on the same device but are not available on other devices (unlike your API key and profile, which sync across devices).",
            },
            {
                q: "How do I view my past audits?",
                a: "Click 'History' in the sidebar. You'll see a list of all past audits with thumbnails, dates, platforms, and scores. Click any entry to open the full report.",
            },
            {
                q: "Can someone else see my history on my device?",
                a: "Audit history is scoped to your logged-in account. If a different user logs in on the same device, they will see their own history, not yours.",
            },
            {
                q: "How do I view a full audit report?",
                a: "From the History page, click on any audit entry to open the full Report. You can also navigate directly to the Reports page after running an audit from the Dashboard.",
            },
            {
                q: "Can I export my report?",
                a: "Yes. On the Reports page, there is a PDF export button that generates a formatted PDF of the full audit report including all scores, heatmap, insights, and recommendations.",
            },
            {
                q: "How do I clear my audit history?",
                a: "Go to the History page and click the 'Clear History' button. This will permanently remove all stored audits for your account on this device. This action cannot be undone.",
            },
            {
                q: "Why is my history empty after logging in on a new device?",
                a: "Audit history is stored in browser localStorage and is device-specific. Your API key and profile sync across devices, but history does not. Run new audits on the new device to build a history there.",
            },
        ],
    },
    {
        id: "settings-profile",
        title: "Settings & Profile",
        icon: "settings",
        color: "text-slate-300",
        faqs: [
            {
                q: "How do I update my display name?",
                a: "Go to Settings → Profile tab. Enter your name in the 'Display Name' field and click 'Save Profile'. Your name is synced to your account and will appear in the sidebar.",
            },
            {
                q: "How do I add or update my phone number?",
                a: "Go to Settings → Profile tab. Enter your number in the 'Phone Number' field (include country code, e.g., +91 98765 43210) and click 'Save Profile'.",
            },
            {
                q: "Can I change my email address?",
                a: "Email is used as your account identifier and cannot be changed directly in the app. If you need to update your email, contact us at info@mackstroke.com.",
            },
            {
                q: "Is my profile information visible to other users?",
                a: "No. Your profile information (name, phone, email) is private and only used for account management purposes within Social Auditor.",
            },
            {
                q: "How do I sign out?",
                a: "Click 'Sign Out' at the bottom of the sidebar. Your session will be ended immediately. Your local history and settings will remain on the device.",
            },
        ],
    },
    {
        id: "security-privacy",
        title: "Security & Privacy",
        icon: "shield",
        color: "text-red-400",
        faqs: [
            {
                q: "Is my data safe?",
                a: "Yes. All data is transmitted over HTTPS/TLS. Database records are protected by Row-Level Security (RLS), ensuring each user can only access their own data. Your API key is never stored in plain text on our servers — only a SHA-256 hash is stored.",
            },
            {
                q: "Does Social Auditor sell my data?",
                a: "No. We do not sell, rent, or share your personal data with third parties for marketing purposes. See our full Privacy Policy at /terms for complete details.",
            },
            {
                q: "What data do you store about me?",
                a: "We store: your email, display name, phone number (if provided), a hash of your API key, and any feature requests or feedback you submit. Audit history is stored in your browser only, not on our servers.",
            },
            {
                q: "Who can see my submitted feature requests?",
                a: "Feature requests are only visible to you and the Social Auditor development team (MackStroke). They are not shared with other users.",
            },
            {
                q: "How do I delete my account?",
                a: "Send a deletion request to info@mackstroke.com. We will delete your account and all associated data within 30 days.",
            },
            {
                q: "Do you use cookies?",
                a: "We use cookies only for authentication session management (via Supabase). We do not use advertising, tracking, or analytics cookies.",
            },
            {
                q: "Where can I read the full Privacy Policy?",
                a: "The full Privacy Policy is available at /terms under Part II. It covers what data we collect, how it's used, who it's shared with, your rights, and how to request data deletion. No login is required to read it.",
            },
            {
                q: "Why do I have to tick a box before logging in?",
                a: "The Terms acceptance checkbox confirms you've read and agreed to our Terms of Service and Privacy Policy. Both the email/password Sign In and Google Sign-In are disabled until you accept. This is a legal requirement to ensure informed consent before account creation and use.",
            },
        ],
    },
    {
        id: "troubleshooting",
        title: "Troubleshooting",
        icon: "bug_report",
        color: "text-orange-400",
        faqs: [
            {
                q: "The AI analysis is failing. What do I do?",
                a: "First, make sure your API key is valid and correctly entered in Settings. Then check that your Google Gemini API key hasn't hit its rate limit or been revoked. If the problem persists, try generating a new key from Google AI Studio.",
            },
            {
                q: "I'm getting a 'Missing API Key' popup. How do I fix it?",
                a: "Go to Settings → API Key, paste your Google Gemini API key, and click 'Save & Sync Key'. Once saved, return to the feature you were using. The popup will no longer appear.",
            },
            {
                q: "The page is loading but the audit results never appear.",
                a: "This usually indicates a network timeout or an API error. Check your internet connection, verify your API key is valid, and try again. If the issue persists, try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R).",
            },
            {
                q: "My history shows nothing even though I've run audits before.",
                a: "History is stored in your browser's localStorage. If you've cleared your browser data, switched browsers, or are on a different device, your history will not be available. It is not backed up to the cloud.",
            },
            {
                q: "The PDF export isn't working or looks broken.",
                a: "PDF export requires the full report to be loaded on screen. Scroll through the report once before exporting to ensure all sections render. If charts look incorrect, try a different browser (Chrome is recommended for PDF export).",
            },
            {
                q: "I'm logged in on two devices but my settings aren't syncing.",
                a: "Profile information and API keys sync automatically via your Supabase account. If you don't see changes, try signing out and back in on the other device to trigger a fresh sync.",
            },
            {
                q: "Something else is broken. How do I report it?",
                a: "Use the 'Request a Feature' → Bug Report option in the sidebar to describe the issue. Alternatively, email info@mackstroke.com with details of the bug, steps to reproduce, and your browser/OS.",
            },
        ],
    },
];

function AccordionItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className={cn(
            "border rounded-xl overflow-hidden transition-colors",
            isOpen ? "border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]" : "border-slate-200 dark:border-white/5 bg-white dark:bg-transparent"
        )}>
            <button
                onClick={onToggle}
                className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left group"
            >
                <span className={cn("text-sm font-semibold leading-snug transition-colors", isOpen ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white")}>
                    {faq.q}
                </span>
                <ChevronDown size={16} className={cn("shrink-0 mt-0.5 transition-transform duration-200", isOpen ? "rotate-180 text-slate-800 dark:text-slate-300" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
            </button>
            {isOpen && (
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line animate-in fade-in slide-in-from-top-1 duration-150">
                    {faq.a}
                </div>
            )}
        </div>
    );
}

export default function HelpCenterPage() {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [activeCategory, setActiveCategory] = useState<string>("getting-started");
    const [search, setSearch] = useState("");

    const toggle = (key: string) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

    const filteredCategories = search.trim()
        ? categories.map(cat => ({
            ...cat,
            faqs: cat.faqs.filter(f =>
                f.q.toLowerCase().includes(search.toLowerCase()) ||
                (typeof f.a === "string" && f.a.toLowerCase().includes(search.toLowerCase()))
            ),
        })).filter(cat => cat.faqs.length > 0)
        : categories;

    const activeSearch = search.trim().length > 0;
    const displayCategories = activeSearch ? filteredCategories : filteredCategories.filter(c => c.id === activeCategory);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-slate-200 overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
            <div className="relative flex gap-0 h-screen overflow-hidden z-10">

                {/* Left Category Nav */}
                <div className="hidden lg:flex flex-col w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 gap-1 pt-8 bg-white/50 dark:bg-background/50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-3">Categories</p>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                            className={cn(
                                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all w-full",
                                activeCategory === cat.id && !activeSearch
                                    ? "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                            )}
                        >
                            <span className={cn("material-symbols-outlined text-[18px]", cat.color)}>{cat.icon}</span>
                            {cat.title}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto pb-20">

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Help Center</h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">Find answers to common questions about every feature in Social Auditor.</p>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search questions..."
                                    className="w-full bg-white dark:bg-surface-dark border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all text-sm shadow-sm dark:shadow-none"
                                />
                            </div>
                        </div>

                        {/* Mobile Category Pills */}
                        <div className="flex lg:hidden flex-wrap gap-2 mb-6">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                        activeCategory === cat.id && !activeSearch
                                            ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border-slate-300 dark:border-white/20"
                                            : "text-slate-500 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10 bg-white dark:bg-transparent"
                                    )}
                                >
                                    <span className={cn("material-symbols-outlined text-[14px]", cat.color)}>{cat.icon}</span>
                                    {cat.title}
                                </button>
                            ))}
                        </div>

                        {/* No Results */}
                        {activeSearch && filteredCategories.length === 0 && (
                            <div className="text-center py-16 text-slate-500">
                                <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">search_off</span>
                                <p className="font-semibold text-slate-600 dark:text-slate-400">No results for "{search}"</p>
                                <p className="text-sm mt-1">Try a different keyword, or browse a category from the left.</p>
                            </div>
                        )}

                        {/* FAQ Sections */}
                        {displayCategories.map(cat => (
                            <div key={cat.id} className="mb-10">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <span className={cn("material-symbols-outlined text-[22px]", cat.color)}>{cat.icon}</span>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{cat.title}</h2>
                                    <span className="text-xs text-slate-500 dark:text-slate-600 font-medium">{cat.faqs.length} questions</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {cat.faqs.map((faq, i) => {
                                        const key = `${cat.id}-${i}`;
                                        return (
                                            <AccordionItem
                                                key={key}
                                                faq={faq}
                                                isOpen={!!openItems[key]}
                                                onToggle={() => toggle(key)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Bottom CTA */}
                        {!activeSearch && (
                            <div className="mt-12 p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl text-center shadow-sm dark:shadow-none">
                                <span className="material-symbols-outlined text-3xl text-slate-500 mb-3 block">support_agent</span>
                                <h3 className="text-slate-900 dark:text-white font-bold mb-1">Still need help?</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Can't find your answer here? Reach out to us directly.</p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <a href="mailto:info@mackstroke.com"
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-sm">mail</span>
                                        Email Support
                                    </a>
                                    <Link href="/feature-request"
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white text-sm font-semibold rounded-lg border border-slate-200 dark:border-white/10 transition-colors">
                                        <span className="material-symbols-outlined text-sm">bug_report</span>
                                        Report a Bug
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

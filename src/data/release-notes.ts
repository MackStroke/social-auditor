export interface ReleaseEntry {
    version: string;
    date: string; // ISO date string
    title: string;
    type: "major" | "minor" | "patch";
    changes: {
        category: "feature" | "improvement" | "fix" | "security";
        items: string[];
    }[];
}

// ─────────────────────────────────────────────────────────────
// This file is maintained by the development team.
// It is updated every time significant changes are shipped.
// ─────────────────────────────────────────────────────────────
export const releaseNotes: ReleaseEntry[] = [
    {
        version: "1.7.0",
        date: "2026-03-08",
        title: "Extended Ad Placements, Copyright Detection, & UI Polish",
        type: "minor",
        changes: [
            {
                category: "feature",
                items: [
                    "Added Campaign Type parameter for Google Ads (Performance Max, Search, Demand Gen, Video, Display, Shopping) and Meta (Feeds, Stories & Reels, In-Stream Videos, Search Results).",
                    "Integrated a 'Copyright Checker' toggle to scan uploaded creatives for restricted brand assets or music markers using AI Vision.",
                    "Campaign Objective selectors dynamically swap out their parameters fully based on your chosen Platform.",
                ],
            },
            {
                category: "improvement",
                items: [
                    "Polished the Campaign Type dropdown to include standard Google Material Icons rendering inline next to format options.",
                    "Removed the mandatory requirement restriction from the Target Location payload parameter.",
                    "Appended a permanent AI liability disclaimer near the 'Analyse Creative' CTA to clarify AI constraints.",
                ],
            },
        ],
    },
    {
        version: "1.6.0",
        date: "2026-03-04",
        title: "Help Center, Terms & Policies, and Legal Consent",
        type: "minor",
        changes: [
            {
                category: "feature",
                items: [
                    "In-app Help Center launched at /help-center — 10 categories and 60+ searchable FAQs covering every feature.",
                    "Live search across all FAQ questions and answers simultaneously.",
                    "Terms & Policies page at /terms — full Terms of Service and Privacy Policy tailored to MackStroke and Indian jurisdiction.",
                    "Terms acceptance checkbox added to the auth page — users must accept before signing in or using Google Sign-In.",
                    "'Terms & Policies' link on the auth checkbox opens the full policy in a new tab without unticking the box.",
                    "Release Notes page at /release-notes — visual version timeline with category badges and a 'Latest' indicator.",
                ],
            },
            {
                category: "improvement",
                items: [
                    "/help-center, /release-notes, and /terms are now public pages — accessible without login.",
                    "Help Center sidebar link updated to point to the internal /help-center page instead of an external URL.",
                    "Left-side category nav on Help Center for instant section jumping; category pills on mobile.",
                ],
            },
        ],
    },
    {
        version: "1.5.0",
        date: "2026-03-04",
        title: "Settings Hub, Help Center & Feature Requests",
        type: "major",
        changes: [
            {
                category: "feature",
                items: [
                    "New tabbed Settings page with Profile and API Key sections.",
                    "Profile tab lets users set a display name and phone number — synced to their account.",
                    "Added collapsible Help section in the sidebar: Help Center, Release Notes, Terms & Policies, Report a Bug.",
                    "New Request a Feature page — submit feature requests, feedback, or bug reports, stored in Supabase.",
                    "Past feature request submissions are listed below the form with type badges and timestamps.",
                    "Added this Release Notes page — automatically maintained with every update.",
                ],
            },
            {
                category: "improvement",
                items: [
                    "Sidebar restructured: 'API Settings' and 'Profile' consolidated under 'Settings'.",
                    "Settings link and Request a Feature link added to sidebar navigation.",
                    "Display name is now shown in the sidebar user pill instead of just email.",
                ],
            },
        ],
    },
    {
        version: "1.4.0",
        date: "2026-03-04",
        title: "API Key Enforcement & Unique Key Validation",
        type: "major",
        changes: [
            {
                category: "feature",
                items: [
                    "Missing API Key modal — intercepted at the Dashboard, Campaign Simulator, and A/B Testing pages.",
                    "Modal includes a 3-step visual guide to acquiring a free Google Gemini API key.",
                    "API key uniqueness enforcement: each key can only be registered to one account.",
                    "Key registration uses SHA-256 hashing — the raw key is never stored on the server.",
                    "Delete API Key option with inline confirmation — releases the key for use by another account.",
                ],
            },
            {
                category: "security",
                items: [
                    "New `api_key_registrations` Supabase table with RLS and unique constraints on both key hash and user.",
                    "Server-side `/api/register-api-key` route validates uniqueness before saving.",
                    "Race condition handled via database-level unique constraint on `key_hash`.",
                ],
            },
            {
                category: "improvement",
                items: [
                    "API key is now synced to Supabase `user_metadata` for cross-device access.",
                    "Logging into a new device with the same account automatically restores the API key.",
                    "Eye toggle button added to the API key input field to reveal or obscure the key.",
                    "Step-by-step API setup guide panel added to the Settings page.",
                ],
            },
        ],
    },
    {
        version: "1.3.0",
        date: "2026-03-04",
        title: "Guided Onboarding & Account-Scoped History",
        type: "major",
        changes: [
            {
                category: "feature",
                items: [
                    "OnboardingModal added — appears automatically for new users after login, explaining core features.",
                    "Onboarding guides users to set up their Gemini API key with a CTA to Settings.",
                    "Onboarding is suppressed when the user already has an API key configured (cross-device aware).",
                ],
            },
            {
                category: "improvement",
                items: [
                    "History data is now scoped per user account — no more shared history between accounts.",
                    "History functions made asynchronous, using the Supabase user ID as the localStorage key prefix.",
                    "Dashboard, History, and Reports pages updated to handle async history loading.",
                ],
            },
            {
                category: "fix",
                items: [
                    "Sign In link in sidebar now correctly closes the mobile drawer and navigates to /auth.",
                ],
            },
        ],
    },
    {
        version: "1.2.0",
        date: "2026-03-04",
        title: "Google Sign-In & Authentication Fixes",
        type: "minor",
        changes: [
            {
                category: "fix",
                items: [
                    "Resolved Google OAuth 'unsupported provider' error — Google Sign-In now works correctly.",
                    "Phone OTP login option hidden (pending SMS provider configuration).",
                    "Auth callback route correctly handles OAuth code exchange.",
                ],
            },
            {
                category: "improvement",
                items: [
                    "Authentication middleware updated to correctly redirect between /auth and protected pages.",
                    "Sidebar Sign In/Sign Out state correctly reflects authentication status.",
                ],
            },
        ],
    },
    {
        version: "1.1.0",
        date: "2026-02-27",
        title: "Custom Logo, WCAG-Compliant Dropdowns",
        type: "minor",
        changes: [
            {
                category: "feature",
                items: [
                    "New custom SVG logo component integrated into the sidebar.",
                    "All native <select> dropdowns replaced with a fully accessible custom Select component.",
                ],
            },
            {
                category: "improvement",
                items: [
                    "Custom Select component meets WCAG contrast, keyboard navigation, and screen reader standards.",
                    "Dropdown styling consistent with the dark theme across all pages.",
                ],
            },
        ],
    },
    {
        version: "1.0.0",
        date: "2026-02-24",
        title: "Initial Release",
        type: "major",
        changes: [
            {
                category: "feature",
                items: [
                    "AI Creative Audit: upload an ad image and receive a full performance analysis.",
                    "Attention Heatmap generation using Gemini Vision.",
                    "Campaign Simulator: predict campaign outcomes based on budget and objective.",
                    "Predictive A/B Testing: compare two creatives, AI picks the projected winner.",
                    "Ad Copy Generator: generate platform-specific ad copy with AI.",
                    "Audit History: view, search, and clear past audit results.",
                    "Reports page: detailed breakdown of audit results with PDF export.",
                    "BYOK (Bring Your Own Key): Gemini API key stored locally in the browser.",
                    "Full Supabase authentication (email/password + Google Sign-In).",
                ],
            },
        ],
    },
];

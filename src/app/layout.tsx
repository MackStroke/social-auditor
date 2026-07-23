import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import OnboardingModal from "@/components/OnboardingModal";
import PageViewTracker from "@/components/PageViewTracker";
import { ThemeProvider } from "@/components/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Auditor | Premium Ad Analysis",
  description: "Upload ad creatives and copy to get real-time conversion and engagement feedback.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} antialiased bg-slate-50 dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden print:overflow-visible print:bg-background-dark`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex h-screen w-full flex-col md:flex-row overflow-hidden print:h-auto print:overflow-visible">
            <Sidebar isAuthenticated={!!user} />
            <main className="flex-1 flex flex-col h-full overflow-y-auto print:h-auto print:overflow-visible">
              {children}
            </main>
          </div>
          <CookieConsent />
          <OnboardingModal />
          <PageViewTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}


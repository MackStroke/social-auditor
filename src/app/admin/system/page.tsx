"use client";

import Link from "next/link";
import { ExternalLink, FileText, Book, Scale, Terminal } from "lucide-react";
import { releaseNotes } from "@/data/release-notes";

const latestVersion = releaseNotes[0];

export default function AdminSystemPage() {
    const cards = [
        {
            title: "Supabase Dashboard",
            description: "Manage database, auth, logs, and storage for this project.",
            link: "https://supabase.com/dashboard/project/qinjmpotupulizekmtgx",
            icon: <Terminal size={18} className="text-emerald-400" />,
        },
        {
            title: "Supabase Auth — All Users",
            description: "View and manage all registered user accounts directly.",
            link: "https://supabase.com/dashboard/project/qinjmpotupulizekmtgx/auth/users",
            icon: <Book size={18} className="text-indigo-400" />,
        },
        {
            title: "Help Center",
            description: "View the public Help Center FAQ page.",
            link: "/help-center",
            icon: <Book size={18} className="text-amber-400" />,
        },
        {
            title: "Terms & Policies",
            description: "View the current Terms & Policies page.",
            link: "/terms",
            icon: <Scale size={18} className="text-sky-400" />,
        },
        {
            title: "Release Notes",
            description: "View public release notes and version history.",
            link: "/release-notes",
            icon: <FileText size={18} className="text-purple-400" />,
        },
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">System</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Application info, quick links, and version details.</p>
            </div>

            {/* Version card */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Current Version</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{latestVersion?.version ?? "—"}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{latestVersion?.title ?? ""}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Released</p>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-sm">{latestVersion?.date ?? "—"}</p>
                    </div>
                </div>
                {latestVersion && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Latest Changes</p>
                        <ul className="space-y-1">
                            {latestVersion.changes.slice(0, 3).map((c: { category: string; items: string[] }, i: number) => (
                                c.items.slice(0, 2).map((item: string, j: number) => (
                                    <li key={`${i}-${j}`} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="text-primary mt-0.5">▸</span>{item}
                                    </li>
                                ))
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Quick links */}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cards.map(card => (
                    <Link
                        key={card.title}
                        href={card.link}
                        target={card.link.startsWith("http") ? "_blank" : undefined}
                        rel={card.link.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="flex items-start gap-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-xl p-5 transition-all group shadow-sm dark:shadow-none"
                    >
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                            {card.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{card.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{card.description}</p>
                        </div>
                        <ExternalLink size={13} className="text-slate-400 dark:text-slate-700 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
                    </Link>
                ))}
            </div>

            {/* How to update docs */}
            <div className="mt-6 bg-amber-50 dark:bg-surface-dark border border-amber-500/20 rounded-xl p-5 shadow-sm dark:shadow-none">
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">📋 How to Update Documentation</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Release Notes → <code className="text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">src/data/release-notes.ts</code>
                    &nbsp;·&nbsp; Help Center → <code className="text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">src/app/help-center/page.tsx</code>
                    &nbsp;·&nbsp; Terms → <code className="text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">src/app/terms/page.tsx</code>
                </p>
            </div>
        </div>
    );
}

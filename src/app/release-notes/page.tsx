import { releaseNotes } from "@/data/release-notes";
import { cn } from "@/lib/utils";

const categoryConfig = {
    feature: { label: "New Feature", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
    improvement: { label: "Improvement", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400" },
    fix: { label: "Bug Fix", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
    security: { label: "Security", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" },
};

const typeConfig = {
    major: { label: "Major Release", badge: "bg-primary/20 text-primary border-primary/30" },
    minor: { label: "Update", badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
    patch: { label: "Patch", badge: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ReleaseNotesPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-slate-200 overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
            <div className="relative p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-3xl mx-auto z-10 flex flex-col gap-8 pb-20">

                {/* Header */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Release Notes</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                        A full history of updates, features, and improvements to Social Auditor.
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative flex flex-col gap-12">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-slate-300 dark:via-slate-700 to-transparent" />

                    {releaseNotes.map((release, index) => (
                        <div key={release.version} className="relative flex gap-6">
                            {/* Timeline Node */}
                            <div className="relative shrink-0 flex flex-col items-center" style={{ width: 16 }}>
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 mt-1 shrink-0 shadow-lg",
                                    index === 0
                                        ? "bg-primary border-primary shadow-primary/40 shadow-[0_0_10px]"
                                        : "bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-600"
                                )} />
                            </div>

                            {/* Card */}
                            <div className={cn(
                                "flex-1 bg-white dark:bg-surface-dark rounded-2xl border overflow-hidden shadow-sm dark:shadow-none",
                                index === 0 ? "border-primary/20" : "border-slate-200 dark:border-white/5"
                            )}>
                                {/* Card Header */}
                                <div className={cn(
                                    "px-6 py-4 flex flex-wrap items-start justify-between gap-3 border-b",
                                    index === 0 ? "border-primary/10 bg-primary/5" : "border-slate-100 dark:border-white/5"
                                )}>
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap mb-1">
                                            <span className="text-slate-900 dark:text-white font-black text-lg font-mono tracking-tight">
                                                v{release.version}
                                            </span>
                                            <span className={cn(
                                                "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                                                typeConfig[release.type].badge
                                            )}>
                                                {typeConfig[release.type].label}
                                            </span>
                                            {index === 0 && (
                                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse inline-block" />
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-slate-800 dark:text-white font-semibold text-base">{release.title}</h3>
                                    </div>
                                    <span className="text-slate-500 text-sm shrink-0">{formatDate(release.date)}</span>
                                </div>

                                {/* Change Groups */}
                                <div className="px-6 py-5 flex flex-col gap-5">
                                    {release.changes.map((group, gi) => {
                                        const cfg = categoryConfig[group.category];
                                        return (
                                            <div key={gi}>
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border mb-3",
                                                    cfg.bg, cfg.color, cfg.border
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                                                    {cfg.label}
                                                </div>
                                                <ul className="flex flex-col gap-2">
                                                    {group.items.map((item, ii) => (
                                                        <li key={ii} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                            <span className={cn("w-1 h-1 rounded-full mt-2 shrink-0", cfg.dot)} />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

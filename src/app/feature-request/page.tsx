"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lightbulb, MessageSquare, Bug, Send, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type RequestType = "feature" | "feedback" | "bug";

interface FeatureRequest {
    id: string;
    type: RequestType;
    title: string;
    body: string;
    created_at: string;
}

const typeConfig: Record<RequestType, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
    feature: {
        label: "Feature Request",
        icon: <Lightbulb size={16} />,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-100 dark:bg-amber-500/10",
        border: "border-amber-300 dark:border-amber-500/30",
    },
    feedback: {
        label: "Feedback",
        icon: <MessageSquare size={16} />,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-500/10",
        border: "border-blue-300 dark:border-blue-500/30",
    },
    bug: {
        label: "Bug Report",
        icon: <Bug size={16} />,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-500/10",
        border: "border-red-300 dark:border-red-500/30",
    },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function FeatureRequestPage() {
    const [type, setType] = useState<RequestType>("feature");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pastRequests, setPastRequests] = useState<FeatureRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadPastRequests = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsLoading(false); return; }

        const { data } = await supabase
            .from("feature_requests")
            .select("id, type, title, body, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);

        setPastRequests((data as FeatureRequest[]) || []);
        setIsLoading(false);
    };

    useEffect(() => { loadPastRequests(); }, []);

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim()) {
            setError("Please fill in both the title and description.");
            return;
        }
        setError(null);
        setIsSubmitting(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("You must be logged in to submit."); setIsSubmitting(false); return; }

        const { error: insertError } = await supabase
            .from("feature_requests")
            .insert({ user_id: user.id, type, title: title.trim(), body: body.trim() });

        if (insertError) {
            setError("Failed to submit. Please try again.");
            setIsSubmitting(false);
            return;
        }

        setSubmitted(true);
        setTitle("");
        setBody("");
        setIsSubmitting(false);
        await loadPastRequests();
    };

    const handleNewSubmission = () => {
        setSubmitted(false);
        setType("feature");
    };

    const cfg = typeConfig[type];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-slate-200 font-sans">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
            <div className="relative p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-4xl mx-auto z-10 flex flex-col gap-8">

                {/* Header */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Request a Feature</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-xl">
                        Have an idea, spotted a bug, or want to share feedback? Let us know — every submission is reviewed by the team.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm dark:shadow-xl">
                    {submitted ? (
                        /* Success State */
                        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Submitted! Thank you 🎉</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">Your {typeConfig[type].label.toLowerCase()} has been received. We genuinely read every one.</p>
                            </div>
                            <button
                                onClick={handleNewSubmission}
                                className="mt-4 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm font-semibold transition-colors"
                            >
                                Submit Another
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Type Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(typeConfig) as RequestType[]).map((t) => {
                                        const c = typeConfig[t];
                                        const active = type === t;
                                        return (
                                            <button
                                                key={t}
                                                onClick={() => setType(t)}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all",
                                                    active ? `${c.bg} ${c.color} ${c.border}` : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
                                                )}
                                            >
                                                {c.icon} {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => { setTitle(e.target.value); setError(null); }}
                                    placeholder={
                                        type === "feature" ? "e.g. Add dark mode support for reports..." :
                                            type === "feedback" ? "e.g. The onboarding flow was very helpful..." :
                                                "e.g. Export to PDF crashes on long reports..."
                                    }
                                    className="w-full bg-white dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {type === "bug" ? "Steps to Reproduce / Details" : "Description"}
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => { setBody(e.target.value); setError(null); }}
                                    rows={5}
                                    placeholder={
                                        type === "feature" ? "Describe the feature in detail. What problem does it solve? How would you expect it to work?" :
                                            type === "feedback" ? "Tell us what you think about the app, what you love, or what could be improved..." :
                                                "Describe the bug: what you did, what you expected, and what happened instead. Include any error messages."
                                    }
                                    className="w-full bg-white dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-600 mt-1 text-right">{body.length} characters</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <span className="material-symbols-outlined text-sm">error</span> {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="self-start flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                ) : <Send size={16} />}
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Past Submissions */}
                {!isLoading && pastRequests.length > 0 && (
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={13} /> Your Past Submissions
                        </h3>
                        <div className="flex flex-col gap-3">
                            {pastRequests.map((req) => {
                                const c = typeConfig[req.type];
                                return (
                                    <div key={req.id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-start gap-4 group hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
                                        <div className={cn("p-2 rounded-lg shrink-0", c.bg, c.color)}>
                                            {c.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={cn("text-xs font-bold uppercase tracking-wider", c.color)}>{c.label}</span>
                                                <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
                                                <span className="text-slate-500 text-xs">{timeAgo(req.created_at)}</span>
                                            </div>
                                            <p className="text-slate-900 dark:text-white text-sm font-semibold mt-0.5 truncate">{req.title}</p>
                                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 line-clamp-2">{req.body}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

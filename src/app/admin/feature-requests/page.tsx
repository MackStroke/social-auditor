"use client";

import { useEffect, useState, useMemo } from "react";
import { Star, MessageSquare, Bug, RefreshCw, AlertCircle, Check, Circle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Submission = {
    id: string;
    type: "feature" | "feedback" | "bug";
    title: string;
    body: string;
    user_email: string;
    created_at: string;
    status: string;
    is_read: boolean;
};

const TABS = [
    { key: "all", label: "All", icon: null },
    { key: "feature", label: "Feature Requests", icon: <Star size={13} /> },
    { key: "feedback", label: "Feedback", icon: <MessageSquare size={13} /> },
    { key: "bug", label: "Bug Reports", icon: <Bug size={13} /> },
] as const;

const BUG_STATUSES = [
    { value: "open", label: "Open", icon: <Circle size={14} className="text-slate-400" /> },
    { value: "in_progress", label: "In Progress", icon: <Clock size={14} className="text-blue-400" /> },
    { value: "fixed", label: "Fixed", icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
    { value: "wont_fix", label: "Won't Fix", icon: <XCircle size={14} className="text-red-400" /> },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    feature: {
        label: "Feature", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: <Star size={11} />,
    },
    feedback: {
        label: "Feedback", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <MessageSquare size={11} />,
    },
    bug: {
        label: "Bug", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: <Bug size={11} />,
    },
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminFeatureRequestsPage() {
    const [items, setItems] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "feature" | "feedback" | "bug">("all");
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/feature-requests");
            if (!res.ok) throw new Error("Failed to fetch submissions");
            const data = await res.json();
            setItems(data.items);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const counts = useMemo(() => ({
        all: items.length,
        feature: items.filter(i => i.type === "feature").length,
        feedback: items.filter(i => i.type === "feedback").length,
        bug: items.filter(i => i.type === "bug").length,
    }), [items]);

    const filtered = useMemo(() =>
        activeTab === "all" ? items : items.filter(i => i.type === activeTab),
        [items, activeTab]
    );

    const unreadCount = useMemo(() => items.filter(i => !i.is_read).length, [items]);

    const updateItem = async (id: string, updates: Partial<Submission>) => {
        setUpdating(id);
        try {
            const res = await fetch("/api/admin/feature-requests", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...updates })
            });
            if (!res.ok) throw new Error("Failed to update");

            setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

            if (updates.is_read !== undefined) {
                window.dispatchEvent(new Event("features-read-update"));
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUpdating(null);
        }
    };

    const markAllRead = async () => {
        const unreadIds = items.filter(i => !i.is_read).map(i => i.id);
        if (!unreadIds.length) return;

        // This could be optimized into a bulk API call, but for simplicity we'll just map them.
        for (const id of unreadIds) {
            await updateItem(id, { is_read: true });
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            Notifications Inbox
                            {unreadCount > 0 && (
                                <span className="text-sm font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                    {unreadCount} New
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review user feedback, features, and manage bug reports.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllRead}
                        disabled={unreadCount === 0 || loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={14} /> Mark all read
                    </button>
                    <button onClick={fetchItems} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors disabled:opacity-50">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl w-fit mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${activeTab === tab.key ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : "bg-slate-200 dark:bg-white/5 text-slate-500"
                            }`}>
                            {counts[tab.key]}
                        </span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-slate-500">
                    <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No submissions yet for this category.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(item => {
                        const cfg = TYPE_CONFIG[item.type];
                        const isUnread = !item.is_read;
                        return (
                            <div key={item.id} className={cn(
                                "group bg-white dark:bg-surface-dark border rounded-xl p-5 transition-all relative overflow-hidden shadow-sm dark:shadow-none",
                                isUnread ? "border-primary/50 shadow-[0_0_15px_rgba(24,119,242,0.1)]" : "border-slate-200 dark:border-white/5 opacity-80"
                            )}>
                                {isUnread && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                )}

                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                        {isUnread && (
                                            <button
                                                onClick={() => updateItem(item.id, { is_read: true })}
                                                disabled={updating === item.id}
                                                className="text-[10px] text-primary hover:text-white font-medium flex items-center justify-center gap-1 bg-primary/10 hover:bg-primary rounded py-1 transition-colors"
                                            >
                                                Mark Read
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className={cn("font-semibold", isUnread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                                                {item.title}
                                            </p>
                                            <span className="text-[11px] text-slate-500 shrink-0 ml-4 font-mono">
                                                {timeAgo(item.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">{item.body}</p>

                                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-white/10">
                                                    {item.user_email[0]?.toUpperCase()}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-mono">{item.user_email}</p>
                                            </div>

                                            {/* Bug Status Dropdown */}
                                            {item.type === "bug" && (
                                                <div className="relative">
                                                    <select
                                                        value={item.status || "open"}
                                                        onChange={(e) => updateItem(item.id, { status: e.target.value })}
                                                        disabled={updating === item.id}
                                                        className="appearance-none bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-slate-300 pl-8 pr-6 py-1.5 hover:border-slate-300 dark:hover:border-white/20 focus:outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                                                    >
                                                        {BUG_STATUSES.map(st => (
                                                            <option key={st.value} value={st.value}>{st.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        {BUG_STATUSES.find(s => s.value === (item.status || "open"))?.icon}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

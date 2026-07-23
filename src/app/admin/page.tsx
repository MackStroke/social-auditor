"use client";

import { useEffect, useState } from "react";
import { Users, Star, MessageSquare, Bug, Key, TrendingUp, RefreshCw } from "lucide-react";

type StatsData = {
    totalUsers: number;
    newUsersCount: number;
    totalFeatureRequests: number;
    featureCount: number;
    feedbackCount: number;
    bugCount: number;
    apiKeysCount: number;
    recentSubmissions: Array<{
        id: string;
        type: string;
        title: string;
        user_email: string;
        created_at: string;
    }>;
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    feature: { label: "Feature", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20", icon: <Star size={12} /> },
    feedback: { label: "Feedback", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: <MessageSquare size={12} /> },
    bug: { label: "Bug", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", icon: <Bug size={12} /> },
};

function Stat({ title, value, sub, icon, accent }: { title: string; value: number | string; sub?: string; icon: React.ReactNode; accent: string }) {
    return (
        <div className={`bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-6 relative overflow-hidden shadow-sm dark:shadow-none`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 ${accent}`} />
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent} bg-opacity-10 dark:bg-opacity-20 border border-transparent dark:border-white/10`}>
                {icon}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/stats");
            if (!res.ok) throw new Error("Failed to load stats");
            setStats(await res.json());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Overview of all Social Auditor activity.</p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/10 text-sm transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {loading && !stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-36 bg-slate-200 dark:bg-surface-dark border border-slate-300 dark:border-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : stats ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <Stat title="Total Users" value={stats.totalUsers} icon={<Users size={18} className="text-emerald-400" />} accent="bg-emerald-500" sub={`+${stats.newUsersCount} in last 30 days`} />
                        <Stat title="API Keys Configured" value={stats.apiKeysCount} icon={<Key size={18} className="text-indigo-400" />} accent="bg-indigo-500" sub={`${Math.round((stats.apiKeysCount / Math.max(stats.totalUsers, 1)) * 100)}% of users`} />
                        <Stat title="Total Submissions" value={stats.totalFeatureRequests} icon={<TrendingUp size={18} className="text-amber-400" />} accent="bg-amber-500" />
                        <Stat title="Feature Requests" value={stats.featureCount} icon={<Star size={18} className="text-indigo-400" />} accent="bg-indigo-500" />
                        <Stat title="Feedback" value={stats.feedbackCount} icon={<MessageSquare size={18} className="text-amber-400" />} accent="bg-amber-500" />
                        <Stat title="Bug Reports" value={stats.bugCount} icon={<Bug size={18} className="text-red-400" />} accent="bg-red-500" />
                    </div>

                    {/* Recent Submissions */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Submissions</h2>
                        {stats.recentSubmissions.length === 0 ? (
                            <p className="text-slate-500 text-sm py-6 text-center">No submissions yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {stats.recentSubmissions.map(s => {
                                    const cfg = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.feature;
                                    return (
                                        <div key={s.id} className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{s.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{s.user_email}</p>
                                            </div>
                                            <span className="text-xs text-slate-600 dark:text-slate-400 shrink-0">{timeAgo(s.created_at)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}

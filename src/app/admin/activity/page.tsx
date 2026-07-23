"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Activity, Users, Flame, TrendingUp, RefreshCw,
    BarChart3, Clock, MapPin, Filter, Search
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ActivityData = {
    totalEvents: number;
    uniqueUsers: number;
    mostUsedFeature: string | null;
    mostUsedFeatureCount: number;
    eventsToday: number;
    featureCounts: Record<string, number>;
    dailyTrend: { date: string; count: number }[];
    hourDistribution: number[];
    topUsers: { user_id: string; email: string; count: number }[];
    locations: { country: string; count: number }[];
    allCountries: string[];
    pageViews: { path: string; count: number }[];
};

const FEATURE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    audit: { label: "Ad Audit", color: "text-blue-400", bg: "bg-blue-500" },
    generate_copy: { label: "Copy Generator", color: "text-violet-400", bg: "bg-violet-500" },
    simulate: { label: "Simulator", color: "text-amber-400", bg: "bg-amber-500" },
    ab_test: { label: "A/B Testing", color: "text-emerald-400", bg: "bg-emerald-500" },
    page_view: { label: "Page Views", color: "text-slate-400", bg: "bg-slate-500" },
};

const DATE_RANGES = [
    { value: "1d", label: "Today" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Stat({ title, value, sub, icon, accent }: {
    title: string; value: string | number; sub?: string;
    icon: React.ReactNode; accent: string;
}) {
    return (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 ${accent}`} />
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent} bg-opacity-10 dark:bg-opacity-20 border border-transparent dark:border-white/10`}>
                {icon}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
            {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

function FeatureBar({ feature, count, maxCount }: { feature: string; count: number; maxCount: number }) {
    const cfg = FEATURE_LABELS[feature] ?? { label: feature, color: "text-slate-400", bg: "bg-slate-500" };
    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
        <div className="flex items-center gap-3 group">
            <span className={`text-xs font-semibold w-28 shrink-0 truncate ${cfg.color}`}>{cfg.label}</span>
            <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                <div
                    className={`h-full ${cfg.bg} rounded-lg transition-all duration-700 ease-out opacity-80 group-hover:opacity-100`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                />
                <span className="absolute inset-y-0 right-2 flex items-center text-[11px] font-bold text-white/70">
                    {count.toLocaleString()}
                </span>
            </div>
        </div>
    );
}

function HourHeatmap({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);
    return (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-amber-500 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Peak Hours</h3>
            </div>
            <div className="grid grid-cols-12 gap-1">
                {data.map((v, i) => {
                    const intensity = max > 0 ? v / max : 0;
                    return (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div
                                className="w-full aspect-square rounded-md transition-colors"
                                style={{
                                    backgroundColor: intensity > 0
                                        ? `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`
                                        : "rgba(255,255,255,0.03)",
                                }}
                                title={`${i}:00 — ${v} events`}
                            />
                            {i % 3 === 0 && (
                                <span className="text-[9px] text-slate-600 font-mono">{i}</span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-slate-600">12 AM</span>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-2 rounded-sm bg-indigo-500/15" />
                    <span className="text-[10px] text-slate-600">Low</span>
                    <div className="w-3 h-2 rounded-sm bg-indigo-500/60 ml-1" />
                    <span className="text-[10px] text-slate-600">Med</span>
                    <div className="w-3 h-2 rounded-sm bg-indigo-500 ml-1" />
                    <span className="text-[10px] text-slate-600">High</span>
                </div>
                <span className="text-[10px] text-slate-600">11 PM</span>
            </div>
        </div>
    );
}

import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, YAxis, CartesianGrid, Cell, LabelList } from "recharts";

function DailyChart({ data }: { data: { date: string; count: number }[] }) {
    const displayData = data.slice(-30);
    return (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-emerald-500 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Trend</h3>
            </div>
            <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData}>
                        <defs>
                            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tickFormatter={t => t.slice(5)} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorDaily)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function ActivityTracerPage() {
    const [data, setData] = useState<ActivityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [featureTab, setFeatureTab] = useState<'overview' | 'pages'>('overview');

    // Filters
    const [range, setRange] = useState("30d");
    const [featureFilter, setFeatureFilter] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [countryFilter, setCountryFilter] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ range });
            if (featureFilter) params.set("feature", featureFilter);
            if (countryFilter) params.set("country", countryFilter);
            // user_id will be searched from the topUsers list client-side

            const res = await fetch(`/api/admin/activity?${params}`);
            if (!res.ok) throw new Error("Failed to load activity data");
            setData(await res.json());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [range, featureFilter, countryFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Feature entries sorted by count descending
    const featureEntries = data
        ? Object.entries(data.featureCounts).sort((a, b) => b[1] - a[1])
        : [];
    const maxFeatureCount = featureEntries[0]?.[1] ?? 0;

    // Filtered top users (client-side search)
    const filteredUsers = data?.topUsers.filter(u =>
        !userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase())
    ) ?? [];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* ---- Header ---- */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center">
                            <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">Activity Tracer</h1>
                            <p className="text-slate-500 text-xs mt-0.5">Feature usage analytics &amp; user engagement</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/10 text-sm transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* ---- Filter Bar ---- */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl shadow-sm dark:shadow-none">
                <Filter size={14} className="text-slate-500 shrink-0" />

                {/* Date range pills */}
                <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
                    {DATE_RANGES.map(r => (
                        <button
                            key={r.value}
                            onClick={() => setRange(r.value)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${range === r.value
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* Feature filter */}
                <select
                    value={featureFilter}
                    onChange={e => setFeatureFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
                >
                    <option value="">All Features</option>
                    {Object.entries(FEATURE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>

                {/* Country filter */}
                <select
                    value={countryFilter}
                    onChange={e => setCountryFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
                >
                    <option value="">All Locations</option>
                    {(data?.allCountries ?? []).map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {/* User search */}
                <div className="relative flex-1 min-w-[180px]">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Search users…"
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-primary/40 placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* ---- Error ---- */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* ---- Skeleton ---- */}
            {loading && !data ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : data ? (
                <>
                    {/* ---- Stat Cards ---- */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Stat
                            title="Total Events"
                            value={data.totalEvents.toLocaleString()}
                            icon={<BarChart3 size={16} className="text-indigo-400" />}
                            accent="bg-indigo-500"
                            sub={`in last ${range === "1d" ? "24h" : range.replace("d", " days")}`}
                        />
                        <Stat
                            title="Unique Users"
                            value={data.uniqueUsers}
                            icon={<Users size={16} className="text-emerald-400" />}
                            accent="bg-emerald-500"
                        />
                        <Stat
                            title="Most Used"
                            value={FEATURE_LABELS[data.mostUsedFeature ?? ""]?.label ?? "—"}
                            icon={<Flame size={16} className="text-amber-400" />}
                            accent="bg-amber-500"
                            sub={data.mostUsedFeatureCount > 0 ? `${data.mostUsedFeatureCount.toLocaleString()} uses` : undefined}
                        />
                        <Stat
                            title="Events Today"
                            value={data.eventsToday.toLocaleString()}
                            icon={<Activity size={16} className="text-blue-400" />}
                            accent="bg-blue-500"
                        />
                    </div>

                    {/* ---- Charts Row ---- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {/* Feature Usage */}
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-none flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={16} className="text-indigo-500 dark:text-indigo-400" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Feature Usage</h3>
                                </div>
                                <div className="flex bg-slate-100 dark:bg-white/5 rounded-md p-0.5">
                                    <button
                                        onClick={() => setFeatureTab('overview')}
                                        className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${featureTab === 'overview' ? 'bg-white dark:bg-surface-dark shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setFeatureTab('pages')}
                                        className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${featureTab === 'pages' ? 'bg-white dark:bg-surface-dark shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Pages
                                    </button>
                                </div>
                            </div>

                            {featureTab === 'overview' ? (
                                featureEntries.length === 0 ? (
                                    <p className="text-slate-500 text-sm py-4 text-center">No events yet.</p>
                                ) : (
                                    <div className="h-36">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={featureEntries.map(e => ({ name: FEATURE_LABELS[e[0]]?.label || e[0], count: e[1], originalKey: e[0] }))} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                                                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                                    {featureEntries.map((e, index) => {
                                                        const colorMap: Record<string, string> = {
                                                            audit: '#3b82f6',
                                                            generate_copy: '#8b5cf6',
                                                            simulate: '#f59e0b',
                                                            ab_test: '#10b981',
                                                            page_view: '#94a3b8'
                                                        };
                                                        return <Cell key={`cell-${index}`} fill={colorMap[e[0]] || '#64748b'} />;
                                                    })}
                                                    <LabelList dataKey="count" position="right" fill="#64748b" fontSize={11} fontWeight={600} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )
                            ) : (
                                <div className="h-36 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                                    {!data?.pageViews?.length ? (
                                        <p className="text-slate-500 text-sm py-4 text-center">No page views tracked.</p>
                                    ) : (
                                        data.pageViews.map((pv, idx) => {
                                            const pct = data.totalEvents > 0 ? (pv.count / data.totalEvents) * 100 : 0;
                                            return (
                                                <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-white/[0.02] p-2 rounded-lg border border-slate-100 dark:border-white/5">
                                                    <span className="font-mono text-slate-600 dark:text-slate-400 truncate max-w-[200px]" title={pv.path}>{pv.path}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">{pv.count}</span>
                                                        <span className="text-[10px] text-slate-500 w-8 text-right block">{pct.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Daily Trend */}
                        <DailyChart data={data.dailyTrend} />
                    </div>

                    {/* ---- Hour Heatmap + Locations row ---- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        <HourHeatmap data={data.hourDistribution} />

                        {/* Locations */}
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={16} className="text-rose-500 dark:text-rose-400" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Locations</h3>
                            </div>
                            {data.locations.length === 0 ? (
                                <p className="text-slate-500 text-sm py-4 text-center">No location data yet.</p>
                            ) : (
                                <div className="h-44 mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.locations.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="country" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                                            <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                            <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]}>
                                                <LabelList dataKey="count" position="right" fill="#64748b" fontSize={11} fontWeight={600} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---- Top Users Table ---- */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={16} className="text-emerald-500 dark:text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Users</h3>
                            <span className="text-[10px] text-slate-500 dark:text-slate-600 ml-auto">by total events</span>
                        </div>
                        {filteredUsers.length === 0 ? (
                            <p className="text-slate-500 text-sm py-6 text-center">No users found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-white/5">
                                            <th className="text-left text-slate-500 text-xs font-semibold pb-2 pr-4">#</th>
                                            <th className="text-left text-slate-500 text-xs font-semibold pb-2 pr-4">User</th>
                                            <th className="text-right text-slate-500 text-xs font-semibold pb-2">Events</th>
                                            <th className="text-right text-slate-500 text-xs font-semibold pb-2 pl-4">Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u, i) => (
                                            <tr key={u.user_id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 pr-4 text-slate-500 dark:text-slate-600 font-mono text-xs">{i + 1}</td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-indigo-600/40 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-white shrink-0">
                                                            {u.email[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{u.email}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">{u.count.toLocaleString()}</td>
                                                <td className="py-3 text-right pl-4 text-slate-500 text-xs font-mono">
                                                    {data.totalEvents > 0 ? ((u.count / data.totalEvents) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}

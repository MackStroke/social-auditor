"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, Users, MapPin, Activity, Flame, Filter, RefreshCw } from "lucide-react";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

type ReportData = {
    userGrowthTrend: { date: string; totalUsers: number; newUsers: number }[];
    activityTrend: any[];
    locationTrend: any[];
    topCountries: string[];
};

const DATE_RANGES = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
];

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState("30d");

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/reports?range=${range}`);
            if (!res.ok) throw new Error("Failed to load report data");
            setData(await res.json());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const formatXAxis = (tickItem: string) => {
        return tickItem.slice(5); // Show MM-DD
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                        <BarChart3 size={18} className="text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">Comprehensive Reports</h1>
                        <p className="text-slate-500 text-xs mt-0.5">Linear graphics visualizing full historical app data</p>
                    </div>
                </div>

                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 hover:text-slate-900"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl">
                <Filter size={14} className="text-slate-500 shrink-0" />
                <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
                    {DATE_RANGES.map(r => (
                        <button
                            key={r.value}
                            onClick={() => setRange(r.value)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold ${range === r.value ? "bg-primary text-white" : "text-slate-500"}`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                    {error}
                </div>
            )}

            {loading && !data ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-80 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : data ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Growth Trend (Area Chart) */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Users size={16} className="text-emerald-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">User Base Growth</h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.userGrowthTrend}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="totalUsers" stroke="#10b981" fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Overall Activity Events Trend */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity size={16} className="text-indigo-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Usage & Events</h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.activityTrend}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="total" name="Total Events" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Feature Adoption Breakdown */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Flame size={16} className="text-amber-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Core Feature Usage</h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.activityTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <Line type="monotone" dataKey="audit" name="Audit" stroke="#3b82f6" dot={false} strokeWidth={2} />
                                    <Line type="monotone" dataKey="generate_copy" name="Copy" stroke="#8b5cf6" dot={false} strokeWidth={2} />
                                    <Line type="monotone" dataKey="simulate" name="Simulator" stroke="#f59e0b" dot={false} strokeWidth={2} />
                                    <Line type="monotone" dataKey="ab_test" name="A/B Test" stroke="#10b981" dot={false} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Location Penetration */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <MapPin size={16} className="text-rose-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Traffic by Top Locations</h3>
                        </div>
                        <div className="h-64">
                            {data.topCountries.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-sm text-slate-500">Not enough data to graph routes.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.locationTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        {data.topCountries.map((country, idx) => (
                                            <Line
                                                key={country}
                                                type="monotone"
                                                dataKey={country}
                                                name={country}
                                                stroke={['#f43f5e', '#a855f7', '#0ea5e9'][idx % 3]}
                                                dot={false}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

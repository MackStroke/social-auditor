"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { getHistory, AuditResult } from "@/lib/history";
import { cn } from "@/lib/utils";
import { Share2, Download, Search, Layers, CheckCircle2, Zap, Eye, AlertCircle } from "lucide-react";

function ReportContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");

    const [audit, setAudit] = useState<AuditResult | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Toolbar Interactive States
    const [heatmapOpacity, setHeatmapOpacity] = useState(85);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const exportToPDF = () => {
        // Native window print dialog forces vector text rendering and exact CSS layout
        window.print();
    };

    useEffect(() => {
        if (id) {
            getHistory().then((history) => {
                const found = history.find((a) => a.id === id);
                if (found) {
                    // Hydrate missing fields for older audits manually to prevent UI breakage
                    const enrichedAudit = {
                        ...found,
                        visibility: found.visibility ?? 85,
                        textLegibility: found.textLegibility ?? 92,
                        brandPresence: found.brandPresence ?? 88,
                    };
                    setAudit(enrichedAudit as AuditResult);

                    // Initialize toolbar state from history
                    setHeatmapOpacity(enrichedAudit.visibility);
                }
            });
        }
    }, [id]);

    if (!id) {
        return (
            <div className="p-12 flex flex-col items-center justify-center h-full text-slate-500 dark:text-zinc-500">
                <AlertCircle size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-medium text-slate-700 dark:text-zinc-300 mb-2">No Report Selected</h2>
                <p className="mb-6">Please select an audit from your history or run a new one.</p>
                <button onClick={() => router.push("/")} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    if (!audit) {
        return (
            <div className="p-12 flex justify-center items-center h-full">
                <div className="animate-pulse flex flex-col items-center gap-4 text-slate-500 dark:text-zinc-500">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    Loading report data...
                </div>
            </div>
        );
    }

    return (
        <div id="report-export-container" className="p-4 sm:p-6 md:p-8 lg:p-12 pb-20 w-full max-w-7xl mx-auto z-10 flex flex-col gap-6 font-sans">

            {/* Top Header Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{audit.fileName.replace(/\.[^/.]+$/, "")}</h1>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 tracking-wider">ANALYZED</span>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">schedule</span> Generated on {new Date(audit.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • {new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="flex gap-3 print:hidden">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A221E] hover:bg-slate-50 dark:hover:bg-[#252E2A] border border-slate-200 dark:border-white/10 rounded-md text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors shadow-sm dark:shadow-none"
                    >
                        <Share2 size={16} /> Share
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A221E] hover:bg-slate-50 dark:hover:bg-[#252E2A] border border-slate-200 dark:border-white/10 rounded-md text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors shadow-sm dark:shadow-none"
                    >
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 print:hidden" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white dark:bg-[#1A221E] border border-slate-200 dark:border-white/10 rounded-xl max-w-sm w-full shadow-2xl flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Share2 size={20} className="text-primary" /> Share Report</h2>
                            <button onClick={() => setShowShareModal(false)} className="text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Copy Link */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Direct Link</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={typeof window !== 'undefined' ? window.location.href : ''}
                                        className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 w-full focus:outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("Link copied to clipboard!");
                                        }}
                                        className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-white/5 my-4" />
                            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Social \u0026 PDF</label>

                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this AI Ad Audit I just ran on my creative:\n\nPredicted Conversion: ${audit.conversionRate}%\nPredicted Engagement: ${audit.engagementRate}%\n\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-black border border-transparent dark:border-white/10 hover:bg-slate-800 dark:hover:border-white/20 text-white dark:text-zinc-300 dark:hover:text-white py-2.5 rounded-lg text-sm font-medium transition-all"
                                >
                                    X (Twitter)
                                </a>
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-[#0077b5] hover:bg-[#005e93] text-white py-2.5 rounded-lg text-sm font-medium transition-all"
                                >
                                    LinkedIn
                                </a>
                            </div>

                            <button
                                onClick={() => {
                                    setShowShareModal(false);
                                    exportToPDF();
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-white py-3 rounded-lg text-sm font-medium transition-colors mt-2"
                            >
                                <Download size={18} /> Download Report PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">

                {/* LEFT COLUMN: Visuals */}
                <div className="lg:col-span-7 flex flex-col gap-6">

                    {/* Main Heatmap Viewer */}
                    <div className="bg-white dark:bg-[#1A221E] rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-2xl flex flex-col items-center">
                        <div className="relative w-full bg-slate-100 dark:bg-black/40 flex flex-col items-center justify-center min-h-[300px]">

                            {/* Inner Shrink-Wrapped Container */}
                            <div className="relative inline-block max-w-full max-h-[600px]">
                                {audit.creativeUrl ? (
                                    <Image
                                        src={audit.creativeUrl}
                                        alt="Creative"
                                        width={800}
                                        height={600}
                                        className="object-contain max-h-[60vh] w-auto h-auto block"
                                        priority
                                    />
                                ) : (
                                    <div className="w-[400px] max-w-full h-[300px] sm:h-[400px] flex items-center justify-center border border-dashed border-slate-300 dark:border-white/10 rounded-lg">
                                        <span className="text-slate-500 dark:text-zinc-500">No Image Data</span>
                                    </div>
                                )}

                                {/* Heatmap Overlay Points */}
                                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-sm transition-opacity duration-300" style={{ mixBlendMode: 'screen', opacity: showHeatmap ? (heatmapOpacity / 100) : 0 }}>
                                    {audit.heatmapPoints.map((point, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: Math.min(point.intensity + 0.2, 1) }}
                                            transition={{ delay: 0.2 + (i * 0.1) }}
                                            className="absolute rounded-full"
                                            style={{
                                                left: `${point.x}%`,
                                                top: `${point.y}%`,
                                                width: '35%',
                                                aspectRatio: '1/1',
                                                transform: 'translate(-50%, -50%)',
                                                background: `radial-gradient(circle, rgba(239,68,68,0.9) 0%, rgba(245,158,11,0.6) 30%, rgba(16,185,129,0) 70%)`,
                                                filter: 'blur(20px)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Top Badge */}
                            <div className="absolute top-4 left-4 z-20 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200 tracking-wide shadow-sm dark:shadow-none">
                                <span className="material-symbols-outlined text-[14px] text-orange-500 dark:text-blue-500">local_fire_department</span> ATTENTION HEATMAP
                            </div>
                        </div>

                        {/* Bottom Toolbar of Viewer */}
                        <div className="bg-slate-50 dark:bg-[#141A17] p-4 w-full flex items-center justify-between border-t border-slate-200 dark:border-white/5">
                            <div className="flex items-center gap-4 w-full max-w-sm">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 tracking-wider">VISIBILITY:</span>
                                <input
                                    type="range"
                                    title="Heatmap Opacity"
                                    min="0" max="100"
                                    value={heatmapOpacity}
                                    onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
                                />
                                <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300 w-8">{heatmapOpacity}%</span>
                            </div>
                            <div className="flex gap-4 text-slate-500 dark:text-zinc-400">
                                <button onClick={() => setIsZoomed(true)} title="View Fullscreen" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <Search size={16} />
                                </button>
                                <button onClick={() => setShowHeatmap(!showHeatmap)} title="Toggle Heatmap Overlay" className={cn("transition-colors", showHeatmap ? "text-primary dark:text-blue-400" : "hover:text-slate-900 dark:hover:text-white opacity-50")}>
                                    <Layers size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#1A221E] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none p-5 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-slate-900 dark:text-zinc-200 font-semibold text-sm">Text Legibility</h3>
                                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", audit.textLegibility >= 80 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-500" : audit.textLegibility >= 60 ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500" : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-500")}>
                                    {audit.textLegibility >= 80 ? <CheckCircle2 size={12} strokeWidth={3} /> : <AlertCircle size={12} strokeWidth={3} />}
                                </div>
                            </div>
                            <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed mb-6">
                                {audit.textLegibilityReason || `Contrast ratio is excellent. The headline is the first element read by ${audit.textLegibility}% of viewers.`}
                            </p>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-auto">
                                <div className={cn("h-full", audit.textLegibility >= 80 ? "bg-emerald-500" : audit.textLegibility >= 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${audit.textLegibility}%` }} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1A221E] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none p-5 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-slate-900 dark:text-zinc-200 font-semibold text-sm">Brand Presence</h3>
                                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", audit.brandPresence >= 80 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-500" : audit.brandPresence >= 60 ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500" : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-500")}>
                                    {audit.brandPresence >= 80 ? <CheckCircle2 size={12} strokeWidth={3} /> : <AlertCircle size={12} strokeWidth={3} />}
                                </div>
                            </div>
                            <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed mb-6">
                                {audit.brandPresenceReason || "Logo placement follows the 'F-pattern' reading habit, maximizing recall."}
                            </p>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-auto">
                                <div className={cn("h-full", audit.brandPresence >= 80 ? "bg-emerald-500" : audit.brandPresence >= 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${audit.brandPresence}%` }} />
                            </div>
                        </div>
                    </div>

                </div>


                {/* RIGHT COLUMN: Data */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* Top Score Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-[#112318] border border-blue-200 dark:border-blue-900/30 p-5 rounded-xl relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-emerald-100 dark:text-emerald-900/40">
                                <span className="material-symbols-outlined text-5xl">payments</span>
                            </div>
                            <p className="text-slate-500 dark:text-zinc-400 text-xs font-semibold tracking-wide mb-1 relative z-10">Conversion Probability</p>
                            <div className="flex items-end gap-3 mb-2 relative z-10">
                                <span className="text-4xl font-black text-slate-800 dark:text-white">{audit.conversionRate}%</span>
                                <span className={cn("text-[10px] font-bold tracking-wider pb-1", audit.conversionRate >= 70 ? "text-emerald-600 dark:text-emerald-500" : audit.conversionRate >= 40 ? "text-yellow-600 dark:text-yellow-500" : "text-red-600 dark:text-red-500")}>
                                    {audit.conversionRate >= 70 ? "APPROVED" : audit.conversionRate >= 40 ? "MARGINAL" : "REJECTED"}
                                </span>
                            </div>
                            <p className={cn("text-xs font-medium flex items-center gap-1 relative z-10", (audit.conversionVsAvg ?? Math.round(audit.conversionRate - 65)) >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500")}>
                                <span className="material-symbols-outlined text-xs">{(audit.conversionVsAvg ?? Math.round(audit.conversionRate - 65)) >= 0 ? "trending_up" : "trending_down"}</span> {(audit.conversionVsAvg ?? Math.round(audit.conversionRate - 65)) > 0 ? "+" : ""}{audit.conversionVsAvg ?? Math.round(audit.conversionRate - 65)}% vs avg
                            </p>
                        </div>

                        <div className="bg-white dark:bg-[#1A221E] border border-slate-200 dark:border-white/5 p-5 rounded-xl relative overflow-hidden shadow-sm dark:shadow-none">
                            <div className="absolute top-4 right-4 text-emerald-100 dark:text-emerald-900/30">
                                <span className="material-symbols-outlined text-5xl">ads_click</span>
                            </div>
                            <p className="text-slate-500 dark:text-zinc-400 text-xs font-semibold tracking-wide mb-1 relative z-10">Predicted CTR</p>
                            <div className="flex items-end gap-3 mb-2 relative z-10">
                                <span className="text-4xl font-black text-slate-800 dark:text-white">{audit.engagementRate}%</span>
                                <span className={cn("text-[10px] font-bold tracking-wider pb-1", audit.engagementRate >= 70 ? "text-emerald-600 dark:text-emerald-500" : audit.engagementRate >= 40 ? "text-yellow-600 dark:text-yellow-500" : "text-red-600 dark:text-red-500")}>
                                    {audit.engagementRate >= 70 ? "HIGH" : audit.engagementRate >= 40 ? "AVERAGE" : "LOW"}
                                </span>
                            </div>
                            <p className={cn("text-xs font-medium flex items-center gap-1 relative z-10", (audit.engagementVsAvg ?? Math.round(audit.engagementRate - 65)) >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500")}>
                                <span className="material-symbols-outlined text-xs">{(audit.engagementVsAvg ?? Math.round(audit.engagementRate - 65)) >= 0 ? "trending_up" : "trending_down"}</span> {(audit.engagementVsAvg ?? Math.round(audit.engagementRate - 65)) > 0 ? "+" : ""}{audit.engagementVsAvg ?? Math.round(audit.engagementRate - 65)}% vs avg
                            </p>
                        </div>
                    </div>

                    {/* Competitor Benchmark Panel (Conditional) */}
                    {audit.competitorAnalysis && (
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-[#112318] dark:to-[#1A221E] border border-blue-200 dark:border-blue-900/40 rounded-xl p-6 shadow-inner relative overflow-hidden">
                            <div className="absolute top-6 right-6 text-blue-100 dark:text-blue-900/30">
                                <span className="material-symbols-outlined text-6xl">query_stats</span>
                            </div>

                            <h3 className="text-blue-600 dark:text-blue-500 text-sm font-bold tracking-widest uppercase mb-6 flex items-center gap-2 relative z-10">
                                <span className="material-symbols-outlined text-lg">leaderboard</span> Competitor Benchmark
                            </h3>

                            <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
                                <div>
                                    <p className="text-slate-500 dark:text-zinc-500 text-xs font-semibold mb-1 tracking-wide">Industry Avg CTR</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-700 dark:text-zinc-300">{audit.competitorAnalysis.industryAverageCtr}%</span>
                                        <span className={cn("text-xs font-bold", audit.engagementRate > audit.competitorAnalysis.industryAverageCtr ? "text-emerald-600 dark:text-emerald-500" : "text-red-500 dark:text-red-400")}>
                                            {audit.engagementRate > audit.competitorAnalysis.industryAverageCtr ? "You are ahead" : "Below average"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-zinc-500 text-xs font-semibold mb-1 tracking-wide">Industry Avg Conversion</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-700 dark:text-zinc-300">{audit.competitorAnalysis.industryAverageConversion}%</span>
                                        <span className={cn("text-xs font-bold", audit.conversionRate > audit.competitorAnalysis.industryAverageConversion ? "text-emerald-600 dark:text-emerald-500" : "text-red-500 dark:text-red-400")}>
                                            {audit.conversionRate > audit.competitorAnalysis.industryAverageConversion ? "You are ahead" : "Below average"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10 border-t border-slate-200 dark:border-white/5 pt-4">
                                <div>
                                    <p className="text-slate-500 dark:text-zinc-400 text-xs font-semibold tracking-wide mb-2 uppercase">Traits of Top Performers in Niche:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {audit.competitorAnalysis.topPerformersTraits.map((trait, idx) => (
                                            <li key={idx} className="text-slate-700 dark:text-zinc-300 text-sm text-balance leading-snug">{trait}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-blue-50/50 dark:bg-black/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900/20">
                                    <p className="text-blue-600 dark:text-blue-500 text-[10px] font-bold tracking-wider mb-1 uppercase">Strategic Recommendation</p>
                                    <p className="text-slate-700 dark:text-zinc-200 text-sm leading-relaxed">{audit.competitorAnalysis.positioningRecommendation}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Campaign Objective Specific Metrics */}
                    {audit.objectiveMetrics && audit.objectiveMetrics.length > 0 && (
                        <div className="bg-white dark:bg-[#1A221E] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-xl flex-col flex overflow-hidden lg:col-span-12 xl:col-span-auto">
                            <div className="p-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">track_changes</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide">Objective Analysis</h2>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Optimized for: <span className="text-blue-600 dark:text-blue-400 font-semibold">{audit.campaignObjective || "General Performance"}</span></p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                {audit.objectiveMetrics.map((metric, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-black/20 p-5 rounded-xl border border-slate-200 dark:border-white/5 transition-all hover:border-blue-300 dark:hover:border-blue-500/30 group">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{metric.name}</span>
                                            <span className={cn("text-2xl font-black font-mono tracking-tighter", metric.score >= 80 ? "text-emerald-600 dark:text-emerald-500" : metric.score >= 60 ? "text-yellow-600 dark:text-yellow-500" : "text-red-600 dark:text-red-500")}>
                                                {metric.score}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-1.5 mb-4 overflow-hidden">
                                            <div
                                                className={cn("h-1.5 rounded-full transition-all duration-1000", metric.score >= 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" : metric.score >= 60 ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)] dark:shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] dark:shadow-[0_0_10px_rgba(239,68,68,0.5)]")}
                                                style={{ width: `${metric.score}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-zinc-300 transition-colors">
                                            {metric.reasoning}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Insights Panel */}
                    <div className="bg-white dark:bg-[#1A221E] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-xl flex-1 flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide">AI Actionable Insights</h2>
                        </div>

                        <div className="p-6 flex-1 flex flex-col gap-8">

                            {/* Improvements Section */}
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Suggested Improvements
                                </h4>
                                <div className="space-y-5">
                                    {audit.improvements.map((imp, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-0.5 text-orange-500 dark:text-orange-400">
                                                {i % 2 === 0 ? <Zap size={18} className="fill-current" /> : <Eye size={18} />}
                                            </div>
                                            <div>
                                                <h5 className="text-slate-800 dark:text-zinc-200 text-sm font-semibold mb-1">
                                                    {imp.split('.')[0] || "Improvement suggestion"}
                                                </h5>
                                                <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                                                    {imp}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Strengths Section */}
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Key Strengths
                                </h4>
                                <div className="space-y-5">
                                    {audit.strengths.map((str, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-0.5 text-emerald-600 dark:text-emerald-500">
                                                {i % 2 === 0 ? <span className="material-symbols-outlined text-[18px]">verified</span> : <span className="material-symbols-outlined text-[18px]">palette</span>}
                                            </div>
                                            <div>
                                                <h5 className="text-slate-800 dark:text-zinc-200 text-sm font-semibold mb-1">
                                                    {str.split('.')[0] || "Strong element"}
                                                </h5>
                                                <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                                                    {str}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-white/5 print:hidden">
                            <button onClick={() => setShowDetails(true)} className="w-full py-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-500 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2">
                                View Detailed Report <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Detailed Report Modal */}
            {showDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm p-4 print:hidden">
                    <div className="bg-white dark:bg-[#1A221E] border border-slate-200 dark:border-white/10 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-[#1A221E]/95 backdrop-blur z-10">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Detailed Report</h2>
                            <button onClick={() => setShowDetails(false)} className="text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 text-slate-700 dark:text-zinc-300 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-blue-600 dark:text-blue-500 mb-1 tracking-wide uppercase text-xs">Platform Optimized For</h4>
                                    <p className="text-lg font-semibold text-slate-800 dark:text-white">{audit.platform || "Meta/Instagram"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-lg border border-slate-200 dark:border-white/5">
                                        <h4 className="font-medium text-slate-500 dark:text-zinc-400 mb-1 text-sm">Conversion</h4>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{audit.conversionRate}%</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-lg border border-slate-200 dark:border-white/5">
                                        <h4 className="font-medium text-slate-500 dark:text-zinc-400 mb-1 text-sm">Engagement</h4>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{audit.engagementRate}%</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-lg border border-slate-200 dark:border-white/5">
                                        <h4 className="font-medium text-slate-500 dark:text-zinc-400 mb-1 text-sm">Visibility</h4>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{audit.visibility}%</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-lg border border-slate-200 dark:border-white/5">
                                        <h4 className="font-medium text-slate-500 dark:text-zinc-400 mb-1 text-sm">Legibility</h4>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{audit.textLegibility}%</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-blue-600 dark:text-blue-500 text-xs font-bold uppercase tracking-wider mb-2">Raw Analysis JSON Log</h3>
                                <pre className="bg-slate-100 dark:bg-black/80 p-4 rounded-lg overflow-x-auto text-xs font-mono text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/5 shadow-inner">
                                    {JSON.stringify(audit, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Zoom Modal */}
            {isZoomed && (
                <div className="fixed inset-0 z-[60] bg-slate-900/90 dark:bg-black/95 flex items-center justify-center p-4 print:hidden" onClick={() => setIsZoomed(false)}>
                    <button
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white dark:text-white/50 dark:hover:text-white bg-slate-800/50 hover:bg-slate-800/80 dark:bg-white/10 dark:hover:bg-white/20 rounded-full p-2 transition-all z-50"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className="relative inline-block max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
                        {audit.creativeUrl && (
                            <Image
                                src={audit.creativeUrl}
                                alt="Creative Zoom"
                                width={1600}
                                height={1200}
                                className="object-contain max-h-[90vh] max-w-[90vw] w-auto h-auto block rounded-lg shadow-2xl shadow-blue-900/20"
                                priority
                            />
                        )}
                        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg transition-opacity duration-300" style={{ mixBlendMode: 'screen', opacity: showHeatmap ? (heatmapOpacity / 100) : 0 }}>
                            {audit.heatmapPoints.map((point, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: Math.min(point.intensity + 0.2, 1) }}
                                    className="absolute rounded-full"
                                    style={{
                                        left: `${point.x}%`,
                                        top: `${point.y}%`,
                                        width: '35%',
                                        aspectRatio: '1/1',
                                        transform: 'translate(-50%, -50%)',
                                        background: `radial-gradient(circle, rgba(239,68,68,0.9) 0%, rgba(245,158,11,0.6) 30%, rgba(16,185,129,0) 70%)`,
                                        filter: 'blur(30px)' // Slightly more blur for upscaled fullscreen
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ReportPage() {
    return (
        <div className="bg-slate-50 dark:bg-background min-h-screen text-slate-900 dark:text-slate-200 font-sans">
            <Suspense fallback={<div className="p-12 text-slate-500 dark:text-zinc-500">Loading viewer...</div>}>
                <ReportContent />
            </Suspense>
        </div>
    );
}

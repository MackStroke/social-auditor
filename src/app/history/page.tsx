"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getHistory, AuditResult, clearHistory } from "@/lib/history";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<AuditResult[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
    const [selectedAudits, setSelectedAudits] = useState<string[]>([]);
    const [isComparisonVisible, setIsComparisonVisible] = useState(false);

    useEffect(() => {
        getHistory().then(setHistory);
    }, []);

    const filterOptions = [
        { name: "All Platforms", icon: "close" },
        { name: "Meta Ads", icon: "public" },
        { name: "Google Ads", icon: "smart_display" },
        { name: "Top Performers", icon: "star" },
        { name: "Needs Improvement", icon: "trending_down" }
    ];

    const getScore = (audit?: AuditResult) => {
        if (!audit) return 0;
        return Math.round((audit.conversionRate + audit.engagementRate) / 2);
    };

    const filteredHistory = history.filter((audit) => {
        const score = getScore(audit);
        if (selectedPlatform === "Meta Ads") return audit.platform === "Meta";
        if (selectedPlatform === "Google Ads") return audit.platform === "Google";
        if (selectedPlatform === "Top Performers") return score >= 80;
        if (selectedPlatform === "Needs Improvement") return score < 60;
        return true; // All Platforms
    });

    const handleClear = async () => {
        if (confirm("Are you sure you want to delete all audit history locally?")) {
            await clearHistory();
            setHistory([]);
            setSelectedAudits([]);
            setIsComparisonVisible(false);
        }
    };

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedAudits(prev => {
            if (prev.includes(id)) {
                return prev.filter(a => a !== id);
            }
            if (prev.length >= 2) {
                // Remove oldest, add new
                return [prev[1], id];
            }
            return [...prev, id];
        });
    };

    const handleCompareClick = () => {
        if (selectedAudits.length === 2) {
            setIsComparisonVisible(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (selectedAudits.length < 2 && history.length >= 2) {
            // Auto select latest 2 if available
            setSelectedAudits([history[0].id, history[1].id]);
            setIsComparisonVisible(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Get selected AuditResult objects for comparison
    const compareA = history.find(a => a.id === selectedAudits[0]);
    const compareB = history.find(a => a.id === selectedAudits[1]);

    return (
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 scroll-smooth overflow-y-auto h-full relative">

            {/* Background Grid Accent */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Ad Creative History</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl">
                        Analyze past performance, review AI scores, and compare creatives side-by-side to optimize
                        your next campaign. (Saved locally)
                    </p>
                </div>
                <div className="flex gap-3">
                    {history.length > 0 && (
                        <button onClick={handleClear} className="text-slate-500 hover:text-red-400 px-3 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-sm font-semibold border border-transparent hover:border-red-400/20 hover:bg-red-400/10">
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Clear History
                        </button>
                    )}
                    <button
                        onClick={handleCompareClick}
                        className={cn(
                            "border hover:bg-slate-50 dark:hover:bg-white/5 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-sm font-semibold",
                            selectedAudits.length === 2
                                ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                                : "bg-white dark:bg-surface-dark border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                        )}
                    >
                        <span className="material-symbols-outlined text-sm">compare_arrows</span>
                        Compare Selected ({selectedAudits.length}/2)
                    </button>
                </div>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-3 items-center relative z-10">
                {filterOptions.map((filter) => (
                    <button
                        key={filter.name}
                        onClick={() => setSelectedPlatform(filter.name)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm",
                            selectedPlatform === filter.name
                                ? "bg-primary/10 text-primary border-primary/20 ring-1 ring-primary/20"
                                : filter.name === "All Platforms" && selectedPlatform !== filter.name
                                    ? "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                                    : "bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-white/10"
                        )}
                    >
                        {filter.name === "All Platforms" && selectedPlatform === filter.name ? (
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        ) : filter.name === "All Platforms" ? (
                            <span className="material-symbols-outlined text-[16px] text-primary">close</span>
                        ) : filter.icon === "star" ? (
                            <span className="material-symbols-outlined text-[16px] text-yellow-500">{filter.icon}</span>
                        ) : filter.icon === "trending_down" ? (
                            <span className="material-symbols-outlined text-[16px] text-red-400">{filter.icon}</span>
                        ) : filter.name === "Meta Ads" ? (
                            <span className="material-symbols-outlined text-[16px] text-blue-500">public</span>
                        ) : filter.name === "Google Ads" ? (
                            <span className="material-symbols-outlined text-[16px] text-red-500">smart_display</span>
                        ) : (
                            <span className="material-symbols-outlined text-[16px]">{filter.icon}</span>
                        )}
                        {filter.name}
                    </button>
                ))}
            </div>

            {/* Comparison View */}
            {isComparisonVisible && compareA && compareB && (
                <div className="bg-white dark:bg-card border border-primary/30 rounded-2xl overflow-hidden relative shadow-2xl shadow-primary/5 z-10 animate-in fade-in slide-in-from-top-4 duration-500 shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <span className="material-symbols-outlined">leaderboard</span>
                            Comparison View
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="text-primary tracking-widest uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>ACTIVE</span>
                            <button onClick={() => setIsComparisonVisible(false)} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col lg:flex-row items-stretch justify-center gap-6">
                        {/* Creative A */}
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-full shadow-sm dark:shadow-lg w-full lg:flex-1 lg:max-w-[45%]">
                            <div className="relative h-auto min-h-[250px] aspect-[4/3] w-full bg-slate-100 dark:bg-black/40 flex items-center justify-center border-b border-slate-200 dark:border-white/5">
                                {compareA.creativeUrl ? (
                                    <Image src={compareA.creativeUrl} alt="Creative A" fill className="object-contain" />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-slate-600">image</span>
                                )}
                                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-white flex items-center gap-1 border border-white/10 z-10">
                                    <span className={cn("material-symbols-outlined text-[12px]", compareA.platform === "Meta" ? "text-blue-400" : "text-red-400")}>
                                        {compareA.platform === "Meta" ? "public" : "smart_display"}
                                    </span>
                                    {compareA.platform}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-black/90 via-black/10 dark:via-black/20 to-transparent flex flex-col justify-end p-5 z-0">
                                    <h3 className="text-white font-bold text-lg truncate drop-shadow-md">{compareA.fileName || "Creative A"}</h3>
                                    <p className="text-slate-300 text-xs drop-shadow-md">{new Date(compareA.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="p-5 flex-col flex gap-4 bg-white dark:bg-surface-dark flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">Overall Score</span>
                                    <span className={cn("font-bold text-xl", getScore(compareA) >= 80 ? "text-primary" : getScore(compareA) >= 60 ? "text-yellow-500" : "text-red-400")}>{getScore(compareA)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div className={cn("h-1.5 rounded-full", getScore(compareA) >= 80 ? "bg-primary" : getScore(compareA) >= 60 ? "bg-yellow-500" : "bg-red-400")} style={{ width: `${getScore(compareA)}%` }}></div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 flex-1 border border-slate-200 dark:border-white/5 text-center">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Conversion</span>
                                        <span className="text-slate-900 dark:text-white font-bold">{compareA.conversionRate}%</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 flex-1 border border-slate-200 dark:border-white/5 text-center">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Engagement</span>
                                        <span className="text-slate-900 dark:text-white font-bold">{compareA.engagementRate}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle AI Insights */}
                        <div className="flex flex-col items-center gap-4 px-4 py-8 relative shrink-0 w-full lg:w-auto self-center">
                            <div className="text-center mb-2">
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg tracking-wide">AI Insights</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Head-to-head analysis</p>
                            </div>

                            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg ring-4 ring-white dark:ring-background z-10 shadow-[0_0_15px_rgba(24,119,242,0.2)]">
                                VS
                            </div>

                            <div className="w-full max-w-sm flex flex-col gap-3 mt-2">
                                {/* Insight 1 (Winner) */}
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm">
                                    <span className="material-symbols-outlined text-primary shrink-0">military_tech</span>
                                    <div>
                                        <span className="text-slate-900 dark:text-slate-200 font-semibold block mb-1">Overall Winner: Creative {getScore(compareA) >= getScore(compareB) ? "A" : "B"}</span>
                                        <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                                            Creative {getScore(compareA) >= getScore(compareB) ? "A" : "B"} outperforms with a {(Math.abs(getScore(compareA) - getScore(compareB)))}% higher index score, driven by {compareA.conversionRate !== compareB.conversionRate ? "conversion rates" : "engagement metrics"}.
                                        </span>
                                    </div>
                                </div>

                                {/* Insight 2 (Engagement) */}
                                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex gap-3 text-sm">
                                    <span className="material-symbols-outlined text-yellow-500 shrink-0">bolt</span>
                                    <div>
                                        <span className="text-slate-900 dark:text-slate-200 font-semibold block mb-1">Engagement Hook</span>
                                        <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                                            Creative {compareA.engagementRate >= compareB.engagementRate ? "A" : "B"} maintains {(Math.abs(compareA.engagementRate - compareB.engagementRate))}% stronger audience retention.
                                        </span>
                                    </div>
                                </div>

                                <button onClick={() => router.push(`/reports?id=${getScore(compareA) >= getScore(compareB) ? compareA.id : compareB.id}`)} className="w-full py-3 mt-2 rounded-lg bg-primary hover:bg-primary-hover border border-primary/50 text-white dark:text-black text-sm font-bold shadow-lg shadow-primary/20 dark:shadow-[0_0_15px_rgba(0,180,50,0.2)] transition-all active:scale-[0.98]">
                                    Open Better Report
                                </button>
                            </div>
                        </div>

                        {/* Creative B */}
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-full shadow-sm dark:shadow-lg w-full lg:flex-1 lg:max-w-[45%]">
                            <div className="relative h-auto min-h-[250px] aspect-[4/3] w-full bg-slate-100 dark:bg-black/40 flex items-center justify-center border-b border-slate-200 dark:border-white/5">
                                {compareB.creativeUrl ? (
                                    <Image src={compareB.creativeUrl} alt="Creative B" fill className="object-contain" />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-slate-600">image</span>
                                )}
                                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-white flex items-center gap-1 border border-white/10 z-10">
                                    <span className={cn("material-symbols-outlined text-[12px]", compareB.platform === "Meta" ? "text-blue-400" : "text-red-400")}>
                                        {compareB.platform === "Meta" ? "public" : "smart_display"}
                                    </span>
                                    {compareB.platform}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-black/90 via-black/10 dark:via-black/20 to-transparent flex flex-col justify-end p-5 z-0">
                                    <h3 className="text-white font-bold text-lg truncate drop-shadow-md">{compareB.fileName || "Creative B"}</h3>
                                    <p className="text-slate-300 text-xs drop-shadow-md">{new Date(compareB.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="p-5 flex-col flex gap-4 bg-white dark:bg-surface-dark flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">Overall Score</span>
                                    <span className={cn("font-bold text-xl", getScore(compareB) >= 80 ? "text-primary" : getScore(compareB) >= 60 ? "text-yellow-500" : "text-red-400")}>{getScore(compareB)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                                    <div className={cn("h-1.5", getScore(compareB) >= 80 ? "bg-primary" : getScore(compareB) >= 60 ? "bg-yellow-500" : "bg-red-400")} style={{ width: `${getScore(compareB)}%` }}></div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 flex-1 border border-slate-200 dark:border-white/5 text-center">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Conversion</span>
                                        <span className="text-slate-900 dark:text-white font-bold">{compareB.conversionRate}%</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 flex-1 border border-slate-200 dark:border-white/5 text-center">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Engagement</span>
                                        <span className="text-slate-900 dark:text-white font-bold">{compareB.engagementRate}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Empty State */}
            {history.length === 0 && (
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-16 text-center shadow-sm dark:shadow-xl relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6 ring-1 ring-slate-200 dark:ring-white/10 shadow-inner">
                        <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">history_toggle_off</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No audits yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">You haven't run any AI creative analyses on this device yet. Start your first audit from the dashboard to see history here.</p>
                    <button onClick={() => router.push("/")} className="bg-primary hover:bg-primary-hover text-white dark:text-black font-bold py-3 px-8 rounded-lg transition-transform active:scale-95 shadow-lg shadow-primary/20">
                        Start New Audit
                    </button>
                </div>
            )}

            {/* Recent Analysis Grid */}
            {history.length > 0 && (
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        Recent Analysis
                        <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{filteredHistory.length}</span>
                    </h3>

                    {filteredHistory.length === 0 ? (
                        <div className="text-slate-500 dark:text-slate-400 text-sm py-8 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5">
                            No results match your selected filter "{selectedPlatform}".
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredHistory.map((item) => {
                                const isSelected = selectedAudits.includes(item.id);
                                const score = getScore(item);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => router.push(`/reports?id=${item.id}`)}
                                        className={cn(
                                            "bg-white dark:bg-surface-dark border rounded-xl overflow-hidden shadow-sm dark:shadow-lg group transition-all flex flex-col cursor-pointer hover:-translate-y-1 relative",
                                            isSelected ? "border-primary ring-1 ring-primary shadow-md shadow-primary/20" : "border-slate-200 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/20"
                                        )}
                                    >
                                        {/* Selection Checkbox Overlay */}
                                        <div
                                            onClick={(e) => toggleSelection(e, item.id)}
                                            className={cn(
                                                "absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm border flex items-center justify-center cursor-pointer transition-all hover:scale-105",
                                                isSelected ? "bg-primary border-primary text-black shadow-lg shadow-primary/30" : "border-white/30 text-transparent hover:border-white/60 hover:bg-black/60 opacity-0 group-hover:opacity-100"
                                            )}
                                            title="Select for comparison"
                                        >
                                            <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                                        </div>

                                        {/* Image Header */}
                                        <div className="relative h-48 w-full bg-slate-100 dark:bg-black/40 flex items-center justify-center border-b border-slate-200 dark:border-white/5">
                                            {item.creativeUrl ? (
                                                <Image
                                                    src={item.creativeUrl}
                                                    alt={item.fileName || "Ad"}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-700">image</span>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-surface-dark via-transparent to-transparent z-0"></div>

                                            {/* Platform Badge */}
                                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-white/10 z-10">
                                                {item.platform === "Meta" ? (
                                                    <>
                                                        <span className="material-symbols-outlined text-[14px] text-blue-400">public</span>
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Meta</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[14px] text-red-400">smart_display</span>
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Google</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Score Badge Overlay */}
                                            <div className={cn(
                                                "absolute bottom-0 right-0 px-3.5 py-1.5 font-black text-sm rounded-tl-xl backdrop-blur-md shadow-lg z-10",
                                                score >= 80 ? "bg-primary text-black" : score >= 60 ? "bg-yellow-500 text-black" : "bg-red-500 text-white"
                                            )}>
                                                {score}%
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-4 flex flex-col flex-1 relative z-10">
                                            <h4 className="text-slate-900 dark:text-white font-bold text-base leading-tight mb-1 truncate" title={item.fileName}>{item.fileName || "Ad Creative"}</h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-4 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                {new Date(item.timestamp).toLocaleString()}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between text-xs font-medium border-t border-slate-200 dark:border-white/5 pt-3">
                                                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-md">
                                                    <span className={cn("w-1.5 h-1.5 rounded-full inline-block", item.isApproved ? "bg-green-400" : "bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)]")}></span>
                                                    {item.isApproved ? "Approved" : "Review"}
                                                </span>
                                                <span className="text-primary hover:text-primary-hover uppercase tracking-widest font-bold flex items-center gap-1 transition-colors group-hover:translate-x-1 duration-300">
                                                    DETAILS
                                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

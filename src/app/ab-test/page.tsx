"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn, optimizeImage } from "@/lib/utils";
import { trackEvent } from "@/lib/activity-tracker";
import MissingKeyModal from "@/components/MissingKeyModal";

interface ABTestResult {
    winner: "A" | "B";
    scoreA: number;
    scoreB: number;
    reasoning: string;
    metrics: { factor: string; winner: "A" | "B" | "Tie" }[];
}

export default function ABTest() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ABTestResult | null>(null);
    const [showMissingKey, setShowMissingKey] = useState(false);

    const [imageA, setImageA] = useState<string | null>(null);
    const [fileA, setFileA] = useState<File | null>(null);

    const [imageB, setImageB] = useState<string | null>(null);
    const [fileB, setFileB] = useState<File | null>(null);

    const [audienceContext, setAudienceContext] = useState("");

    const inputARef = useRef<HTMLInputElement>(null);
    const inputBRef = useRef<HTMLInputElement>(null);

    const handleSetupFile = async (file: File, isA: boolean) => {
        const processed = await optimizeImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            if (isA) {
                setFileA(processed);
                setImageA(e.target?.result as string);
            } else {
                setFileB(processed);
                setImageB(e.target?.result as string);
            }
        };
        reader.readAsDataURL(processed);
    };

    const clearA = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImageA(null);
        setFileA(null);
        if (inputARef.current) inputARef.current.value = "";
    };

    const clearB = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImageB(null);
        setFileB(null);
        if (inputBRef.current) inputBRef.current.value = "";
    };

    const runComparison = async () => {
        if (!imageA || !imageB) return;

        // Gate behind API key check
        const apiKey = localStorage.getItem("gemini_api_key");
        if (!apiKey) {
            setShowMissingKey(true);
            return;
        }

        setLoading(true);
        setData(null);

        try {
            const customKey = apiKey;

            const res = await fetch("/api/ab-test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(customKey && { "Authorization": `Bearer ${customKey}` })
                },
                body: JSON.stringify({
                    imageA,
                    imageB,
                    audienceContext
                }),
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const result = await res.json();
            setData(result);
            trackEvent('ab_test', { winner: result.winner });
        } catch (error: any) {
            console.error(error);
            alert("A/B Test failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex xl:h-screen bg-white dark:bg-background text-slate-900 dark:text-slate-200 overflow-hidden font-sans flex-col xl:flex-row">
            <MissingKeyModal isOpen={showMissingKey} onClose={() => setShowMissingKey(false)} />
            <main className="flex-1 overflow-y-auto relative p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-7xl mx-auto z-10 flex flex-col gap-6 md:gap-8">
                {/* Decorative Gradients */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Predictive A/B Testing</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl">
                            Upload two variations of a creative. Our AI will analyze visual hierarchy, hook strength, and psychological appeal to determine the projected winner before you spend a dime.
                        </p>
                    </div>
                </div>

                {/* Form Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

                    {/* Creative A Column */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl flex flex-col gap-4 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-slate-900 dark:text-white">
                            <span className="text-8xl font-black font-mono">A</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-500 flex items-center justify-center text-xs border border-blue-200 dark:border-blue-500/30">A</span>
                            Creative Variation 1
                        </h3>

                        <div
                            className={cn(
                                "relative flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 px-6 py-12 transition-all hover:bg-slate-100 dark:hover:bg-white/5 hover:border-blue-400 dark:hover:border-blue-500/50 overflow-hidden mt-2 cursor-pointer h-64",
                                imageA ? "p-0 border-blue-400 dark:border-blue-500/50" : ""
                            )}
                            onClick={() => !imageA && inputARef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) handleSetupFile(e.dataTransfer.files[0], true);
                            }}
                        >
                            {imageA ? (
                                <>
                                    <Image src={imageA} alt="Preview A" fill className="object-cover opacity-80" />
                                    <button onClick={clearA} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-md transition-colors z-10">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </>
                            ) : (
                                <div className="text-center group pointer-events-none">
                                    <div className="mb-4 rounded-full bg-white/5 p-4 inline-block group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-slate-400">add_photo_alternate</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">Click to upload Version A</p>
                                </div>
                            )}
                            <input type="file" ref={inputARef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleSetupFile(e.target.files[0], true)} />
                        </div>
                    </div>

                    {/* Creative B Column */}
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl flex flex-col gap-4 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-slate-900 dark:text-white">
                            <span className="text-8xl font-black font-mono">B</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-500 flex items-center justify-center text-xs border border-purple-200 dark:border-purple-500/30">B</span>
                            Creative Variation 2
                        </h3>

                        <div
                            className={cn(
                                "relative flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 px-6 py-12 transition-all hover:bg-slate-100 dark:hover:bg-white/5 hover:border-purple-400 dark:hover:border-purple-500/50 overflow-hidden mt-2 cursor-pointer h-64",
                                imageB ? "p-0 border-purple-400 dark:border-purple-500/50" : ""
                            )}
                            onClick={() => !imageB && inputBRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) handleSetupFile(e.dataTransfer.files[0], false);
                            }}
                        >
                            {imageB ? (
                                <>
                                    <Image src={imageB} alt="Preview B" fill className="object-cover opacity-80" />
                                    <button onClick={clearB} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-md transition-colors z-10">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </>
                            ) : (
                                <div className="text-center group pointer-events-none">
                                    <div className="mb-4 rounded-full bg-slate-200 dark:bg-white/5 p-4 inline-block group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">add_photo_alternate</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Click to upload Version B</p>
                                </div>
                            )}
                            <input type="file" ref={inputBRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleSetupFile(e.target.files[0], false)} />
                        </div>
                    </div>

                </div>

                {/* Context & Actions */}
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl relative z-10 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full relative">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Context / Target Audience <span className="text-slate-400 dark:text-slate-600 normal-case">(Optional)</span></label>
                        <div className="absolute left-3 bottom-[11px] text-slate-400 dark:text-slate-500 pointer-events-none">
                            <span className="material-symbols-outlined text-[20px]">group</span>
                        </div>
                        <input
                            type="text"
                            placeholder="e.g. Millenials interested in local fitness classes..."
                            value={audienceContext}
                            onChange={(e) => setAudienceContext(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg py-3 pr-4 pl-10 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors text-sm"
                        />
                    </div>

                    <button
                        onClick={runComparison}
                        disabled={loading || !imageA || !imageB}
                        className="w-full md:w-auto mt-6 md:mt-6 bg-primary hover:bg-primary-hover disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3 px-8 rounded-lg transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(24,119,242,0.3)] whitespace-nowrap"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                        ) : (
                            <span className="material-symbols-outlined">compare</span>
                        )}
                        {loading ? "Analyzing Battle..." : "Predict Winner"}
                    </button>
                </div>

                {/* Results Section */}
                {data && !loading && (
                    <div className="bg-emerald-50 dark:bg-[#111827] border border-emerald-500/30 rounded-xl p-6 shadow-sm dark:shadow-xl relative z-10 animate-in slide-in-from-bottom-4 zoom-in-95 duration-500">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white dark:text-black font-black uppercase tracking-widest text-xs px-6 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            Prediction Complete
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">

                            {/* Winner Display Area */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white dark:bg-black/20 rounded-xl border border-emerald-200 dark:border-white/5">
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Projected Winner</span>
                                <div className={cn(
                                    "w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 font-black shadow-[0_0_30px_rgba(16,185,129,0.2)]",
                                    data.winner === "A" ? "bg-blue-500/10 text-blue-500 border-blue-500" : "bg-purple-500/10 text-purple-500 border-purple-500"
                                )}>
                                    {data.winner}
                                </div>
                                <p className="mt-4 text-emerald-400 text-sm font-medium flex gap-2 items-center">
                                    <span className="material-symbols-outlined text-[18px]">verified</span> Preferred by AI
                                </p>
                            </div>

                            {/* Breakdown Area */}
                            <div className="md:col-span-8 flex flex-col justify-center">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Strategic Reasoning</h4>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base mb-8">
                                    {data.reasoning}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-black/20 rounded-lg p-4 border border-slate-200 dark:border-white/5">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Variant A Score</span>
                                        <div className="flex items-end gap-2">
                                            <span className={cn("text-3xl font-black font-mono leading-none", data.winner === "A" ? "text-emerald-500" : "text-slate-800 dark:text-white")}>{data.scoreA}</span>
                                            <span className="text-slate-500 text-sm mb-0.5">/100</span>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-black/20 rounded-lg p-4 border border-slate-200 dark:border-white/5">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Variant B Score</span>
                                        <div className="flex items-end gap-2">
                                            <span className={cn("text-3xl font-black font-mono leading-none", data.winner === "B" ? "text-emerald-500" : "text-slate-800 dark:text-white")}>{data.scoreB}</span>
                                            <span className="text-slate-500 text-sm mb-0.5">/100</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">Key Factors Battle</h4>
                                    <div className="space-y-2">
                                        {data.metrics.map((metric, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-white/5 rounded-md border border-slate-100 dark:border-transparent">
                                                <span className="text-slate-700 dark:text-slate-300">{metric.factor}</span>
                                                <span className={cn(
                                                    "font-bold uppercase text-[10px] px-2 py-0.5 rounded",
                                                    metric.winner === "A" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                                                        metric.winner === "B" ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400" : "bg-slate-100 dark:bg-slate-500/20 text-slate-500 dark:text-slate-400"
                                                )}>
                                                    {metric.winner === "Tie" ? "Tie" : `Winner: ${metric.winner}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

"use client";

import { useState, useRef } from "react";
import { CheckCircle2, AlertCircle, TrendingUp, Search, UploadCloud, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Mock Data Types
type Recommendation = {
    id: string;
    title: string;
    description: string;
    points: number;
    type: "warning" | "error" | "best_practice";
    understood?: boolean;
};

// Wizard Steps
type WizardStep = "upload" | "questions" | "results";

export default function OpportunityScoreSimulator() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Wizard State
    const [step, setStep] = useState<WizardStep>("upload");
    const [isUploading, setIsUploading] = useState(false);
    const [fileError, setFileError] = useState("");
    const [uploadedFileURL, setUploadedFileURL] = useState<string | null>(null);

    // Question State
    const [answers, setAnswers] = useState({
        fragmented: false,
        advantagePlus: false,
        textOptions: 1
    });

    // Results State
    const [score, setScore] = useState(0);
    const [activeRecommendations, setActiveRecommendations] = useState<Recommendation[]>([]);
    const [dismissedRecommendations, setDismissedRecommendations] = useState<Recommendation[]>([]);
    const [activeTab, setActiveTab] = useState<"active" | "dismissed">("active");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Frontend 30MB check
        if (file.size > 30 * 1024 * 1024) {
            setFileError("File exceeds 30MB limit. Please upload a smaller creative.");
            return;
        }
        setFileError("");
        setIsUploading(true);

        const formData = new FormData();
        formData.append("creative", file);

        try {
            const res = await fetch("/api/opportunity-score/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setUploadedFileURL(data.url);
                setStep("questions");
            } else {
                setFileError(data.error || "Upload failed");
            }
        } catch (error) {
            setFileError("An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSimulatorSubmit = async () => {
        // Calculate dummy score and recommendations based on answers
        let newScore = 100;
        const newRecs: Recommendation[] = [];

        if (answers.fragmented) {
            newScore -= 35;
            newRecs.push({
                id: "1",
                title: "Fix audience fragmentation",
                description: "Combine highly overlapping ad sets to improve delivery and optimize your budget more effectively across campaigns.",
                points: 35,
                type: "error"
            });
        }
        if (!answers.advantagePlus) {
            newScore -= 5;
            newRecs.push({
                id: "2",
                title: "Use Advantage+ placements",
                description: "Allow our delivery system to allocate your ad set's budget across multiple placements based on where they're likely to perform best.",
                points: 5,
                type: "best_practice"
            });
        }
        if (answers.textOptions < 2) {
            newScore -= 10;
            newRecs.push({
                id: "3",
                title: "Add multiple text options",
                description: "Provide at least two primary text options to let our system optimize delivery for different people.",
                points: 10,
                type: "warning"
            });
        }

        // Just add a generic creative recommendation since they uploaded a file
        if (uploadedFileURL) {
            newScore -= 5;
            newRecs.push({
                id: "creative",
                title: "Refresh Creative Aspect Ratio",
                description: "Ensure your creative conforms to 4:5 for mobile feeds to maximize screen real estate.",
                points: 5,
                type: "best_practice"
            })
        }

        setScore(Math.max(0, newScore));
        setActiveRecommendations(newRecs);
        setStep("results");

        // Save to History (mock api call)
        try {
            await fetch("/api/activity/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    component_name: "Opportunity Score Simulator",
                    action_type: "simulator_run",
                    details: {
                        score: Math.max(0, newScore),
                        recommendations_count: newRecs.length,
                        url: uploadedFileURL
                    }
                })
            });
        } catch (e) {
            console.error("Failed to track activity");
        }
    };

    const handleUnderstood = (id: string) => {
        setActiveRecommendations(prev => prev.map(r =>
            r.id === id ? { ...r, understood: true } : r
        ));
    };

    const handleDismiss = (id: string) => {
        const rec = activeRecommendations.find(r => r.id === id);
        if (rec) {
            setDismissedRecommendations(prev => [...prev, rec]);
            setActiveRecommendations(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleRestore = (id: string) => {
        const rec = dismissedRecommendations.find(r => r.id === id);
        if (rec) {
            setActiveRecommendations(prev => [...prev, rec]);
            setDismissedRecommendations(prev => prev.filter(r => r.id !== id));
        }
    };

    // UI Helpers
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getScoreColor = (value: number) => {
        if (value >= 80) return "text-emerald-500";
        if (value >= 50) return "text-amber-500";
        return "text-red-500";
    };
    const getScoreBackground = (value: number) => {
        if (value >= 80) return "from-emerald-500/20 to-emerald-500/5";
        if (value >= 50) return "from-amber-500/20 to-amber-500/5";
        return "from-red-500/20 to-red-500/5";
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <TrendingUp size={16} />
                    <span>Ad Tools</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Opportunity Simulator</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
                    Evaluate your campaign settings and creative to see how optimized your ads are.
                </p>
            </div>

            {/* WIZARD: STEP 1 - UPLOAD */}
            {step === "upload" && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-card/50 transition-colors hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/5">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                        <UploadCloud size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Upload Creative</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
                        Select an image or video used in your campaign. <br />
                        <span className="text-xs opacity-75">(Max 30MB, securely stored up to 48 hours for analysis)</span>
                    </p>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        className="hidden"
                    />

                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                        >
                            {isUploading ? "Uploading Analysis..." : "Select File"}
                        </button>
                        {fileError && (
                            <div className="text-red-500 text-sm font-medium flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-md">
                                <AlertCircle size={14} /> {fileError}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* WIZARD: STEP 2 - QUESTIONS */}
            {step === "questions" && (
                <div className="flex flex-col gap-8 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Current Ad Settings</h2>
                            <p className="text-sm text-slate-500">Tell us a bit about how this campaign is configured.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 max-w-2xl">
                        {/* Q1 */}
                        <div className="flex flex-col gap-3">
                            <label className="font-semibold text-slate-900 dark:text-slate-100">Are you experiencing audience fragmentation across multiple ad sets?</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setAnswers({ ...answers, fragmented: true })}
                                    className={cn("px-6 py-3 rounded-xl border transition-all text-sm font-medium", answers.fragmented ? "bg-primary/10 border-primary text-primary" : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300")}
                                >Yes, multiple overlapping sets</button>
                                <button
                                    onClick={() => setAnswers({ ...answers, fragmented: false })}
                                    className={cn("px-6 py-3 rounded-xl border transition-all text-sm font-medium", !answers.fragmented ? "bg-primary/10 border-primary text-primary" : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300")}
                                >No, audiences are consolidated</button>
                            </div>
                        </div>

                        {/* Q2 */}
                        <div className="flex flex-col gap-3">
                            <label className="font-semibold text-slate-900 dark:text-slate-100">Are you utilizing Advantage+ placements?</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setAnswers({ ...answers, advantagePlus: true })}
                                    className={cn("px-6 py-3 rounded-xl border transition-all text-sm font-medium", answers.advantagePlus ? "bg-primary/10 border-primary text-primary" : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300")}
                                >Yes</button>
                                <button
                                    onClick={() => setAnswers({ ...answers, advantagePlus: false })}
                                    className={cn("px-6 py-3 rounded-xl border transition-all text-sm font-medium", !answers.advantagePlus ? "bg-primary/10 border-primary text-primary" : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300")}
                                >No, I use manual placements</button>
                            </div>
                        </div>

                        {/* Q3 */}
                        <div className="flex flex-col gap-3">
                            <label className="font-semibold text-slate-900 dark:text-slate-100">How many primary text variants are in this ad?</label>
                            <input
                                type="number"
                                min={1}
                                max={5}
                                value={answers.textOptions}
                                onChange={(e) => setAnswers({ ...answers, textOptions: parseInt(e.target.value) || 1 })}
                                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white max-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                        <button onClick={() => setStep("upload")} className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                            Back
                        </button>
                        <button onClick={handleSimulatorSubmit} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-transform active:scale-95">
                            Generate Score <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* WIZARD: STEP 3 - RESULTS */}
            {step === "results" && (
                <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    {/* Main Score Card */}
                    <div className={cn(
                        "relative flex flex-col md:flex-row items-center gap-8 p-8 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm transition-colors duration-500",
                    )}>
                        <div className={cn(
                            "absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l opacity-50 dark:opacity-20 pointer-events-none transition-colors duration-500",
                            getScoreBackground(score)
                        )} />

                        <div className="relative flex shrink-0 items-center justify-center z-10">
                            <svg className="w-48 h-48 -rotate-90 transform">
                                <circle className="text-slate-100 dark:text-slate-800/50" strokeWidth="12" stroke="currentColor" fill="transparent" r={radius} cx="96" cy="96" />
                                <circle
                                    className={cn("transition-all duration-1000 ease-out", getScoreColor(score))}
                                    strokeWidth="12"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r={radius}
                                    cx="96"
                                    cy="96"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={cn("text-5xl font-bold tracking-tighter transition-colors duration-500", getScoreColor(score))}>
                                    {score}
                                </span>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 flex-1 z-10">
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                    <AlertCircle className="text-primary" size={20} />
                                    Analysis Complete
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                    Based on your current configuration and the uploaded creative, your campaign has room for optimization.
                                </p>
                                <button
                                    onClick={() => setStep("upload")}
                                    className="text-sm font-semibold text-primary hover:underline"
                                >
                                    Run another simulation
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations List */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recommendations</h2>
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                <button
                                    onClick={() => setActiveTab("active")}
                                    className={cn(
                                        "px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
                                        activeTab === "active" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Active ({activeRecommendations.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("dismissed")}
                                    className={cn(
                                        "px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
                                        activeTab === "dismissed" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Dismissed ({dismissedRecommendations.length})
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-h-[400px]">
                            {activeTab === "active" ? (
                                activeRecommendations.length > 0 ? (
                                    activeRecommendations.map((rec) => (
                                        <div key={rec.id} className="group relative overflow-hidden bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-primary transition-colors" />

                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                            {rec.title}
                                                        </h3>
                                                        <span className={cn(
                                                            "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                                            rec.type === "error" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" :
                                                                rec.type === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                                                                    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                        )}>
                                                            {rec.type === "error" ? "Error" : rec.type === "warning" ? "Warning" : "Best Practice"}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                                        {rec.description}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col items-end gap-4 shrink-0">
                                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                                                        <TrendingUp size={16} />
                                                        +{rec.points} Points
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDismiss(rec.id)}
                                                            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-transparent border border-transparent rounded-lg transition-colors"
                                                        >
                                                            Dismiss
                                                        </button>
                                                        <button
                                                            onClick={() => handleUnderstood(rec.id)}
                                                            className={cn(
                                                                "flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm w-[130px]",
                                                                rec.understood
                                                                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20"
                                                                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                                            )}
                                                        >
                                                            {rec.understood ? <><CheckCircle2 size={16} /> Understood</> : "Understand"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"><CheckCircle2 size={32} /></div>
                                        <h3 className="text-xl font-bold mb-2">Perfect Score!</h3>
                                    </div>
                                )
                            ) : (
                                dismissedRecommendations.map((rec) => (
                                    <div key={rec.id} className="group flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 dark:bg-card/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all opacity-80 hover:opacity-100">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 line-through decoration-slate-400/50 mb-1">{rec.title}</h3>
                                            <p className="text-slate-500 dark:text-slate-500 text-sm">{rec.description}</p>
                                        </div>
                                        <button onClick={() => handleRestore(rec.id)} className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:text-primary">Restore</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

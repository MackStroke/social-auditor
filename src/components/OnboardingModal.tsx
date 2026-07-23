"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { KeyRound, Sparkles, Layers, Target, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            // Ensure they are actually logged in before popping up guides
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cross-device sync: if the user has a key stored in their profile, hydrate localStorage
            const remoteKey = user.user_metadata?.gemini_api_key;
            if (remoteKey && !localStorage.getItem("gemini_api_key")) {
                localStorage.setItem("gemini_api_key", remoteKey);
            }

            // If they've already seen onboarding OR already have a key configured, skip
            const hasSeenOnboarding = localStorage.getItem("has_seen_onboarding");
            const hasKey = !!localStorage.getItem("gemini_api_key");

            if (!hasSeenOnboarding && !hasKey) {
                const timer = setTimeout(() => setIsOpen(true), 1500);
                return () => clearTimeout(timer);
            }
        };

        checkOnboardingStatus();
    }, []);


    const completeOnboarding = (navigateToSettings: boolean = false) => {
        localStorage.setItem("has_seen_onboarding", "true");
        setIsOpen(false);
        if (navigateToSettings) {
            router.push("/settings");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md"
                        onClick={() => completeOnboarding(false)}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-gradient-to-br dark:from-[#1A221E] dark:to-[#121815] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left Branding Panel */}
                        <div className="w-full md:w-2/5 flex flex-col items-center justify-center p-8 bg-blue-50/50 dark:bg-blue-900/10 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            <Logo className="scale-125 mb-6 relative z-10" />

                            <div className="text-center relative z-10">
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Welcome to your Auditor</h3>
                                <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed">
                                    The AI-powered creative sandbox built for modern performance marketers.
                                </p>
                            </div>
                        </div>

                        {/* Right Content Panel */}
                        <div className="w-full md:w-3/5 p-8 flex flex-col">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Let's get started.</h2>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8">Before you can run simulations, here is a quick overview of what you can do.</p>

                            <div className="space-y-6 flex-1">
                                <div className="flex gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white text-sm font-semibold mb-1">AI Creative Audits</h4>
                                        <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">Upload an ad and its copy. Our AI predicts conversion probabilities and suggests structural improvements instantly.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                                        <Target size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white text-sm font-semibold mb-1">Attention Heatmaps</h4>
                                        <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">Visual overlays predict exactly where human eyes will land first—ensuring your hook and brand presence are legible.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                                        <KeyRound size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white text-sm font-semibold mb-1">Bring Your Own Key (BYOK)</h4>
                                        <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">To use this service, you <strong className="text-slate-900 dark:text-zinc-200">must provide your own Google Gemini API key</strong>. We do NOT store it on our servers; it saves securely only in your browser's local storage.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col gap-3">
                                <button
                                    onClick={() => completeOnboarding(true)}
                                    className="w-full py-3.5 px-4 bg-primary hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                                >
                                    Setup my API Key <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => completeOnboarding(false)}
                                    className="w-full py-3 text-sm text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium transition-colors"
                                >
                                    Skip for now, I'll do it later
                                </button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

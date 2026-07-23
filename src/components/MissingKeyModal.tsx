"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { KeyRound, ExternalLink, ArrowRight, X } from "lucide-react";

interface MissingKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MissingKeyModal({ isOpen, onClose }: MissingKeyModalProps) {
    const router = useRouter();

    const goToSettings = () => {
        onClose();
        router.push("/settings");
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
                        onClick={onClose}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.45, bounce: 0.25 }}
                        className="relative w-full max-w-lg bg-white dark:bg-gradient-to-br dark:from-[#1C1A22] dark:to-[#0F0E14] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors p-1 z-10"
                        >
                            <X size={18} />
                        </button>

                        {/* Top Warning Strip */}
                        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-6 py-3">
                            <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-xl">warning</span>
                            <span className="text-amber-700 dark:text-amber-300 text-sm font-semibold">API Key Required</span>
                        </div>

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex gap-4 items-start mb-6">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                                    <KeyRound size={20} />
                                </div>
                                <div>
                                    <h2 className="text-slate-900 dark:text-white font-bold text-xl mb-1">Set Up Your API Key</h2>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        This feature requires a Google Gemini API key. You need to provide your own key — it's free to get and stored only in your browser.
                                    </p>
                                </div>
                            </div>

                            {/* Step-by-step Guide */}
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/5 mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">How to get your free API key</p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">1</div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white text-sm font-medium">Visit Google AI Studio</p>
                                            <a
                                                href="https://aistudio.google.com/apikey"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mt-0.5"
                                            >
                                                aistudio.google.com/apikey <ExternalLink size={11} />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">2</div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white text-sm font-medium">Sign in & Create a Key</p>
                                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">Click <strong className="text-slate-800 dark:text-slate-300">"Create API Key"</strong> and select any project (or create a new one).</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">3</div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white text-sm font-medium">Paste It in API Settings</p>
                                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">Copy the key starting with <code className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded text-[11px]">AIzaSy...</code> and paste it in the API Settings page.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={goToSettings}
                                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                                >
                                    Go to API Settings <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

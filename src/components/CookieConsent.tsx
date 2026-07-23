"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented or declined
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
        // Here you would typically initialize Google Analytics / AdSense scripts
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setIsVisible(false);
        // Do not initialize tracking scripts if declined
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pb-20 md:pb-6 pointer-events-none flex justify-center">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-5 md:p-6 max-w-4xl w-full pointer-events-auto flex flex-col md:flex-row gap-6 items-start md:items-center relative animate-in slide-in-from-bottom-5 fade-in duration-500">
                <button
                    onClick={handleDecline}
                    className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
                >
                    <X size={16} />
                </button>

                <div className="flex-1 flex gap-4 items-start">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 hidden sm:flex">
                        <Cookie size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                            <Cookie size={18} className="sm:hidden text-blue-500" />
                            We Value Your Privacy
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-6 md:pr-0">
                            We use cookies and similar technologies (including from third-party vendors like Google) to personalize content, serve targeted advertisements, provide social media features, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Privacy Policy</Link> for more information.
                        </p>
                    </div>
                </div>

                <div className="flex flex-row gap-3 w-full md:w-auto shrink-0 md:ml-4">
                    <button
                        onClick={handleDecline}
                        className="flex-1 md:flex-none px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors border border-transparent"
                    >
                        Decline Optional
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-500/20"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import Logo from "./Logo";
import { ArrowRight, BarChart3, TestTube2, Radar, Target, CheckCircle2, TrendingUp, Zap, Check, MessageSquare, Lightbulb, ShieldAlert, BadgeCheck, Heart, Users, Sparkles, Menu, X, ChevronUp } from "lucide-react";

export default function PublicLanding() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);

    // Auto-slide effect with requestAnimationFrame
    React.useEffect(() => {
        if (!scrollRef.current || isPaused || isDragging) return;

        let animationFrameId: number;
        let lastTimestamp = 0;
        const speed = 40; // Pixels per second

        const step = (timestamp: number) => {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const delta = (timestamp - lastTimestamp) / 1000;
            lastTimestamp = timestamp;

            if (scrollRef.current) {
                const scrollWidth = scrollRef.current.scrollWidth / 2; // Midpoint of duplicated content
                let nextScroll = scrollRef.current.scrollLeft + speed * delta;

                if (nextScroll >= scrollWidth) {
                    nextScroll = 0;
                }

                scrollRef.current.scrollLeft = nextScroll;
            }
            animationFrameId = requestAnimationFrame(step);
        };

        animationFrameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, isDragging]);

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
        setScrollLeft(scrollRef.current?.scrollLeft || 0);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
        setScrollLeft(scrollRef.current?.scrollLeft || 0);
    };

    const onMouseLeave = () => setIsDragging(false);
    const onMouseUp = () => setIsDragging(false);
    const onTouchEnd = () => setIsDragging(false);

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2;
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2;
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const scrollToTop = () => {
        rootRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div ref={rootRef} className="fixed inset-0 w-full h-full left-0 top-0 z-[60] overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#0B0F19] flex flex-col font-display selection:bg-blue-500/30 scroll-smooth">
            {/* Minimal Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0B0F19]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={scrollToTop} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Logo className="scale-90 origin-left" />
                    </button>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <Link
                            href="/"
                            className="text-sm font-semibold px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="#features"
                            className="text-sm font-semibold px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            href="/feature-request"
                            className="text-sm font-semibold px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Request Feature
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-semibold px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/auth"
                            className="text-sm font-semibold px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm shadow-blue-500/20"
                        >
                            Contact Us
                        </Link>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex md:hidden items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`fixed inset-0 top-16 z-40 bg-white dark:bg-[#0B0F19] md:hidden transition-all duration-300 ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
                    <nav className="flex flex-col p-6 gap-4">
                        <Link
                            href="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white shadow-sm"
                        >
                            Home
                        </Link>
                        <Link
                            href="#features"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white shadow-sm"
                        >
                            Features
                        </Link>
                        <Link
                            href="/feature-request"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white shadow-sm"
                        >
                            Request Feature
                        </Link>
                        <Link
                            href="/contact"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white shadow-sm"
                        >
                            Contact Us
                        </Link>
                        <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />
                        <Link
                            href="/auth"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white shadow-sm"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/auth"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-blue-600 text-white rounded-2xl text-center shadow-lg shadow-blue-500/20"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center w-full">

                {/* Hero Section */}
                <section className="relative w-full pt-20 pb-32 md:pt-32 md:pb-40 px-4 text-center max-w-7xl mx-auto flex flex-col items-center overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-8 border border-blue-100 dark:border-blue-500/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Target size={14} /> The Ultimate Tool for Digital Marketers
                    </div>
                    <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 max-w-4xl">
                        Optimize Your Ad Campaigns with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">Data-Driven Precision</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Social Auditor is a comprehensive intelligence platform designed to help digital marketers seamlessly analyze, simulate, and improve their advertising creatives across all networks.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mb-16 md:mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        <Link
                            href="/auth"
                            className="group w-full md:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-xl transition-all hover:scale-[1.02] shadow-xl shadow-blue-500/25"
                        >
                            Start Auditing Now
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="#features"
                            className="group w-full md:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-base font-bold rounded-xl transition-all"
                        >
                            Explore Features
                        </Link>
                    </div>

                    {/* Hero Dashboard Mockup */}
                    <div className="relative w-full max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-[#0B0F19] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                        {/* Mockup macOS Window Header */}
                        <div className="w-full h-10 md:h-12 bg-slate-100 dark:bg-[#1F2937] border-b border-slate-200 dark:border-white/5 flex items-center px-4 gap-2 shrink-0">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400/80" />
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-400/80" />
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-400/80" />
                        </div>
                        {/* Mockup Body with Actual Image */}
                        <div className="w-full bg-[#0B0F19] flex justify-center items-start overflow-hidden overflow-x-auto relative">
                            <div className="min-w-[800px] w-full">
                                <img
                                    src="/dashboard.png"
                                    alt="Social Auditor Dashboard"
                                    className="w-full h-auto object-cover object-top hover:scale-[1.02] transition-transform duration-[2s] ease-out pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Alternating Feature Layout */}
                <section id="features" className="w-full bg-white dark:bg-[#111827] py-24 md:py-32 px-4 border-y border-slate-200 dark:border-white/5">
                    <div className="max-w-7xl mx-auto space-y-32">

                        {/* Feature 1: Campaign Simulator */}
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <div className="flex-1 space-y-6">
                                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <BarChart3 size={24} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                    Forecast Returns with Campaign Simulator
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                    The Campaign Simulator allows media buyers to forecast expected returns on ad spend (ROAS) before deploying budgets to live networks like Google Ads or Meta Ads. By inputting estimated CPMs, expected conversion rates, and average order values (AOV), marketers can identify realistic break-even points.
                                </p>
                                <ul className="space-y-3 pt-4">
                                    {["Predict break-even metrics", "Visualize funnel performance", "Set expectations with clients"].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400"><Check size={12} strokeWidth={3} /></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="w-full lg:flex-1 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent blur-3xl rounded-full" />
                                <div className="relative bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 h-[320px] md:h-[400px] flex flex-col justify-between overflow-hidden">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Estimated ROAS</div>
                                            <div className="text-4xl font-bold text-slate-900 dark:text-white">3.4x</div>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-lg">+12%</div>
                                    </div>
                                    <div className="flex-1 flex items-end gap-2">
                                        {[10, 20, 15, 40, 35, 60, 50, 80, 75, 95].map((h, i) => (
                                            <div key={i} className="flex-1 bg-purple-500 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.2 + (i / 10) * 0.8 }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: A/B Testing */}
                        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
                            <div className="flex-1 space-y-6">
                                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                    <TestTube2 size={24} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                    Rigorous A/B Testing Analysis
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Effective creative testing is the heartbeat of modern advertising. Our A/B Testing module provides structured frameworks for isolating variables such as ad creative, primary text, headlines, and calls-to-action (CTAs).
                                </p>
                                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Apply statistical analysis to your split tests to avoid false positives and confidently scale winning ad variations while swiftly killing underperforming assets.
                                </p>
                            </div>

                            <div className="w-full lg:flex-1 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent blur-3xl rounded-full" />
                                <div className="relative bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 h-auto min-h-[320px] md:h-[400px] flex flex-col gap-4 overflow-hidden">
                                    {/* Variation A */}
                                    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-500">V1</div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">Control Creative</div>
                                                <div className="text-sm text-slate-500">CTR: 1.2%</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Variation B */}
                                    <div className="p-4 rounded-xl border-2 border-orange-500 bg-orange-50 dark:bg-orange-500/10 flex items-center justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">Winner</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-orange-500">V2</div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">Test Creative B</div>
                                                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">CTR: 2.8%</div>
                                            </div>
                                        </div>
                                        <TrendingUp className="text-orange-500" />
                                    </div>
                                    <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center text-sm text-slate-600 dark:text-slate-400">
                                        98% Statistical Significance Reached
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Opportunity Score */}
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <div className="flex-1 space-y-6">
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <Radar size={24} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                    Pre-Flight Opportunity Scoring
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Upload your pending ad creatives to our Opportunity Score analyzer before they go live. Our AI-driven heuristic model scans your images and video thumbnails for contrast, text density, and emotional resonance.
                                </p>
                                <ul className="space-y-3 pt-4">
                                    {["Scan visual contrast", "Check text density limits", "Emotional resonance scoring"].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Check size={12} strokeWidth={3} /></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="w-full lg:flex-1 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl rounded-full" />
                                <div className="relative bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 h-auto min-h-[340px] md:h-[400px] flex flex-col items-center justify-center text-center overflow-hidden">
                                    {/* Mock Radial Score */}
                                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 sm:mb-8 shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800 sm:hidden" />
                                            <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="465" strokeDashoffset="46.5" strokeLinecap="round" className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out sm:hidden" />

                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800 hidden sm:block" />
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="553" strokeDashoffset="55" strokeLinecap="round" className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out hidden sm:block" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">A+</div>
                                            <div className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">92 / 100</div>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs sm:text-sm font-semibold border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                                        <Zap size={14} className="fill-emerald-500 sm:w-4 sm:h-4" /> Excellent Potential View Rate
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Educational Content / Chips */}
                <section className="w-full bg-slate-50 dark:bg-[#0B0F19] py-24 md:py-32 px-4 border-t border-slate-200 dark:border-white/5 relative overflow-hidden">
                    {/* Background glow for cards section */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                                The Importance of Systematic Ad Auditing
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Stop relying on gut feelings. Understand exactly how algorithmic platforms evaluate your creatives before spending a dime.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            {/* Card 1 */}
                            <div className="bg-white dark:bg-[#1F2937] p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg hover:-translate-y-2 transition-transform duration-300 group">
                                <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Target size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Algorithmic Distribution</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Platforms like Facebook, Instagram, LinkedIn, and TikTok heavily rely on machine learning to distribute content based on initial user engagement rates.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white dark:bg-[#1F2937] p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg hover:-translate-y-2 transition-transform duration-300 group delay-100">
                                <div className="w-14 h-14 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldAlert size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">The Cost of Inaction</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    If an ad creative fails to capture immediate attention, platforms penalize it with higher costs per mille (CPM) and severely restricted reach.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white dark:bg-[#1F2937] p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg hover:-translate-y-2 transition-transform duration-300 group delay-200">
                                <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                    <BadgeCheck size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Diagnostic Toolset</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Leverage standardized evaluation criteria to ensure your assets adhere to proven direct-response principles for higher relevance and healthier ROI.
                                </p>
                            </div>
                        </div>

                        {/* Extra Links block */}
                        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Link
                                href="/feature-request"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all hover:-translate-y-1 shadow-sm"
                            >
                                <Lightbulb size={20} className="text-amber-500" />
                                Request a Feature
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all hover:-translate-y-1 shadow-sm"
                            >
                                <MessageSquare size={20} className="text-blue-500" />
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Use Cases Slider Section */}
                <section className="w-full py-24 bg-white dark:bg-[#111827] overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                            Tailored for <span className="text-blue-600 italic">Every Ad Team.</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Whether you're a solopreneur or a high-growth agency, Social Auditor provides the insights you need to win.
                        </p>
                    </div>

                    <div className="relative group px-4">
                        <div
                            ref={scrollRef}
                            onMouseDown={onMouseDown}
                            onMouseLeave={() => {
                                onMouseLeave();
                                setIsPaused(false);
                            }}
                            onMouseUp={onMouseUp}
                            onMouseMove={onMouseMove}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            onMouseEnter={() => setIsPaused(true)}
                            className="flex overflow-x-auto gap-6 pb-8 cursor-grab active:cursor-grabbing scrollbar-hide scroll-auto"
                        >
                            {[...Array(2)].map((_, i) => (
                                <React.Fragment key={i}>
                                    {[
                                        { title: "D2C Brands", desc: "Lower CAC by identifying winning patterns early.", icon: <Sparkles className="text-amber-500" /> },
                                        { title: "Ad Agencies", desc: "Improve client reporting with objective data.", icon: <BarChart3 className="text-blue-500" /> },
                                        { title: "Media Buyers", desc: "Scientific approach to creative testing scaling.", icon: <Target className="text-red-500" /> },
                                        { title: "Creative Directors", desc: "Bridge the gap between art and performance.", icon: <Zap className="text-yellow-500" /> },
                                        { title: "SaaS Startups", desc: "Optimize high-intent funnel traffic creatives.", icon: <Users className="text-purple-500" /> },
                                        { title: "Affiliate Marketers", desc: "Max out ROI on tight testing budgets.", icon: <TrendingUp className="text-emerald-500" /> },
                                    ].map((item, idx) => (
                                        <div key={`${i}-${idx}`} className="shrink-0 w-72 h-44 bg-slate-50 dark:bg-[#1F2937] p-6 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-[#2D3748] transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-[#0B0F19] rounded-lg shadow-sm border border-slate-100 dark:border-white/5">
                                                    {item.icon}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-normal leading-relaxed pointer-events-none">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Donate Highlight Section */}
                <section className="w-full bg-slate-50 dark:bg-[#0B0F19] py-32 px-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0,rgba(239,68,68,0.07),transparent_50%)]" />

                    <div className="max-w-4xl mx-auto relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full font-black text-xs uppercase tracking-widest mb-10 shadow-sm border border-red-100 dark:border-red-500/20 animate-pulse">
                            <Heart size={14} className="fill-current" /> Support the Vision
                        </div>

                        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight">
                            Free forever. Powered by <span className="text-red-500 relative inline-block">you.<div className="absolute -bottom-2 left-0 w-full h-1.5 bg-red-500/20 rounded-full blur-[2px]" /></span>
                        </h2>

                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Social Auditor is an open-source initiative by Mackstroke Labs. We don't charge subscription fees. If this tool saves you money, consider supporting our development.
                        </p>

                        <Link
                            href="/donate"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-900 dark:text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl border border-slate-200 dark:border-white/20 active:scale-95 group"
                        >
                            Support Social Auditor
                            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="w-full py-24 bg-white dark:bg-[#111827] px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                                Frequently Asked <span className="text-blue-600 italic">Questions</span>
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                Everything you need to know about Social Auditor.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {[
                                { q: "What is Social Auditor?", a: "Social Auditor is a comprehensive intelligence platform designed to help digital marketers analyze, simulate, and improve their advertising creatives through data-driven insights." },
                                { q: "How does it help me save money?", a: "By identifying winning patterns and potential pitfalls before you spend on ads, Social Auditor helps lower your CAC (Customer Acquisition Cost) and maximizes your ROI." },
                                { q: "Is my data secure?", a: "Absolutely. We prioritize your privacy and use secure, encrypted storage for all your creative assets and analysis results." },
                                { q: "Do I need a subscription?", a: "Currently, Social Auditor is free for everyone. We believe in high-quality tools for all, and our vision is supported by voluntary community donations." },
                                { q: "Can I request new features?", a: "Yes! We love hearing from our users. Use the 'Request Feature' link in our header or footer to share your ideas with us." }
                            ].map((faq, i) => (
                                <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-colors shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-start gap-3">
                                        <MessageSquare size={20} className="text-blue-500 mt-1 shrink-0" />
                                        {faq.q}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full bg-[#0B0F19] py-12 border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                            <Logo className="scale-90 opacity-80" />

                            <div className="flex flex-wrap justify-center gap-6">
                                <Link href="/help-center" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                    Help Center
                                </Link>
                                <Link href="/privacy" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                    Terms of Service
                                </Link>
                                <Link href="/contact" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                                <Link href="/donate" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                    Donate
                                </Link>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-slate-500">
                                &copy; {new Date().getFullYear()} Social Auditor. All rights reserved.
                            </p>
                            <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                Developed by <span className="text-white font-bold ml-1 tracking-wide">Mackstroke Labs</span>
                            </p>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Back to top button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 z-50 p-4 bg-white dark:bg-[#1F2937] text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl hover:-translate-y-2 active:scale-95 transition-all group"
            >
                <ChevronUp size={24} className="group-hover:animate-bounce" />
            </button>
        </div>
    );
}

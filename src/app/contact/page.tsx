"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, MessageSquare, Mail, Globe, CheckCircle2, Phone, Heart, Users, ShieldCheck, ArrowRight, Menu, X, ChevronUp } from "lucide-react";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const rootRef = React.useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        rootRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            subject: formData.get("subject"),
            message: formData.get("message"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || "Failed to send message");
            }

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={rootRef} className="fixed inset-0 w-full h-full left-0 top-0 z-[60] overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#0B0F19] flex flex-col font-display selection:bg-blue-500/30 scroll-smooth">
            {/* Minimal Header (Same as Landing) */}
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
                            href="/feature-request"
                            className="text-sm font-semibold px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Request Feature
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-semibold px-4 py-2 text-blue-600 dark:text-blue-400 transition-colors"
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
                            href="/auth"
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
                            className="text-lg font-bold p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-900 dark:text-white"
                        >
                            Home
                        </Link>
                        <Link
                            href="/feature-request"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-900 dark:text-white"
                        >
                            Request Feature
                        </Link>
                        <Link
                            href="/contact"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/auth"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-900 dark:text-white"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/contact"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold p-4 bg-blue-600 text-white rounded-2xl text-center shadow-lg shadow-blue-500/20"
                        >
                            Contact Us
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 w-full bg-white dark:bg-[#0B0F19]">
                {/* Hero / Header Section */}
                <section className="relative w-full pt-16 pb-20 px-4 text-center max-w-7xl mx-auto overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto">
                        Let's build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 italic">future</span> of ads together.
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Have a question, suggestion, or just want to say hi? Our team at Mackstroke Labs is ready to support your journey.
                    </p>
                </section>

                <section className="max-w-7xl mx-auto px-4 pb-32">
                    {submitted ? (
                        <div className="max-w-md mx-auto bg-slate-50 dark:bg-[#1F2937] rounded-3xl p-12 border border-slate-200 dark:border-white/10 shadow-2xl text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-8 rotate-12">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Success!</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                We've received your message. A specialist from our team will reach out to you shortly.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                            >
                                <ArrowLeft size={18} /> Back to Hub
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Form Column */}
                            <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-2xl">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                placeholder="Enter your name"
                                                className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                placeholder="your@email.com"
                                                className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Mobile Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                placeholder="+91 00000 00000"
                                                className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">Subject</label>
                                            <select
                                                name="subject"
                                                className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 dark:text-slate-300 appearance-none"
                                            >
                                                <option>General Inquiry</option>
                                                <option>Technical Support</option>
                                                <option>Feature Request</option>
                                                <option>Partnership</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1">How can we help?</label>
                                        <textarea
                                            name="message"
                                            rows={5}
                                            required
                                            placeholder="Tell us about your campaign needs..."
                                            className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 group"
                                    >
                                        {loading ? "Transmitting..." : "Send Message"}
                                        <Send size={20} className={loading ? "animate-pulse" : "group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"} />
                                    </button>

                                    {error && (
                                        <p className="text-sm text-red-500 text-center font-bold px-4 py-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                                            {error}
                                        </p>
                                    )}
                                </form>
                            </div>

                            {/* Info Column */}
                            <div className="lg:col-span-5 flex flex-col gap-8">
                                <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-white/10">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Channels</h3>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <Mail size={22} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">Email Us</div>
                                                <div className="text-slate-600 dark:text-slate-400">info@mackstroke.com</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <Phone size={22} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">Call Centers</div>
                                                <div className="text-slate-600 dark:text-slate-400">Support available 24/7</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-8 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Enterprise Scaling?</h3>
                                            <p className="text-blue-100 mb-8 leading-relaxed">
                                                Our team specializes in high-volume creative auditing for agencies spending $1M+ monthly.
                                            </p>
                                        </div>
                                        <Link href="/auth" className="inline-flex items-center gap-2 font-black group-hover:gap-4 transition-all uppercase tracking-widest text-sm">
                                            Get Started <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                    <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Footer (Same as Landing) */}
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Lock, ArrowRight, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

export default function AuthPage() {
    const router = useRouter();
    const supabase = createClient();

    // UI States
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"request" | "verify">("request"); // For OTP

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
            });
            if (error) throw error;
            setResetEmailSent(true);
        } catch (err: any) {
            setError(err.message || "Could not send reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const backToLogin = () => {
        setIsForgotPassword(false);
        setResetEmailSent(false);
        setResetEmail("");
        setError(null);
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setSuccessMessage("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (step === "request") {
                const { error } = await supabase.auth.signInWithOtp({
                    phone,
                });
                if (error) throw error;
                setStep("verify");
                setSuccessMessage("OTP sent to your phone.");
            } else {
                const { error } = await supabase.auth.verifyOtp({
                    phone,
                    token: otp,
                    type: 'sms'
                });
                if (error) throw error;
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred with OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || "An error occurred with Google login.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <Logo className="scale-125" />
                </div>

                <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                    {/* Method Toggle - Hidden until Twilio is configured */}
                    {/* 
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => { setAuthMethod("email"); setError(null); setSuccessMessage(null); }}
                            className={cn(
                                "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                authMethod === "email" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-400 hover:text-white bg-black/20"
                            )}
                        >
                            <Mail size={16} /> Email
                        </button>
                        <button
                            onClick={() => { setAuthMethod("phone"); setError(null); setSuccessMessage(null); setStep("request"); }}
                            className={cn(
                                "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                authMethod === "phone" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-400 hover:text-white bg-black/20"
                            )}
                        >
                            <Phone size={16} /> Phone
                        </button>
                    </div>
                    */}

                    <div className="p-8">
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                {isForgotPassword
                                    ? "Reset your password"
                                    : authMethod === "email" ? (isSignUp ? "Create an account" : "Welcome back") : "Login with OTP"}
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {isForgotPassword
                                    ? "Enter your email and we'll send you a reset link"
                                    : authMethod === "email" ? "Enter your email to access Social Auditor" : "We'll send you a 6-digit confirmation code"}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm text-center font-medium">
                                {successMessage}
                            </div>
                        )}

                        {/* ── Forgot Password View ─────────────────────── */}
                        {isForgotPassword ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="forgot"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {resetEmailSent ? (
                                        // Success card
                                        <div className="flex flex-col items-center gap-4 py-4 text-center">
                                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <ShieldCheck size={26} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-base mb-1">Check your inbox</p>
                                                <p className="text-slate-400 text-sm">
                                                    We sent a password reset link to <span className="text-white font-medium">{resetEmail}</span>.
                                                    Check your spam folder if it doesn't arrive within a minute.
                                                </p>
                                            </div>
                                            <button
                                                onClick={backToLogin}
                                                className="mt-2 text-sm text-primary hover:underline transition-colors"
                                            >
                                                ← Back to Sign In
                                            </button>
                                        </div>
                                    ) : (
                                        // Reset email form
                                        <form onSubmit={handleForgotPassword} className="space-y-4">
                                            {error && (
                                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-medium">
                                                    {error}
                                                </div>
                                            )}
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                    <Mail size={18} />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={resetEmail}
                                                    onChange={(e) => setResetEmail(e.target.value)}
                                                    required
                                                    autoFocus
                                                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                                    placeholder="name@example.com"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Send Reset Link"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={backToLogin}
                                                className="w-full text-sm text-slate-400 hover:text-white transition-colors py-1"
                                            >
                                                ← Back to Sign In
                                            </button>
                                        </form>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <>
                                {/* ── Normal Auth View ─────────────────────────── */}

                                <AnimatePresence mode="wait">

                                    <motion.form
                                        key={authMethod + step + isSignUp}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        onSubmit={authMethod === "email" ? handleEmailAuth : handlePhoneAuth}
                                        className="space-y-4"
                                    >
                                        {authMethod === "email" ? (
                                            <>
                                                <div>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                            <Mail size={18} />
                                                        </div>
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            required
                                                            className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                                            placeholder="name@example.com"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                            <Lock size={18} />
                                                        </div>
                                                        <input
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                            className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                                {/* Forgot password link — login mode only */}
                                                {!isSignUp && (
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setIsForgotPassword(true); setResetEmail(email); setError(null); }}
                                                            className="text-xs text-slate-500 hover:text-primary transition-colors"
                                                        >
                                                            Forgot password?
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {step === "request" ? (
                                                    <div>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                                <Phone size={18} />
                                                            </div>
                                                            <input
                                                                type="tel"
                                                                value={phone}
                                                                onChange={(e) => setPhone(e.target.value)}
                                                                required
                                                                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                                                placeholder="+1 (555) 000-0000"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                                <KeyRound size={18} />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={otp}
                                                                onChange={(e) => setOtp(e.target.value)}
                                                                required
                                                                maxLength={6}
                                                                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 tracking-[0.5em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                                                placeholder="000000"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Terms checkbox — sign up only */}
                                        {isSignUp && (
                                            <div
                                                onClick={() => setTermsAccepted(!termsAccepted)}
                                                className="flex items-start gap-3 cursor-pointer select-none group pt-1"
                                            >
                                                <div className={cn(
                                                    "shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                                                    termsAccepted
                                                        ? "bg-emerald-500 border-emerald-500"
                                                        : "border-slate-600 group-hover:border-slate-400"
                                                )}>
                                                    {termsAccepted && (
                                                        <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
                                                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                                    I have read and agree to the{" "}
                                                    <a
                                                        href="/terms"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={e => e.stopPropagation()}
                                                        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                                                    >
                                                        Terms &amp; Policies
                                                    </a>
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isLoading || (isSignUp && !termsAccepted)}
                                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <>
                                                    {authMethod === "email" ? (isSignUp ? "Create Account" : "Sign In") : (step === "request" ? "Send Code" : "Verify Code")}
                                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>
                                    </motion.form>
                                </AnimatePresence>

                                {authMethod === "email" && (
                                    <div className="mt-6 text-center">
                                        <button
                                            type="button"
                                            onClick={() => { setIsSignUp(!isSignUp); setError(null); setTermsAccepted(false); }}
                                            className="text-sm text-slate-400 hover:text-white transition-colors"
                                        >
                                            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                                        </button>
                                    </div>
                                )}

                                <div className="my-6 flex items-center gap-4">
                                    <div className="h-px flex-1 bg-white/10"></div>
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Or continue with</span>
                                    <div className="h-px flex-1 bg-white/10"></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={isSignUp && !termsAccepted}
                                    className="w-full py-3 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl font-bold transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}


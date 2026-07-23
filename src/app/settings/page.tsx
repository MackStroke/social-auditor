"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, ExternalLink, AlertCircle, Trash2, User, Key, Save, Phone, Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

async function sha256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

type Tab = "profile" | "api";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    // Profile state
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // API Key state
    const [apiKey, setApiKey] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [hasExistingKey, setHasExistingKey] = useState(false);
    const [keyError, setKeyError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Delete Account state
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setEmail(user.email || "");
            setFullName(user.user_metadata?.full_name || "");
            setPhone(user.user_metadata?.phone || user.phone || "");

            // Cross-device API key sync
            const remoteKey = user.user_metadata?.gemini_api_key;
            const localKey = localStorage.getItem("gemini_api_key");
            if (remoteKey && !localKey) {
                localStorage.setItem("gemini_api_key", remoteKey);
                setApiKey(remoteKey);
                setHasExistingKey(true);
            } else if (localKey) {
                setApiKey(localKey);
                setHasExistingKey(true);
            }
        };
        loadUser();
    }, []);

    // ─── Profile Handlers ───────────────────────────────────────────
    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setProfileError(null);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName.trim(),
                    phone: phone.trim(),
                },
            });
            if (error) throw error;
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err: any) {
            setProfileError(err.message || "Failed to save profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        setDeleteAccountError(null);
        try {
            const res = await fetch("/api/delete-account", { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete account.");
            }
            // Clear all local data
            localStorage.clear();
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/auth";
        } catch (err: any) {
            setDeleteAccountError(err.message || "Failed to delete account. Please try again.");
            setIsDeletingAccount(false);
        }
    };

    const initials = fullName
        ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : email.substring(0, 2).toUpperCase();

    // ─── API Key Handlers ───────────────────────────────────────────
    const handleSaveKey = async () => {
        setKeyError(null);
        setIsSyncing(true);
        const trimmedKey = apiKey.trim();

        if (trimmedKey === "") {
            localStorage.removeItem("gemini_api_key");
            setHasExistingKey(false);
            await fetch("/api/register-api-key", { method: "DELETE" });
            const supabase = createClient();
            await supabase.auth.updateUser({ data: { gemini_api_key: null } });
            setIsSyncing(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
            return;
        }

        const keyHash = await sha256(trimmedKey);
        const res = await fetch("/api/register-api-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyHash }),
        });

        if (!res.ok) {
            const data = await res.json();
            setKeyError(data.error || "Failed to validate key. Please try again.");
            setIsSyncing(false);
            return;
        }

        localStorage.setItem("gemini_api_key", trimmedKey);
        setHasExistingKey(true);
        const supabase = createClient();
        await supabase.auth.updateUser({ data: { gemini_api_key: trimmedKey } });
        setIsSyncing(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleDeleteKey = async () => {
        setIsDeleting(true);
        setShowDeleteConfirm(false);
        localStorage.removeItem("gemini_api_key");
        setApiKey("");
        setHasExistingKey(false);
        setKeyError(null);
        await fetch("/api/register-api-key", { method: "DELETE" });
        const supabase = createClient();
        await supabase.auth.updateUser({ data: { gemini_api_key: null } });
        setIsDeleting(false);
    };

    const apiGuideSteps = [
        {
            label: "Visit Google AI Studio",
            detail: "Go to the API key management page.",
            link: { href: "https://aistudio.google.com/apikey", label: "aistudio.google.com/apikey" },
        },
        {
            label: "Create an API Key",
            detail: <>Click <strong className="text-slate-800 dark:text-slate-200">"Create API Key"</strong> and select or create any Google Cloud project.</>,
        },
        {
            label: "Copy & Paste the Key",
            detail: <>Copy the key starting with <code className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded text-xs font-mono">AIzaSy...</code> and paste it below.</>,
        },
    ];

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: "profile", label: "Profile", icon: "person" },
        { id: "api", label: "API Key", icon: "key" },
    ];

    return (
        <>
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
            <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-5xl mx-auto z-10 flex flex-col gap-6 md:gap-8">

                {/* Header */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Settings</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Manage your profile and API configuration.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Profile Tab ── */}
                {activeTab === "profile" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Avatar + Name card */}
                        <div className="lg:col-span-4">
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-6 flex flex-col items-center gap-4 text-center h-full">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-indigo-600/40 border-2 border-primary/30 flex items-center justify-center text-2xl font-black text-white">
                                    {initials || <span className="material-symbols-outlined text-3xl text-slate-400">person</span>}
                                </div>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-bold text-lg">{fullName || "Your Name"}</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm truncate max-w-[180px]">{email}</p>
                                </div>
                                {hasExistingKey && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-3 py-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                        API Key Configured
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="lg:col-span-8">
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-8 shadow-sm dark:shadow-xl">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Personal Information</h3>
                                <div className="space-y-5">
                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                            <Mail size={14} /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            readOnly
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-500 cursor-not-allowed font-mono text-sm"
                                        />
                                        <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">Email cannot be changed here.</p>
                                    </div>

                                    {/* Display Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                            <User size={14} /> Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full bg-white dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                            <Phone size={14} /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-white dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {profileError && (
                                        <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <span>{profileError}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSavingProfile}
                                            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {isSavingProfile ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <><Save size={15} /> Save Profile</>
                                            )}
                                        </button>
                                        {profileSaved && (
                                            <span className="text-green-400 text-sm font-medium flex items-center gap-1 animate-in fade-in">
                                                <CheckCircle2 size={15} /> Profile updated
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Danger Zone ── */}
                        <div className="lg:col-span-12">
                            <div className="bg-white dark:bg-surface-dark border border-red-500/20 rounded-xl p-6 shadow-sm dark:shadow-xl">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <h3 className="text-base font-bold text-red-400 flex items-center gap-2 mb-1">
                                            <AlertCircle size={16} /> Danger Zone
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                                            Permanently delete your account and all associated data — including your API key registration, feature requests, and profile.{" "}
                                            <span className="text-red-400 font-semibold">This action cannot be undone.</span>
                                        </p>
                                    </div>
                                    {!showDeleteAccountConfirm && (
                                        <button
                                            onClick={() => { setShowDeleteAccountConfirm(true); setDeleteConfirmText(""); setDeleteAccountError(null); }}
                                            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-semibold transition-colors"
                                        >
                                            <Trash2 size={15} /> Delete Account
                                        </button>
                                    )}
                                </div>

                                {showDeleteAccountConfirm && (
                                    <div className="mt-5 pt-5 border-t border-red-500/10 space-y-4">
                                        {deleteAccountError && (
                                            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                                <span>{deleteAccountError}</span>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Type <span className="font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">DELETE</span> to confirm
                                            </label>
                                            <input
                                                type="text"
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                placeholder="DELETE"
                                                className="w-full max-w-xs bg-white dark:bg-background-dark border border-red-500/30 rounded-lg p-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteConfirmText !== "DELETE" || isDeletingAccount}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {isDeletingAccount ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <><Trash2 size={15} /> Delete My Account</>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setShowDeleteAccountConfirm(false); setDeleteConfirmText(""); setDeleteAccountError(null); }}
                                                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}



                {/* ── API Key Tab ── */}
                {activeTab === "api" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7">
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-8 shadow-sm dark:shadow-xl h-full">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                                        <span className="material-symbols-outlined">key</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Google Gemini API Key</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            Required to run AI audits and generate copy. Each key can only be registered to one account. Synced across all your devices.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">API Key</label>
                                        <div className="relative">
                                            <input
                                                type={showApiKey ? "text" : "password"}
                                                value={apiKey}
                                                onChange={(e) => { setApiKey(e.target.value); setKeyError(null); }}
                                                placeholder="AIzaSy..."
                                                className={`w-full bg-white dark:bg-background-dark border rounded-lg p-3 pr-12 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-mono ${keyError ? "border-red-500/60 focus:ring-red-500/40" : "border-slate-300 dark:border-slate-700 focus:ring-primary"}`}
                                            />
                                            <button type="button" onClick={() => setShowApiKey(!showApiKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1">
                                                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {keyError && (
                                            <div className="mt-2 flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{keyError}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-3 pt-4">
                                        <div className="flex items-center gap-3">
                                            <button onClick={handleSaveKey} disabled={isSyncing || isDeleting}
                                                className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70">
                                                {isSyncing ? (
                                                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Validating...</>
                                                ) : (
                                                    <><span className="material-symbols-outlined text-sm">sync</span>Save & Sync Key</>
                                                )}
                                            </button>
                                            {hasExistingKey && !showDeleteConfirm && (
                                                <button onClick={() => setShowDeleteConfirm(true)} disabled={isSyncing || isDeleting}
                                                    className="flex items-center gap-2 py-2.5 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all text-sm font-semibold disabled:opacity-50">
                                                    <Trash2 size={15} /> Remove Key
                                                </button>
                                            )}
                                        </div>
                                        {showDeleteConfirm && (
                                            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/25 rounded-lg animate-in fade-in">
                                                <span className="text-red-300 text-sm flex-1">Remove this API key?</span>
                                                <button onClick={handleDeleteKey} disabled={isDeleting}
                                                    className="text-xs font-bold bg-red-600 hover:bg-red-500 text-white py-1.5 px-3 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5">
                                                    {isDeleting ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <Trash2 size={12} />}
                                                    Yes, Remove
                                                </button>
                                                <button onClick={() => setShowDeleteConfirm(false)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium py-1.5 px-2">Cancel</button>
                                            </div>
                                        )}
                                        {isSaved && (
                                            <span className="text-green-400 text-sm font-medium flex items-center gap-1 animate-in fade-in">
                                                <span className="material-symbols-outlined text-sm">check_circle</span> Saved & synced
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: How-to Guide */}
                        <div className="lg:col-span-5">
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-xl h-full">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">How to get your free API key</p>
                                <div className="flex flex-col gap-5">
                                    {apiGuideSteps.map((step, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                                                {i < apiGuideSteps.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-white/5 mt-2" />}
                                            </div>
                                            <div className="pb-4">
                                                <p className="text-slate-900 dark:text-white text-sm font-semibold mb-0.5">{step.label}</p>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{step.detail}</p>
                                                {step.link && (
                                                    <a href={step.link.href} target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-indigo-400 text-xs hover:text-indigo-300 transition-colors mt-1">
                                                        {step.link.label} <ExternalLink size={11} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/5 border border-amber-500/15 rounded-lg">
                                    <p className="text-xs text-amber-900 dark:text-amber-300/80 leading-relaxed">
                                        <strong className="text-amber-700 dark:text-amber-300">Note:</strong> Each API key can only be registered to one account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </>
    );
}

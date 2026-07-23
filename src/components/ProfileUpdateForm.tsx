"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function ProfileUpdateForm({ user }: { user: User }) {
    const [name, setName] = useState(user.user_metadata?.full_name || "");
    const [company, setCompany] = useState(user.user_metadata?.company || "");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });
        const supabase = createClient();

        // Update user metadata in Supabase
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: name,
                company: company
            }
        });

        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setMessage({ type: "success", text: "Profile updated successfully!" });
        }
        setIsSaving(false);

        // Clear success message after 3 seconds
        if (!error) {
            setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
        }
    };

    return (
        <div className="mt-8">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 rounded-xl p-5 border border-white/5">

                <div className="col-span-1 md:col-span-2">
                    <label className="text-slate-400 text-sm mb-1.5 font-medium block">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                        placeholder="e.g. Jane Doe"
                    />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="text-slate-400 text-sm mb-1.5 font-medium block">Company / Agency Name</label>
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                        placeholder="e.g. Acme Marketing"
                    />
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center justify-between pt-2">
                    <div className="min-h-[24px]">
                        {message.text && (
                            <span className={`text-sm font-medium flex items-center gap-1.5 animate-in fade-in duration-300 ${message.type === "error" ? "text-red-400" : "text-emerald-400"}`}>
                                <span className="material-symbols-outlined text-[18px]">
                                    {message.type === "error" ? "error" : "check_circle"}
                                </span>
                                {message.text}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || (name === (user.user_metadata?.full_name || "") && company === (user.user_metadata?.company || ""))}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:shadow-none disabled:hover:bg-emerald-500"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquare, Trash2, CheckCircle, Clock, Search, RefreshCw, User, Calendar, ExternalLink, Phone } from "lucide-react";

type ContactQuery = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

export default function AdminContactQueries() {
    const [queries, setQueries] = useState<ContactQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchQueries = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/contact-queries");
            if (!res.ok) throw new Error("Failed to load contact queries");
            const data = await res.json();
            setQueries(data.items || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    const markAsRead = async (id: string, is_read: boolean) => {
        try {
            const res = await fetch("/api/admin/contact-queries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, is_read }),
            });
            if (!res.ok) throw new Error("Update failed");

            setQueries(queries.map(q => q.id === id ? { ...q, is_read } : q));
            // Trigger badge update in sidebar
            window.dispatchEvent(new Event("contacts-read-update"));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const deleteQuery = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            const res = await fetch("/api/admin/contact-queries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, delete: true }),
            });
            if (!res.ok) throw new Error("Delete failed");
            setQueries(queries.filter(q => q.id !== id));
            window.dispatchEvent(new Event("contacts-read-update"));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filtered = queries.filter(q => {
        const matchesSearch =
            q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.message.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === "unread") return !q.is_read && matchesSearch;
        return matchesSearch;
    });

    const unreadCount = queries.filter(q => !q.is_read).length;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        Contact Messages
                        {unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage inquiries from the public contact form.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchQueries}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-xl border border-slate-300 dark:border-white/10 shadow-inner">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === "all" ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === "unread" ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
                        >
                            Unread
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search messages by name, email, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                </div>
            )}

            {loading && queries.length === 0 ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-8 animate-pulse">
                            <div className="h-6 w-1/3 bg-slate-200 dark:bg-white/10 rounded-lg mb-4" />
                            <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded-lg mb-2" />
                            <div className="h-4 w-2/3 bg-slate-100 dark:bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No messages found</h3>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search term.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((q) => (
                        <div
                            key={q.id}
                            className={`group bg-white dark:bg-white/5 border transition-all duration-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl ${q.is_read
                                ? "border-slate-200 dark:border-white/10 opacity-75"
                                : "border-blue-200 dark:border-blue-500/30 scale-[1.01] bg-blue-50/30 dark:bg-blue-500/5 ring-1 ring-blue-500/10"
                                }`}
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${q.is_read
                                            ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500"
                                            : "bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
                                            }`}>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                                                {q.name}
                                                {!q.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <a href={`mailto:${q.email}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
                                                    <Mail size={14} /> {q.email}
                                                </a>
                                                {q.phone && (
                                                    <a href={`tel:${q.phone}`} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5">
                                                        <Phone size={14} /> {q.phone}
                                                    </a>
                                                )}
                                                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                    <Calendar size={14} /> {new Date(q.created_at).toLocaleDateString()} at {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start md:self-center">
                                        <button
                                            onClick={() => markAsRead(q.id, !q.is_read)}
                                            className={`p-2.5 rounded-xl border transition-all ${q.is_read
                                                ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                                : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                            title={q.is_read ? "Mark as unread" : "Mark as read"}
                                        >
                                            {q.is_read ? <Clock size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                        <button
                                            onClick={() => deleteQuery(q.id)}
                                            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm"
                                            title="Delete message"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pl-0 md:pl-16">
                                    <div className="bg-slate-50 dark:bg-[#0a0a0f] rounded-2xl p-5 border border-slate-200 dark:border-white/5 relative">
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <MessageSquare size={12} /> Subject: {q.subject}
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {q.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

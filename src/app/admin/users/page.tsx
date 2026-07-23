"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Trash2, Key, User as UserIcon, RefreshCw, Download, AlertCircle } from "lucide-react";

type AdminUser = {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    last_sign_in_at: string | null;
    provider: string;
    has_api_key: boolean;
};

type DeleteState = { userId: string; email: string } | null;

function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name: string | null, email: string) {
    if (name) return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    return email.slice(0, 2).toUpperCase();
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data.users);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(u =>
            u.email.toLowerCase().includes(q) ||
            (u.full_name ?? "").toLowerCase().includes(q)
        );
    }, [users, search]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const res = await fetch(`/api/admin/users?id=${deleteTarget.userId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setUsers(prev => prev.filter(u => u.id !== deleteTarget.userId));
            setDeleteTarget(null);
        } catch (e: any) {
            setDeleteError(e.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const exportCSV = () => {
        const headers = ["Email", "Full Name", "Phone", "Provider", "API Key", "Signup Date", "Last Login"];
        const rows = filtered.map(u => [
            u.email, u.full_name ?? "", u.phone ?? "", u.provider,
            u.has_api_key ? "Yes" : "No",
            formatDate(u.created_at), formatDate(u.last_sign_in_at)
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Users</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        {loading ? "Loading..." : `${filtered.length} of ${users.length} users`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/10 text-sm transition-colors">
                        <Download size={14} /> Export CSV
                    </button>
                    <button onClick={fetchUsers} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/10 text-sm transition-colors disabled:opacity-50">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by email or name..."
                    className="w-full max-w-sm pl-9 pr-4 py-2.5 bg-white dark:bg-surface-dark border border-slate-300 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm dark:shadow-none"
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">API Key</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed Up</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(7)].map((_, j) => (
                                            <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-500">
                                        <UserIcon size={32} className="mx-auto mb-2 opacity-30" />
                                        No users found.
                                    </td>
                                </tr>
                            ) : filtered.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-indigo-600/30 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white shrink-0">
                                                {initials(u.full_name, u.email)}
                                            </div>
                                            <div>
                                                <p className="text-slate-900 dark:text-white font-medium">{u.full_name || <span className="text-slate-400 dark:text-slate-500 italic">No name</span>}</p>
                                                <p className="text-slate-500 text-xs">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">{u.phone || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs capitalize">{u.provider}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.has_api_key ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                                                <Key size={10} /> Configured
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 text-xs">Not set</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.last_sign_in_at)}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => { setDeleteTarget({ userId: u.id, email: u.email }); setDeleteError(null); }}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete user"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#0f0f17] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Delete User</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            Permanently delete <span className="text-slate-900 dark:text-white font-semibold">{deleteTarget.email}</span>?
                            This removes their profile, API key registration, and all feature requests. Cannot be undone.
                        </p>
                        {deleteError && (
                            <div className="mb-4 flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />{deleteError}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <><RefreshCw size={13} className="animate-spin" /> Deleting...</> : <><Trash2 size={13} /> Delete User</>}
                            </button>
                            <button
                                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

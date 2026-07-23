"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard, Users, MessageSquare, Settings2,
    ArrowLeft, ShieldCheck, LogOut, Activity, BarChart3, Mail
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/feature-requests", label: "Notifications", icon: MessageSquare },
    { href: "/admin/contact-queries", label: "Contact Messages", icon: Mail },
    { href: "/admin/activity", label: "Activity Tracer", icon: Activity },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/system", label: "System", icon: Settings2 },
];

export default function AdminSidebar({ adminEmail }: { adminEmail: string }) {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [contactUnread, setContactUnread] = useState(0);

    const fetchUnreads = () => {
        // Fetch features unread
        fetch("/api/admin/feature-requests?count_only=true")
            .then(res => res.json())
            .then(data => {
                if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
            })
            .catch(() => { });

        // Fetch contacts unread
        fetch("/api/admin/contact-queries?count_only=true")
            .then(res => res.json())
            .then(data => {
                if (data.unreadCount !== undefined) setContactUnread(data.unreadCount);
            })
            .catch(() => { });
    };

    useEffect(() => {
        fetchUnreads();

        window.addEventListener("features-read-update", fetchUnreads);
        window.addEventListener("contacts-read-update", fetchUnreads);
        return () => {
            window.removeEventListener("features-read-update", fetchUnreads);
            window.removeEventListener("contacts-read-update", fetchUnreads);
        };
    }, [pathname]); // Re-fetch occasionally on navigation

    return (
        <aside className="w-64 shrink-0 h-full bg-slate-50 dark:bg-[#0a0a0f] border-r border-slate-200 dark:border-white/5 flex flex-col">
            {/* Logo / Brand */}
            <div className="p-5 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                        <ShieldCheck size={16} className="text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Admin Panel</p>
                        <p className="text-[10px] text-red-400 font-semibold tracking-wider uppercase mt-0.5">Restricted Access</p>
                    </div>
                </div>
            </div>

            {/* Admin email badge */}
            <div className="mx-4 mt-4 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-indigo-600/40 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {adminEmail[0]?.toUpperCase()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{adminEmail}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 mt-2">
                {navItems.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={16} />
                                {label}
                            </div>
                            {href === "/admin/feature-requests" && unreadCount > 0 && (
                                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none">
                                    {unreadCount}
                                </span>
                            )}
                            {href === "/admin/contact-queries" && contactUnread > 0 && (
                                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none">
                                    {contactUnread}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom links */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
                <div className="px-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    <ThemeToggle isSidebar className="w-full" />
                </div>
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                    <ArrowLeft size={16} />
                    Back to App
                </Link>
            </div>
        </aside>
    );
}

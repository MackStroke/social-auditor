"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import { ChevronDown, HelpCircle, FileText, Shield, Bug, ExternalLink, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const mainLinks = [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "History", href: "/history", icon: "history" },
    { name: "Reports", href: "/reports", icon: "analytics" },
];

const adToolsLinks = [
    { name: "Campaign Simulator", href: "/simulator", icon: "calculate" },
    { name: "A/B Testing", href: "/ab-test", icon: "compare" },
    { name: "Opportunity Score", href: "/opportunity-score", icon: "radar" },
];

const bottomLinks = [
    { name: "Settings", href: "/settings", icon: "settings" },
    { name: "Request a Feature", href: "/feature-request", icon: "lightbulb" },
    { name: "Donate", href: "/donate", icon: "favorite" },
];

const helpItems = [
    {
        name: "Help Center",
        icon: <HelpCircle size={14} />,
        href: "/help-center",
        external: false,
    },
    {
        name: "Release Notes",
        icon: <FileText size={14} />,
        href: "/release-notes",
        external: false,
    },
    {
        name: "Terms & Policies",
        icon: <Shield size={14} />,
        href: "/terms",
        external: false,
    },
    {
        name: "Privacy Policy",
        icon: <ShieldCheck size={14} />,
        href: "/privacy",
        external: false,
    },
    {
        name: "Report a Bug",
        icon: <Bug size={14} />,
        href: "/feature-request",
        external: false,
    },
];

export default function Sidebar({ isAuthenticated: initialAuth = false }: { isAuthenticated?: boolean }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name;
                setUserIdentifier(name || user.email || user.phone || "Authenticated User");
                setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
            }
        };
        fetchUser();

        // Check if current user is admin (shows admin panel link if yes)
        fetch("/api/admin/check")
            .then(r => r.json())
            .then(d => setIsAdmin(d.isAdmin === true))
            .catch(() => { });
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const NavLink = ({ href, icon, name }: { href: string; icon: string; name: string }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
            <Link
                href={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                        ? "bg-primary/10 border border-primary/20 text-primary"
                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
                )}
            >
                <span className={cn("material-symbols-outlined transition-transform group-hover:scale-110 text-[20px]", isActive ? "text-primary" : "")}>
                    {icon}
                </span>
                <span className={cn("font-medium text-sm", isActive ? "text-primary" : "text-current")}>
                    {name}
                </span>
            </Link>
        );
    };

    const isLogged = userIdentifier ? true : initialAuth;

    if (pathname === "/contact") return null;
    if (pathname === "/" && !isLogged) return null;

    return (
        <>
            {/* Mobile Header */}
            <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background z-40 relative shrink-0">
                <Logo className="scale-[0.85] origin-left" />
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/5"
                >
                    <span className="material-symbols-outlined">{isOpen ? "close" : "menu"}</span>
                </button>
            </div>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:static top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background p-4 transition-transform duration-300 ease-in-out shrink-0",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Mobile Menu Close */}
                <div className="flex items-center justify-between md:hidden mb-6">
                    <span className="font-bold uppercase tracking-wider text-sm text-primary">Menu</span>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="flex flex-col h-full justify-between gap-2 overflow-y-auto pb-2 pr-1">
                    {/* Top Section */}
                    <div className="flex flex-col gap-1">
                        {/* Logo + User */}
                        <div className="hidden md:flex flex-col gap-2 items-start px-3 mt-2 mb-4">
                            <Logo />
                            {userIdentifier ? (
                                <div className="flex items-center gap-2 mt-1 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/10 max-w-full overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile" className="w-5 h-5 rounded-full shrink-0 object-cover border border-slate-200 dark:border-white/10" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-[10px] font-bold uppercase">
                                            {userIdentifier.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium truncate" title={userIdentifier}>
                                        {userIdentifier}
                                    </span>
                                </div>
                            ) : (
                                <div className="h-6 w-32 mt-1 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
                            )}
                        </div>

                        {/* Main Nav */}
                        <nav className="flex flex-col gap-1">
                            {mainLinks.map((link) => <NavLink key={link.name} {...link} />)}
                        </nav>

                        {/* Ad Tools Header */}
                        <div className="mt-4 mb-1 px-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">FB Ad Tools</span>
                        </div>
                        {/* Ad Tools Nav */}
                        <nav className="flex flex-col gap-1">
                            {adToolsLinks.map((link) => <NavLink key={link.name} {...link} />)}
                        </nav>

                        {/* Divider */}
                        <div className="my-3 h-px bg-slate-200 dark:bg-slate-800" />

                        {/* Bottom Nav Links */}
                        <nav className="flex flex-col gap-1">
                            {bottomLinks.map((link) => <NavLink key={link.name} {...link} />)}
                        </nav>

                        {/* Admin Panel Link — only visible to admin */}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all mt-1"
                            >
                                <ShieldCheck size={18} />
                                <span className="font-semibold text-sm">Admin Panel</span>
                            </Link>
                        )}
                    </div>


                    {/* Bottom Section */}
                    <div className="flex flex-col gap-1">
                        {/* Help Section */}
                        <div>
                            <button
                                onClick={() => setHelpOpen(!helpOpen)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">help_outline</span>
                                <span className="font-medium text-sm flex-1 text-left">Help</span>
                                <ChevronDown size={14} className={cn("transition-transform duration-200", helpOpen ? "rotate-180" : "")} />
                            </button>

                            {helpOpen && (
                                <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-slate-200 dark:border-slate-800 pl-3 animate-in slide-in-from-top-1 fade-in duration-150">
                                    {helpItems.map((item) =>
                                        item.external ? (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs font-medium"
                                            >
                                                <span className="text-slate-400 dark:text-slate-600">{item.icon}</span>
                                                {item.name}
                                                <ExternalLink size={10} className="ml-auto text-slate-700" />
                                            </a>
                                        ) : (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs font-medium"
                                            >
                                                <span className="text-slate-400 dark:text-slate-600">{item.icon}</span>
                                                {item.name}
                                            </Link>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="my-1.5 pl-1.5 flex text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <ThemeToggle isSidebar />
                        </div>

                        {/* Sign In / Sign Out */}
                        {userIdentifier ? (
                            <button
                                onClick={async () => {
                                    const { createClient } = await import("@/lib/supabase/client");
                                    const supabase = createClient();
                                    await supabase.auth.signOut();
                                    window.location.href = "/auth";
                                }}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors w-full text-left border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                <span className="font-medium text-sm">Sign Out</span>
                            </button>
                        ) : (
                            <Link
                                href="/auth"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors w-full border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">login</span>
                                <span className="font-medium text-sm">Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

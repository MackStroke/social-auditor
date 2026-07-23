"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className, isSidebar = false }: { className?: string; isSidebar?: boolean }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className={`w-10 h-10 rounded-lg ${className}`} />;
    }

    const isDark = theme === "dark";

    if (isSidebar) {
        return (
            <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent ${className}`}
                title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
                <div className="relative w-5 h-5 flex items-center justify-center">
                    <Sun size={20} className={`absolute transition-all ${isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`} />
                    <Moon size={20} className={`absolute transition-all ${isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
                </div>
                <span className="font-medium text-sm flex-1 text-left">
                    {isDark ? "Light Mode" : "Dark Mode"}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 ${className}`}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
            <Sun size={20} className={`absolute transition-all ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
            <Moon size={20} className={`absolute transition-all ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
        </button>
    );
}

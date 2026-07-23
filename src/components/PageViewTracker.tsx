"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/activity-tracker";

/**
 * Tracks page views on route changes. Drop into the root layout.
 * Only fires for user-facing pages (excludes /admin and /api).
 */
export default function PageViewTracker() {
    const pathname = usePathname();
    const lastPath = useRef<string | null>(null);

    useEffect(() => {
        // Skip admin and API routes
        if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
        // Debounce: don't re-fire for the same path
        if (pathname === lastPath.current) return;
        lastPath.current = pathname;

        trackEvent("page_view", { path: pathname });
    }, [pathname]);

    return null;
}

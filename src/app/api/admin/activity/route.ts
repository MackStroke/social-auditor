import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser, createAdminClient } from "@/lib/admin-auth";

/**
 * GET /api/admin/activity
 * Returns aggregated activity analytics with filters.
 *
 * Query params:
 *   range    — '1d' | '7d' | '30d' | '90d'  (default '30d')
 *   feature  — filter by specific feature name
 *   user_id  — filter by specific user
 *   country  — filter by country
 */
export async function GET(request: NextRequest) {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const admin = createAdminClient();
    const sp = request.nextUrl.searchParams;

    // --- Resolve date range ---
    const range = sp.get("range") || "30d";
    const days = { "1d": 1, "7d": 7, "30d": 30, "90d": 90 }[range] ?? 30;
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    // --- Build base query filters ---
    const featureFilter = sp.get("feature") || null;
    const userFilter = sp.get("user_id") || null;
    const countryFilter = sp.get("country") || null;

    // --- Fetch raw events within the window (max 5000 for safety) ---
    let q = admin
        .from("activity_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(5000);

    if (featureFilter) q = q.eq("feature", featureFilter);
    if (userFilter) q = q.eq("user_id", userFilter);
    if (countryFilter) q = q.eq("country", countryFilter);

    const { data: events, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = events ?? [];

    // --- Aggregations ---

    // 1. Feature usage counts
    const featureCounts: Record<string, number> = {
        audit: 0,
        generate_copy: 0,
        simulate: 0,
        ab_test: 0,
        page_view: 0,
    };
    rows.forEach(r => { featureCounts[r.feature] = (featureCounts[r.feature] ?? 0) + 1; });

    // 2. Daily trend
    const dailyMap: Record<string, number> = {};
    rows.forEach(r => {
        const day = r.created_at.slice(0, 10); // YYYY-MM-DD
        dailyMap[day] = (dailyMap[day] ?? 0) + 1;
    });
    // Fill gaps
    const dailyTrend: { date: string; count: number }[] = [];
    const cursor = new Date(since);
    const now = new Date();
    while (cursor <= now) {
        const key = cursor.toISOString().slice(0, 10);
        dailyTrend.push({ date: key, count: dailyMap[key] ?? 0 });
        cursor.setDate(cursor.getDate() + 1);
    }

    // 3. Hour-of-day distribution (0-23)
    const hourDist: number[] = new Array(24).fill(0);
    rows.forEach(r => {
        const h = new Date(r.created_at).getHours();
        hourDist[h]++;
    });

    // 4. Top users (top 10)
    const userMap: Record<string, number> = {};
    rows.forEach(r => { userMap[r.user_id] = (userMap[r.user_id] ?? 0) + 1; });
    const topUserIds = Object.entries(userMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    // Resolve emails
    const { data: { users: allUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const emailMap: Record<string, string> = {};
    (allUsers ?? []).forEach(u => { emailMap[u.id] = u.email ?? "unknown"; });
    const topUsers = topUserIds.map(([uid, count]) => ({
        user_id: uid,
        email: emailMap[uid] ?? "unknown",
        count,
    }));

    // 5. Location breakdown
    const locationMap: Record<string, number> = {};
    rows.forEach(r => {
        const loc = r.country || "Unknown";
        locationMap[loc] = (locationMap[loc] ?? 0) + 1;
    });
    const locations = Object.entries(locationMap)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

    // 6. Unique users
    const uniqueUsers = new Set(rows.map(r => r.user_id)).size;

    // 7. Most-used feature
    const mostUsed = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0];

    // 8. Events today
    const todayStr = new Date().toISOString().slice(0, 10);
    const eventsToday = rows.filter(r => r.created_at.slice(0, 10) === todayStr).length;

    // 9. Distinct countries for the filter dropdown
    const { data: countryRows } = await admin
        .from("activity_events")
        .select("country")
        .not("country", "is", null);
    const allCountries = [...new Set((countryRows ?? []).map(r => r.country).filter(Boolean))].sort();

    // 10. Specific Page Views
    const pageViewMap: Record<string, number> = {};
    rows.filter(r => r.feature === "page_view").forEach(r => {
        const path = r.metadata?.path || "Unknown Page";
        pageViewMap[path] = (pageViewMap[path] ?? 0) + 1;
    });
    const pageViews = Object.entries(pageViewMap)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);

    return NextResponse.json({
        totalEvents: rows.length,
        uniqueUsers,
        mostUsedFeature: mostUsed ? mostUsed[0] : null,
        mostUsedFeatureCount: mostUsed ? mostUsed[1] : 0,
        eventsToday,
        featureCounts,
        dailyTrend,
        hourDistribution: hourDist,
        topUsers,
        locations,
        allCountries,
        pageViews,
    });
}

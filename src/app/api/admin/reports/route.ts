import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser, createAdminClient } from "@/lib/admin-auth";

/**
 * GET /api/admin/reports
 * Returns robust time-series data for drawing linear charts.
 * Query params: range='1d' | '7d' | '30d' | '90d'
 */
export async function GET(request: NextRequest) {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const admin = createAdminClient();
    const sp = request.nextUrl.searchParams;

    const range = sp.get("range") || "30d";
    const days = { "1d": 1, "7d": 7, "30d": 30, "90d": 90 }[range] ?? 30;
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    // 1. Fetch Activity Events
    const { data: events, error: evError } = await admin
        .from("activity_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(10000);

    if (evError) return NextResponse.json({ error: evError.message }, { status: 500 });

    // 2. Fetch Users (for user growth trend)
    const { data: { users }, error: usError } = await admin.auth.admin.listUsers();
    if (usError) return NextResponse.json({ error: usError.message }, { status: 500 });
    const allUsers = users || [];

    // Initialize daily template
    const dates: string[] = [];
    const cursor = new Date(since);
    const now = new Date();
    while (cursor <= now) {
        dates.push(cursor.toISOString().slice(0, 10));
        cursor.setDate(cursor.getDate() + 1);
    }

    // A. Users Signup Trend
    const usersMap: Record<string, number> = {};
    allUsers.forEach(u => {
        const d = new Date(u.created_at).toISOString().slice(0, 10);
        usersMap[d] = (usersMap[d] ?? 0) + 1;
    });
    let cumulativeUsers = allUsers.filter(u => new Date(u.created_at) < new Date(since)).length;

    const userGrowthTrend = dates.map(date => {
        const newUsers = usersMap[date] ?? 0;
        cumulativeUsers += newUsers;
        return { date, totalUsers: cumulativeUsers, newUsers };
    });

    // B. Total Events & Feature Usage Trend
    const activityTrendMap: Record<string, any> = {};
    dates.forEach(d => { activityTrendMap[d] = { date: d, total: 0, audit: 0, generate_copy: 0, simulate: 0, ab_test: 0, page_view: 0 }; });

    // C. Location Trend (Top 3 countries)
    let countryCounts: Record<string, number> = {};
    (events || []).forEach(e => {
        const c = e.country || "Unknown";
        countryCounts[c] = (countryCounts[c] ?? 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(t => t[0]);

    const locationTrendMap: Record<string, any> = {};
    dates.forEach(d => {
        locationTrendMap[d] = { date: d };
        topCountries.forEach(c => locationTrendMap[d][c] = 0);
    });

    (events || []).forEach(e => {
        const day = e.created_at.slice(0, 10);
        const feat = e.feature;
        const c = e.country || "Unknown";

        if (activityTrendMap[day]) {
            activityTrendMap[day].total++;
            if (activityTrendMap[day][feat] !== undefined) {
                activityTrendMap[day][feat]++;
            }
        }

        if (locationTrendMap[day] && topCountries.includes(c)) {
            locationTrendMap[day][c]++;
        }
    });

    return NextResponse.json({
        userGrowthTrend,
        activityTrend: Object.values(activityTrendMap),
        locationTrend: Object.values(locationTrendMap),
        topCountries,
    });
}

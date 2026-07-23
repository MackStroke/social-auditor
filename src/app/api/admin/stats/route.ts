import { NextResponse } from "next/server";
import { verifyAdminUser, createAdminClient } from "@/lib/admin-auth";

export async function GET() {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const admin = createAdminClient();

    // Fetch all users (up to 1000)
    const { data: { users }, error: usersError } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const newUsersCount = (users ?? []).filter(u => u.created_at > thirtyDaysAgo).length;

    // Feature requests breakdown
    const { data: fr } = await admin
        .from("feature_requests")
        .select("type, created_at, title, id, user_id")
        .order("created_at", { ascending: false });

    // API keys count
    const { count: apiKeysCount } = await admin
        .from("api_key_registrations")
        .select("*", { count: "exact", head: true });

    // Map user IDs to emails for recent submissions
    const userMap: Record<string, string> = {};
    for (const u of users ?? []) {
        userMap[u.id] = u.email ?? "unknown";
    }

    const recentSubmissions = (fr ?? []).slice(0, 5).map(r => ({
        ...r,
        user_email: userMap[r.user_id] ?? "unknown",
    }));

    return NextResponse.json({
        totalUsers: users?.length ?? 0,
        newUsersCount,
        totalFeatureRequests: fr?.length ?? 0,
        featureCount: fr?.filter(r => r.type === "feature").length ?? 0,
        feedbackCount: fr?.filter(r => r.type === "feedback").length ?? 0,
        bugCount: fr?.filter(r => r.type === "bug").length ?? 0,
        apiKeysCount: apiKeysCount ?? 0,
        recentSubmissions,
    });
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser, createAdminClient } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const admin = createAdminClient();
    const type = request.nextUrl.searchParams.get("type"); // "feature" | "feedback" | "bug" | null
    const countOnly = request.nextUrl.searchParams.get("count_only") === "true";

    if (countOnly) {
        const { count, error } = await admin
            .from("feature_requests")
            .select('*', { count: 'exact', head: true })
            .eq("is_read", false);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ unreadCount: count || 0 });
    }

    let query = admin
        .from("feature_requests")
        .select("id, type, title, body, user_id, created_at, status, is_read")
        .order("is_read", { ascending: true }) // Unread first
        .order("created_at", { ascending: false });

    if (type && ["feature", "feedback", "bug"].includes(type)) {
        query = query.eq("type", type);
    }

    const { data: rows, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Enrich with user emails
    const userIds = [...new Set((rows ?? []).map(r => r.user_id))];
    const userEmails: Record<string, string> = {};

    if (userIds.length > 0) {
        // Batch lookup
        for (const uid of userIds) {
            const { data: { user: u } } = await admin.auth.admin.getUserById(uid);
            if (u) userEmails[uid] = u.email ?? "unknown";
        }
    }

    const enriched = (rows ?? []).map(r => ({
        ...r,
        user_email: userEmails[r.user_id] ?? "unknown",
    }));

    return NextResponse.json({ items: enriched });
}

export async function PATCH(request: NextRequest) {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await request.json();
        const { id, status, is_read } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const admin = createAdminClient();

        const updates: any = {};
        if (typeof status === 'string') updates.status = status;
        if (typeof is_read === 'boolean') updates.is_read = is_read;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No updates provided" }, { status: 400 });
        }

        const { error } = await admin
            .from("feature_requests")
            .update(updates)
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

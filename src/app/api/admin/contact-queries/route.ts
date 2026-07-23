import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser, createAdminClient } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const admin = createAdminClient();
    const countOnly = request.nextUrl.searchParams.get("count_only") === "true";

    if (countOnly) {
        const { count, error } = await admin
            .from("contact_queries")
            .select('*', { count: 'exact', head: true })
            .eq("is_read", false);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ unreadCount: count || 0 });
    }

    const { data, error } = await admin
        .from("contact_queries")
        .select("*")
        .order("is_read", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data });
}

export async function PATCH(request: NextRequest) {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await request.json();
        const { id, is_read, delete: shouldDelete } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const admin = createAdminClient();

        if (shouldDelete) {
            const { error } = await admin
                .from("contact_queries")
                .delete()
                .eq("id", id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        const { error } = await admin
            .from("contact_queries")
            .update({ is_read })
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

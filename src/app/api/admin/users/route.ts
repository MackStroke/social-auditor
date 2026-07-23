import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser, createAdminClient } from "@/lib/admin-auth";

// GET /api/admin/users — list all users
export async function GET() {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const admin = createAdminClient();

    const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get all api_key_registrations to mark who has a key
    const { data: keys } = await admin.from("api_key_registrations").select("user_id");
    const keyUserIds = new Set((keys ?? []).map(k => k.user_id));

    const result = (users ?? []).map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name ?? null,
        phone: u.user_metadata?.phone ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        provider: u.app_metadata?.provider ?? "email",
        has_api_key: keyUserIds.has(u.id),
    }));

    // Sort by newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ users: result });
}

// DELETE /api/admin/users?id=xxx — delete a specific user
export async function DELETE(request: NextRequest) {
    const adminUser = await verifyAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

    // Prevent self-deletion from admin panel
    if (id === adminUser.id) {
        return NextResponse.json({ error: "Cannot delete the admin account from the admin panel." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Clean up related data first
    await admin.from("api_key_registrations").delete().eq("user_id", id);
    await admin.from("feature_requests").delete().eq("user_id", id);

    // Delete auth user
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}

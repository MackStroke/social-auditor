import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/admin-auth";

// Simple endpoint for sidebar to check if current user is admin
// Returns { isAdmin: boolean } — called client-side to show/hide the admin link
export async function GET() {
    const user = await verifyAdminUser();
    return NextResponse.json({ isAdmin: !!user });
}

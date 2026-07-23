import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        if (!name || !email || !phone || !subject || !message) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const admin = createAdminClient();

        const { error } = await admin
            .from("contact_queries")
            .insert([{ name, email, phone, subject, message }]);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Contact form submission error:", e);
        return NextResponse.json({ error: e.message || "Failed to submit message" }, { status: 500 });
    }
}

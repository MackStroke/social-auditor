import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * POST /api/activity/track
 * Ingests a single activity event from the client.
 * Extracts user_id from the auth session and approximate location from headers.
 */
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: () => { },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { feature, metadata } = body;

        if (!feature) {
            return NextResponse.json({ error: "Missing feature" }, { status: 400 });
        }

        const validFeatures = ['audit', 'generate_copy', 'simulate', 'ab_test', 'page_view'];
        if (!validFeatures.includes(feature)) {
            return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
        }

        // Approximate location from common CDN / proxy headers
        const country = req.headers.get("x-vercel-ip-country")
            || req.headers.get("cf-ipcountry")
            || req.headers.get("x-country")
            || null;
        const city = req.headers.get("x-vercel-ip-city")
            || req.headers.get("x-city")
            || null;

        const { error } = await supabase.from("activity_events").insert({
            user_id: user.id,
            feature,
            metadata: metadata ?? {},
            country,
            city,
        });

        if (error) {
            console.error("Activity track insert error:", error);
            return NextResponse.json({ error: "Failed to track" }, { status: 500 });
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err: any) {
        console.error("Activity track error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

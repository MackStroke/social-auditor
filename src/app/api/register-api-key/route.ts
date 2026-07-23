import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// POST /api/register-api-key
// Body: { keyHash: string }
// Checks if keyHash is already registered to another user. If not, registers it.
export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    // Verify the requesting user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { keyHash } = body;

    if (!keyHash || typeof keyHash !== "string" || keyHash.length !== 64) {
        return NextResponse.json({ error: "Invalid key hash" }, { status: 400 });
    }

    // Check if this hash is already registered to a DIFFERENT user
    const { data: existingEntry, error: lookupError } = await supabase
        .from("api_key_registrations")
        .select("user_id")
        .eq("key_hash", keyHash)
        .maybeSingle();

    if (lookupError) {
        console.error("Lookup error:", lookupError);
        return NextResponse.json({ error: "Database lookup failed" }, { status: 500 });
    }

    if (existingEntry && existingEntry.user_id !== user.id) {
        // Key is already registered to another account
        return NextResponse.json(
            { error: "This API key is already registered to another account. Each key can only be used by one account." },
            { status: 409 }
        );
    }

    // Key is either unregistered or already belongs to this user — upsert
    const { error: upsertError } = await supabase
        .from("api_key_registrations")
        .upsert(
            { user_id: user.id, key_hash: keyHash, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
        );

    if (upsertError) {
        // If another user just registered this key (race condition), the unique constraint on key_hash will fire
        if (upsertError.code === "23505") {
            return NextResponse.json(
                { error: "This API key is already registered to another account." },
                { status: 409 }
            );
        }
        console.error("Upsert error:", upsertError);
        return NextResponse.json({ error: "Failed to register key" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// DELETE /api/register-api-key
// Removes the key registration for the current user (called when clearing the key)
export async function DELETE(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await supabase.from("api_key_registrations").delete().eq("user_id", user.id);

    return NextResponse.json({ success: true });
}

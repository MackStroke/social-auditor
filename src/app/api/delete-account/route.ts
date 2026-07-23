import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// DELETE /api/delete-account
// Calls the delete_current_user() Postgres RPC (SECURITY DEFINER).
// The function uses auth.uid() server-side so a user can ONLY delete themselves.
// No service role key required.
export async function DELETE() {
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

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call the SECURITY DEFINER RPC — runs with elevated DB privileges
    // but auth.uid() inside it is always scoped to the calling user.
    const { error } = await supabase.rpc("delete_current_user");

    if (error) {
        console.error("delete_current_user RPC error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

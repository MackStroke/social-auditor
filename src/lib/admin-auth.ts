import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Verifies the currently authenticated user is the configured admin.
 * Uses the ADMIN_EMAIL env var (server-side only) for comparison.
 * Returns the user object if admin, null otherwise.
 */
export async function verifyAdminUser() {
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
    if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
    return user;
}

/**
 * Creates a Supabase admin client with the service role key.
 * Used exclusively in server-side admin API routes — never in the browser.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

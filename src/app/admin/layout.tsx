"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

    if (!user) redirect("/auth");
    if (user.email !== process.env.ADMIN_EMAIL) redirect("/");

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-background-dark overflow-hidden text-slate-900 dark:text-slate-200">
            <AdminSidebar adminEmail={user.email ?? ""} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

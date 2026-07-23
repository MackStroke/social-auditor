import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfileUpdateForm from '@/components/ProfileUpdateForm'

export default async function ProfilePage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Format dates cleanly
    const accountCreated = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const lastSignIn = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Never';

    return (
        <div className="flex flex-col min-h-full">
            <header className="p-4 sm:p-6 lg:p-8 border-b border-white/5 bg-background-dark">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-black italic tracking-tight text-white"><span className="text-emerald-400">User</span> Profile</h1>
                </div>
            </header>

            <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full relative z-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Account Details</h2>
                    <p className="text-slate-400">Manage your Social Auditor authentication and session data.</p>
                </div>

                <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-8 border-b border-white/5 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                            {user.email ? user.email[0].toUpperCase() : (user.phone ? '📱' : 'U')}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                                {user.email || user.phone || 'Authenticated User'}
                            </h3>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1 rounded-full w-fit border border-emerald-500/20">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active Session
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Security Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                                    <div className="text-slate-400 text-sm mb-1 font-medium">Account ID (UUID)</div>
                                    <div className="text-white font-mono text-sm break-all">{user.id}</div>
                                </div>
                                <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                                    <div className="text-slate-400 text-sm mb-1 font-medium">Authentication Provider</div>
                                    <div className="text-white font-medium capitalize">{user.app_metadata.provider || 'Email / JWT'}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Activity Lifecycle</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-black/20 rounded-xl p-5 border border-white/5 flex items-start gap-4">
                                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary mt-0.5">
                                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm mb-0.5 font-medium">Member Since</div>
                                        <div className="text-white font-medium">{accountCreated}</div>
                                    </div>
                                </div>
                                <div className="bg-black/20 rounded-xl p-5 border border-white/5 flex items-start gap-4">
                                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary mt-0.5">
                                        <span className="material-symbols-outlined text-[20px]">history</span>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm mb-0.5 font-medium">Last Sign In</div>
                                        <div className="text-white font-medium">{lastSignIn}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editable User Metadata Form */}
                        <ProfileUpdateForm user={user} />
                    </div>
                </div>
            </div>
        </div>
    )
}

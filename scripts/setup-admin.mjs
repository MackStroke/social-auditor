import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=');
            if (idx !== -1) {
                const key = trimmed.substring(0, idx).trim();
                const val = trimmed.substring(idx + 1).trim();
                if (!process.env[key]) {
                    process.env[key] = val;
                }
            }
        }
    });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

if (!url || !serviceKey || !adminEmail) {
    console.error('❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or ADMIN_EMAIL in .env.local');
    process.exit(1);
}

const passwordArg = process.argv[2];
const password = passwordArg || 'Admin123!';

const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log(`\n🔍 Checking Super Admin status for: ${adminEmail}`);

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('❌ Error fetching users from Supabase:', error.message);
        process.exit(1);
    }

    const existingUser = data.users.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase());

    if (existingUser) {
        console.log(`👤 User found (ID: ${existingUser.id}). Resetting password...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true }
        );
        if (updateError) {
            console.error('❌ Error updating admin password:', updateError.message);
            process.exit(1);
        }
        console.log('✅ Super Admin password successfully updated!');
    } else {
        console.log(`➕ User not found. Creating new Super Admin account...`);
        const { error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: password,
            email_confirm: true,
        });
        if (createError) {
            console.error('❌ Error creating admin user:', createError.message);
            process.exit(1);
        }
        console.log('✅ Super Admin user successfully created!');
    }

    console.log('\n----------------------------------------');
    console.log(`🔑 Super Admin Credentials:`);
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${password}`);
    console.log(`   Login at: http://localhost:3000/auth`);
    console.log('----------------------------------------\n');
}

main();

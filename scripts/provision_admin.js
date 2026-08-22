/**
 * ShareByte Supabase Admin Provisioning Script (NodeJS)
 * ======================================================
 * Use this script with your SUPABASE_SERVICE_ROLE_KEY to provision a real Admin email.
 *
 * Environment variables:
 *   SUPABASE_URL=https://<your-project-id>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJKV1Qi...
 *
 * Usage:
 *   node scripts/provision_admin.js indumedagam@gmail.com "Indu Admin"
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log('⚠️ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables required.');
  console.log('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/provision_admin.js <admin_email>');
  process.exit(1);
}

const adminEmail = process.argv[2];
const adminName = process.argv[3] || 'System Administrator';

if (!adminEmail || !adminEmail.includes('@')) {
  console.error('❌ Error: Please provide a valid admin email address.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function provisionAdminAccount() {
  console.log(`🔍 Provisioning ADMIN account for ${adminEmail}...`);

  // 1. Create or fetch Auth User
  const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    email_confirm: true,
    user_metadata: { full_name: adminName }
  });

  let userId;
  if (authErr) {
    if (authErr.message.includes('already exists')) {
      console.log('ℹ️ Auth user already exists. Fetching user profile...');
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const userObj = usersData.users.find(u => u.email === adminEmail);
      if (!userObj) {
        console.error('❌ Error locating existing user.');
        process.exit(1);
      }
      userId = userObj.id;
    } else {
      console.error('❌ Auth error:', authErr.message);
      process.exit(1);
    }
  } else {
    userId = authUser.user.id;
  }

  // 2. Upsert profile in PostgreSQL `profiles` table with role='ADMIN' & account_status='ACTIVE'
  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      email: adminEmail,
      full_name: adminName,
      role: 'ADMIN',
      account_status: 'ACTIVE',
      email_verified: true,
      updated_at: new Date().toISOString()
    });

  if (profileErr) {
    console.error('❌ Error creating profiles record:', profileErr.message);
    process.exit(1);
  }

  console.log(`✅ SUCCESS: Admin account '${adminEmail}' successfully provisioned as ADMIN (ACTIVE).`);
}

provisionAdminAccount();

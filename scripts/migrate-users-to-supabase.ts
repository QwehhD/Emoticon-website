#!/usr/bin/env node

/**
 * Migrate hardcoded users to Supabase
 * This script inserts the initial allowed users into the Supabase database
 * 
 * Usage:
 *   npx tsx scripts/migrate-users-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

// Initial users to migrate
const initialUsers = [
  { uid: 'E240B8C3', nama: 'Dika' },
  { uid: 'E240B8C4', nama: 'User 2' },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateUsers() {
  console.log('🔄 Starting migration of users to Supabase...');

  for (const user of initialUsers) {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('allowed_users')
        .select('id')
        .eq('uid', user.uid)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking user ${user.uid}:`, checkError);
        continue;
      }

      if (existingUser) {
        console.log(`⏭️  User already exists: ${user.uid} (${user.nama})`);
        continue;
      }

      // Insert user
      const { error: insertError } = await supabase
        .from('allowed_users')
        .insert([user]);

      if (insertError) {
        console.error(`❌ Failed to insert user ${user.uid}:`, insertError);
        continue;
      }

      console.log(`✅ Migrated user: ${user.uid} (${user.nama})`);
    } catch (error) {
      console.error(`❌ Exception migrating user ${user.uid}:`, error);
    }
  }

  console.log('✅ Migration complete!');
  process.exit(0);
}

migrateUsers().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

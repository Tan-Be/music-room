// Database Migration Script via Supabase REST API
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key:', supabaseServiceKey.substring(0, 20) + '...\n');

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function executeMigration() {
  console.log('🚀 Starting database migration...\n');
  
  const sqlPath = path.join(__dirname, 'restore_music_room.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('📝 Executing SQL script...\n');
  
  try {
    // Try to execute the entire script at once
    const result = await executeSQL(sql);
    console.log('✅ Migration completed successfully!');
    console.log(result);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\n⚠️  Supabase REST API does not support arbitrary SQL execution.');
    console.log('📋 Please execute the migration manually:');
    console.log('   1. Open: ' + supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '') + '/sql/new');
    console.log('   2. Copy contents of restore_music_room.sql');
    console.log('   3. Paste into SQL Editor and click Run');
  }
}

executeMigration();

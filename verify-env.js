// Quick script to verify .env.local file
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

console.log('🔍 Checking .env.local file...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file does not exist!');
  console.log('📝 Please create it in the xero-crm folder\n');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

let urlFound = false;
let keyFound = false;
let urlValue = '';
let keyValue = '';

lines.forEach((line, index) => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    urlFound = true;
    urlValue = line.split('=')[1]?.trim() || '';
    console.log(`✓ Found NEXT_PUBLIC_SUPABASE_URL on line ${index + 1}`);
    if (urlValue) {
      console.log(`  Value: ${urlValue.substring(0, 50)}...`);
    } else {
      console.log(`  ⚠️  Value is EMPTY`);
    }
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    keyFound = true;
    keyValue = line.split('=')[1]?.trim() || '';
    console.log(`✓ Found NEXT_PUBLIC_SUPABASE_ANON_KEY on line ${index + 1}`);
    if (keyValue) {
      console.log(`  Value: ${keyValue.substring(0, 30)}...`);
    } else {
      console.log(`  ⚠️  Value is EMPTY`);
    }
  }
});

console.log('\n📊 Summary:');
if (urlFound && urlValue) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL: Set');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: Missing or Empty');
}

if (keyFound && keyValue) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Set');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Missing or Empty');
}

if (urlValue && keyValue) {
  console.log('\n✅ All Supabase variables are configured!');
  console.log('💡 Make sure to restart your dev server: npm run dev');
} else {
  console.log('\n⚠️  Supabase variables need to be configured.');
  console.log('📝 Edit .env.local and add your Supabase credentials.');
  console.log('📖 See ENV_SETUP.md for instructions.');
}


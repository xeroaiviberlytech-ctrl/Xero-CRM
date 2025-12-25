# Quick Supabase Setup

## Your `.env.local` file is missing Supabase credentials!

I can see your `.env.local` file has empty values for:
- `NEXT_PUBLIC_SUPABASE_URL=` (empty)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=` (empty)

## Steps to Fix:

### 1. Get Your Supabase Credentials

1. Go to: https://app.supabase.com
2. Select your project (or create one)
3. Click **Settings** (gear icon) → **API**
4. You'll see:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon public** key (a long JWT token)

### 2. Update Your `.env.local` File

Open `xero-crm/.env.local` and fill in the values:

```env
# Connect to Supabase via connection pooling (runtime)
DATABASE_URL="postgresql://postgres.ssodjbheppddbkklzpbb:Viberly%40001@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for migrations
DIRECT_URL="postgresql://postgres.ssodjbheppddbkklzpbb:Viberly%40001@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# ⬇️ FILL THESE IN ⬇️
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:**
- ✅ NO quotes around the URL and keys
- ✅ NO spaces around the `=` sign
- ✅ Copy the exact values from Supabase dashboard

### 3. Restart Your Dev Server

After saving `.env.local`:
1. Stop the server (press `Ctrl+C` in terminal)
2. Run `npm run dev` again
3. The notification should disappear!

### Example of What It Should Look Like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eqajfcxxiwpfpmttrfra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYWpmY3h4aXdwZm10dHJmcmEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.actual-key-here
```

## Still Having Issues?

1. Check browser console (F12) for detailed errors
2. Verify the file is saved as `.env.local` (not `.env.local.txt`)
3. Make sure you're in the `xero-crm` folder
4. Restart your dev server after changes


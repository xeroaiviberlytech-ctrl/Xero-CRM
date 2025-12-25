# Fix Supabase Configuration Issue

## The Problem
Your `.env.local` file shows empty values even though you say they're filled in. This usually means:

1. **The file wasn't saved properly** - Make sure you click Save (Ctrl+S)
2. **Formatting issues** - Quotes, spaces, or special characters
3. **Dev server needs restart** - Next.js only reads env vars on startup

## Quick Fix Steps:

### Step 1: Verify Your .env.local File

Open `xero-crm/.env.local` and make sure lines 7-8 look EXACTLY like this:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

**CRITICAL:**
- ❌ NO quotes: `NEXT_PUBLIC_SUPABASE_URL="https://..."` ← WRONG
- ✅ NO quotes: `NEXT_PUBLIC_SUPABASE_URL=https://...` ← CORRECT
- ❌ NO spaces: `NEXT_PUBLIC_SUPABASE_URL = https://...` ← WRONG  
- ✅ NO spaces: `NEXT_PUBLIC_SUPABASE_URL=https://...` ← CORRECT
- ✅ Values should start immediately after `=`

### Step 2: Save the File
- Press `Ctrl+S` to save
- Make sure the file is saved as `.env.local` (not `.env.local.txt`)

### Step 3: Restart Dev Server
1. Stop the server: Press `Ctrl+C` in the terminal
2. Start again: Run `npm run dev`
3. Wait for it to fully start

### Step 4: Check Debug Page
Visit: `http://localhost:3000/debug-env`

This page will show you exactly what Next.js sees.

## Still Not Working?

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for the "🔍 Supabase Configuration Check" message
4. It will tell you exactly what's missing

### Common Issues:

**Issue 1: File Location**
- Make sure `.env.local` is in `xero-crm/` folder
- Same folder as `package.json`

**Issue 2: Hidden Characters**
- Try deleting the lines and retyping them
- Don't copy-paste from Word or email (can add hidden chars)

**Issue 3: Wrong File**
- Make sure you're editing `.env.local` not `.env` or `.env.example`

**Issue 4: Caching**
- Delete `.next` folder: `rm -rf .next` (or delete it manually)
- Restart dev server

## Test Your Setup:

After fixing, visit: `http://localhost:3000/debug-env`

You should see:
- ✅ NEXT_PUBLIC_SUPABASE_URL: (your URL)
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: (first 50 chars of your key)

If you see ❌ EMPTY, the values still aren't being read correctly.


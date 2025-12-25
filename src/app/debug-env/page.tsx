"use client"

export default function DebugEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Environment Variables Debug</h1>
        
        <div className="glass-silver border-white/30 dark:border-slate-700/30 p-6 rounded-lg space-y-4">
          <div>
            <h2 className="font-semibold text-foreground mb-2">NEXT_PUBLIC_SUPABASE_URL:</h2>
            <div className="bg-white/20 dark:bg-slate-800/20 p-3 rounded font-mono text-sm break-all">
              {supabaseUrl || <span className="text-red-500">❌ EMPTY or NOT SET</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Length: {supabaseUrl?.length || 0} characters
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h2>
            <div className="bg-white/20 dark:bg-slate-800/20 p-3 rounded font-mono text-sm break-all">
              {supabaseAnonKey ? (
                <>
                  {supabaseAnonKey.substring(0, 50)}...
                  <span className="text-green-500"> (✓ Set - {supabaseAnonKey.length} chars)</span>
                </>
              ) : (
                <span className="text-red-500">❌ EMPTY or NOT SET</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Length: {supabaseAnonKey?.length || 0} characters
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded">
            <h3 className="font-semibold mb-2 text-foreground">Troubleshooting:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>If values show as empty, check your .env.local file</li>
              <li>Make sure file is saved as `.env.local` (not .env.local.txt)</li>
              <li>Restart dev server after changing .env.local</li>
              <li>No quotes around values in .env.local</li>
              <li>No spaces around the = sign</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


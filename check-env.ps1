# PowerShell script to check .env.local file
Write-Host "Checking .env.local file..." -ForegroundColor Cyan
Write-Host ""

$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "✓ File exists" -ForegroundColor Green
    Write-Host ""
    
    $lines = Get-Content $envFile
    $urlLine = $lines | Where-Object { $_ -match "^NEXT_PUBLIC_SUPABASE_URL=" }
    $keyLine = $lines | Where-Object { $_ -match "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" }
    
    if ($urlLine) {
        $urlValue = ($urlLine -split "=", 2)[1].Trim()
        if ($urlValue) {
            Write-Host "✓ NEXT_PUBLIC_SUPABASE_URL is set" -ForegroundColor Green
            Write-Host "  Value: $($urlValue.Substring(0, [Math]::Min(50, $urlValue.Length)))..." -ForegroundColor Gray
        } else {
            Write-Host "✗ NEXT_PUBLIC_SUPABASE_URL is EMPTY" -ForegroundColor Red
            Write-Host "  Line: $urlLine" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ NEXT_PUBLIC_SUPABASE_URL line not found" -ForegroundColor Red
    }
    
    Write-Host ""
    
    if ($keyLine) {
        $keyValue = ($keyLine -split "=", 2)[1].Trim()
        if ($keyValue) {
            Write-Host "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set" -ForegroundColor Green
            Write-Host "  Value: $($keyValue.Substring(0, [Math]::Min(30, $keyValue.Length)))..." -ForegroundColor Gray
        } else {
            Write-Host "✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is EMPTY" -ForegroundColor Red
            Write-Host "  Line: $keyLine" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ NEXT_PUBLIC_SUPABASE_ANON_KEY line not found" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor Cyan
    Write-Host "1. Open .env.local in your editor" -ForegroundColor White
    Write-Host "2. Make sure the lines look like this (NO quotes, NO spaces around =):" -ForegroundColor White
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co" -ForegroundColor Yellow
    Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -ForegroundColor Yellow
    Write-Host "3. Save the file" -ForegroundColor White
    Write-Host "4. Restart your dev server (npm run dev)" -ForegroundColor White
    
} else {
    Write-Host "✗ File does not exist!" -ForegroundColor Red
}


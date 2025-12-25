# Fix Database Connection Script
# This script helps you update your DATABASE_URL with proper password encoding

Write-Host "=== Database Connection Fix ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$envFile = ".env"
$envLocalFile = ".env.local"

$targetFile = $null
if (Test-Path $envLocalFile) {
    $targetFile = $envLocalFile
    Write-Host "Found: .env.local" -ForegroundColor Green
} elseif (Test-Path $envFile) {
    $targetFile = $envFile
    Write-Host "Found: .env" -ForegroundColor Green
} else {
    Write-Host "No .env or .env.local file found!" -ForegroundColor Red
    Write-Host "Please create one first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Current DATABASE_URL:" -ForegroundColor Yellow
$currentUrl = Get-Content $targetFile | Select-String "DATABASE_URL" | Select-Object -First 1
Write-Host $currentUrl -ForegroundColor Gray
Write-Host ""

# Check if password needs encoding
if ($currentUrl -match "Viberly@001") {
    Write-Host "⚠️  ISSUE FOUND: Password contains '@' symbol that needs URL encoding!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The password 'Viberly@001' must be encoded as 'Viberly%40001'" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=== Connection String Options ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Connection Pooler (RECOMMENDED for runtime)" -ForegroundColor Green
Write-Host "  - Better performance" -ForegroundColor Gray
Write-Host "  - No IP whitelisting needed" -ForegroundColor Gray
Write-Host "  - Port 6543" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Direct Connection (for migrations)" -ForegroundColor Yellow
Write-Host "  - May require IP whitelisting" -ForegroundColor Gray
Write-Host "  - Port 5432" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to Supabase Dashboard: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to Settings → Database" -ForegroundColor White
Write-Host "4. Find 'Connection string' → 'Connection pooling'" -ForegroundColor White
Write-Host "5. Copy the 'Transaction mode' connection string" -ForegroundColor White
Write-Host ""
Write-Host "Then update your $targetFile file with:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Runtime connection (via pooler)" -ForegroundColor Gray
Write-Host 'DATABASE_URL="postgresql://postgres.ssodjbheppddbkklzpbb:Viberly%40001@[POOLER_HOST]:6543/postgres?pgbouncer=true"' -ForegroundColor Green
Write-Host ""
Write-Host "# Direct connection (for migrations)" -ForegroundColor Gray
Write-Host 'DIRECT_URL="postgresql://postgres.ssodjbheppddbkklzpbb:Viberly%40001@db.ssodjbheppddbkklzpbb.supabase.co:5432/postgres"' -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Replace [POOLER_HOST] with your actual pooler host from Supabase!" -ForegroundColor Red
Write-Host "   Example: aws-0-ap-south-1.pooler.supabase.com" -ForegroundColor Gray
Write-Host ""
Write-Host "After updating, run:" -ForegroundColor Cyan
Write-Host "  npm run prisma:generate" -ForegroundColor White
Write-Host "  npx prisma db pull" -ForegroundColor White
Write-Host ""


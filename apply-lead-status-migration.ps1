# Script to apply lead status migration
# This updates existing lead statuses from old values to hot/warm/cold

Write-Host "Applying lead status migration..." -ForegroundColor Cyan

# Read the migration SQL
$migrationSQL = Get-Content "prisma\migrations\20260115155410_update_lead_status\migration.sql" -Raw

# Execute using Prisma
Write-Host "Executing migration SQL..." -ForegroundColor Yellow
$migrationSQL | npx prisma db execute --stdin

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration applied successfully!" -ForegroundColor Green
    Write-Host "All lead statuses have been updated to hot/warm/cold" -ForegroundColor Green
} else {
    Write-Host "Migration failed. Please check the error above." -ForegroundColor Red
}

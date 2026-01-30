# PowerShell скрипт для настройки GitHub OAuth
# Использование: .\scripts\setup-github-oauth.ps1 "CLIENT_ID" "CLIENT_SECRET"

param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientSecret
)

Write-Host "🚀 Настройка GitHub OAuth..." -ForegroundColor Green

# Проверяем существование .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Файл .env.local не найден!" -ForegroundColor Red
    exit 1
}

try {
    # Читаем содержимое .env.local
    $envContent = Get-Content ".env.local" -Raw
    
    # Обновляем GitHub OAuth данные
    $envContent = $envContent -replace "NEXT_PUBLIC_GITHUB_CLIENT_ID=.*", "NEXT_PUBLIC_GITHUB_CLIENT_ID=$ClientId"
    $envContent = $envContent -replace "GITHUB_CLIENT_ID=.*", "GITHUB_CLIENT_ID=$ClientId"
    $envContent = $envContent -replace "GITHUB_CLIENT_SECRET=.*", "GITHUB_CLIENT_SECRET=$ClientSecret"
    
    # Записываем обновленный файл
    Set-Content ".env.local" $envContent -NoNewline
    
    Write-Host "✅ GitHub OAuth данные успешно обновлены!" -ForegroundColor Green
    Write-Host "📋 Client ID: $ClientId" -ForegroundColor Cyan
    Write-Host "🔒 Client Secret: $($ClientSecret.Substring(0, 10))..." -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "🔄 Перезапустите сервер разработки:" -ForegroundColor Yellow
    Write-Host "   Ctrl+C в терминале с pnpm dev" -ForegroundColor Gray
    Write-Host "   Затем: pnpm dev" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Ошибка при обновлении .env.local: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
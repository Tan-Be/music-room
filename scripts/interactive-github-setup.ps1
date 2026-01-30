# Интерактивная настройка GitHub OAuth
# Запуск: .\scripts\interactive-github-setup.ps1

Write-Host "🔑 Настройка реального GitHub OAuth приложения" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Проверяем, что мы в правильной директории
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Файл .env.local не найден!" -ForegroundColor Red
    Write-Host "   Убедитесь, что вы в корне проекта Music Room" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Шаг 1: Создание GitHub OAuth приложения" -ForegroundColor Cyan
Write-Host "   1. Откройте: https://github.com/settings/developers" -ForegroundColor Gray
Write-Host "   2. Нажмите 'New OAuth App'" -ForegroundColor Gray
Write-Host "   3. Заполните форму:" -ForegroundColor Gray
Write-Host "      Application name: Music Room Local Dev" -ForegroundColor Gray
Write-Host "      Homepage URL: http://localhost:3000" -ForegroundColor Gray
Write-Host "      Callback URL: http://localhost:3000/api/auth/callback/github" -ForegroundColor Gray
Write-Host "   4. Нажмите 'Register application'" -ForegroundColor Gray
Write-Host "   5. Скопируйте Client ID и сгенерируйте Client Secret" -ForegroundColor Gray
Write-Host ""

# Открываем GitHub в браузере
$openGitHub = Read-Host "Открыть GitHub Developer Settings в браузере? (y/n)"
if ($openGitHub -eq "y" -or $openGitHub -eq "Y") {
    Start-Process "https://github.com/settings/developers"
    Write-Host "✅ GitHub открыт в браузере" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Шаг 2: Ввод данных OAuth приложения" -ForegroundColor Cyan

# Запрашиваем Client ID
do {
    $clientId = Read-Host "Введите Client ID (например: Ov23liABC123DEF456)"
    if ($clientId -eq "" -or $clientId -eq "demo_client_id") {
        Write-Host "❌ Client ID не может быть пустым или demo значением!" -ForegroundColor Red
    }
} while ($clientId -eq "" -or $clientId -eq "demo_client_id")

# Запрашиваем Client Secret
do {
    $clientSecret = Read-Host "Введите Client Secret (например: ghs_1234567890abcdef...)" -MaskInput
    if ($clientSecret -eq "" -or $clientSecret.Length -lt 20) {
        Write-Host "❌ Client Secret должен быть не менее 20 символов!" -ForegroundColor Red
    }
} while ($clientSecret -eq "" -or $clientSecret.Length -lt 20)

Write-Host ""
Write-Host "📋 Шаг 3: Обновление конфигурации" -ForegroundColor Cyan

try {
    # Читаем и обновляем .env.local
    $envContent = Get-Content ".env.local" -Raw
    
    $envContent = $envContent -replace "NEXT_PUBLIC_GITHUB_CLIENT_ID=.*", "NEXT_PUBLIC_GITHUB_CLIENT_ID=$clientId"
    $envContent = $envContent -replace "GITHUB_CLIENT_ID=.*", "GITHUB_CLIENT_ID=$clientId"
    $envContent = $envContent -replace "GITHUB_CLIENT_SECRET=.*", "GITHUB_CLIENT_SECRET=$clientSecret"
    
    Set-Content ".env.local" $envContent -NoNewline
    
    Write-Host "✅ Конфигурация обновлена успешно!" -ForegroundColor Green
    Write-Host "   Client ID: $clientId" -ForegroundColor Gray
    Write-Host "   Client Secret: $($clientSecret.Substring(0, 10))..." -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Ошибка при обновлении .env.local: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Шаг 4: Перезапуск сервера" -ForegroundColor Cyan
Write-Host "   Остановите текущий сервер (Ctrl+C) и запустите заново:" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor Yellow

Write-Host ""
Write-Host "🎉 Настройка завершена!" -ForegroundColor Green
Write-Host "   Теперь GitHub OAuth будет работать полноценно" -ForegroundColor Gray
Write-Host "   Протестируйте на: http://localhost:3000/auth/signin" -ForegroundColor Gray

Write-Host ""
$testNow = Read-Host "Открыть страницу входа для тестирования? (y/n)"
if ($testNow -eq "y" -or $testNow -eq "Y") {
    Start-Process "http://localhost:3000/auth/signin"
    Write-Host "✅ Страница входа открыта в браузере" -ForegroundColor Green
}
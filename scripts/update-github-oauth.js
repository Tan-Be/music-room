#!/usr/bin/env node

/**
 * Скрипт для обновления GitHub OAuth данных в .env.local
 * Использование: node scripts/update-github-oauth.js CLIENT_ID CLIENT_SECRET
 */

const fs = require('fs');
const path = require('path');

function updateGitHubOAuth(clientId, clientSecret) {
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    // Читаем текущий .env.local
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Обновляем GitHub OAuth данные
    envContent = envContent.replace(
      /NEXT_PUBLIC_GITHUB_CLIENT_ID=.*/,
      `NEXT_PUBLIC_GITHUB_CLIENT_ID=${clientId}`
    );
    
    envContent = envContent.replace(
      /GITHUB_CLIENT_ID=.*/,
      `GITHUB_CLIENT_ID=${clientId}`
    );
    
    envContent = envContent.replace(
      /GITHUB_CLIENT_SECRET=.*/,
      `GITHUB_CLIENT_SECRET=${clientSecret}`
    );
    
    // Записываем обновленный файл
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ GitHub OAuth данные успешно обновлены в .env.local');
    console.log(`📋 Client ID: ${clientId}`);
    console.log(`🔒 Client Secret: ${clientSecret.substring(0, 10)}...`);
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении .env.local:', error.message);
    process.exit(1);
  }
}

// Проверяем аргументы командной строки
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Использование: node scripts/update-github-oauth.js CLIENT_ID CLIENT_SECRET');
  console.log('Пример: node scripts/update-github-oauth.js Ov23liABC123DEF456 ghs_1234567890abcdef...');
  process.exit(1);
}

const [clientId, clientSecret] = args;
updateGitHubOAuth(clientId, clientSecret);
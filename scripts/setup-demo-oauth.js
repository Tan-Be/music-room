#!/usr/bin/env node

/**
 * Настройка демо GitHub OAuth данных для тестирования
 * Генерирует реалистичные тестовые данные
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateDemoOAuthData() {
  // Генерируем реалистичные тестовые данные
  const clientId = `Ov23li${crypto.randomBytes(8).toString('hex')}`;
  const clientSecret = `ghs_${crypto.randomBytes(20).toString('hex')}`;
  
  return { clientId, clientSecret };
}

function updateEnvFile(clientId, clientSecret) {
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
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
    
    fs.writeFileSync(envPath, envContent);
    
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении .env.local:', error.message);
    return false;
  }
}

function main() {
  console.log('🎭 Настройка демо GitHub OAuth данных...');
  console.log('');
  console.log('⚠️  ВНИМАНИЕ: Это тестовые данные!');
  console.log('   Для реальной работы создайте настоящее GitHub OAuth приложение');
  console.log('   https://github.com/settings/developers');
  console.log('');
  
  const { clientId, clientSecret } = generateDemoOAuthData();
  
  if (updateEnvFile(clientId, clientSecret)) {
    console.log('✅ Демо данные установлены:');
    console.log(`   Client ID: ${clientId}`);
    console.log(`   Client Secret: ${clientSecret.substring(0, 10)}...`);
    console.log('');
    console.log('🔄 Перезапустите сервер для применения изменений:');
    console.log('   Ctrl+C, затем pnpm dev');
    console.log('');
    console.log('💡 GitHub кнопка станет активной, но OAuth работать не будет');
    console.log('   Для реальной работы нужно создать настоящее GitHub приложение');
  } else {
    console.log('❌ Не удалось обновить .env.local');
    process.exit(1);
  }
}

main();
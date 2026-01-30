#!/usr/bin/env node

/**
 * Автоматическое создание GitHub OAuth приложения через GitHub API
 * Требует GitHub Personal Access Token с scope 'write:org'
 */

const https = require('https');

async function createGitHubOAuthApp(token) {
  const appData = {
    name: 'Music Room Local Dev',
    url: 'http://localhost:3000',
    callback_url: 'http://localhost:3000/api/auth/callback/github',
    description: 'Music Room - платформа для совместного прослушивания музыки (локальная разработка)'
  };

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/user/applications',
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'Music-Room-Setup',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 201) {
            resolve(response);
          } else {
            reject(new Error(`GitHub API Error: ${response.message || data}`));
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(appData));
    req.end();
  });
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.argv[2];
  
  if (!token) {
    console.log('❌ GitHub Personal Access Token не найден!');
    console.log('');
    console.log('Использование:');
    console.log('  node scripts/create-github-oauth-app.js YOUR_GITHUB_TOKEN');
    console.log('  или установить переменную GITHUB_TOKEN');
    console.log('');
    console.log('Создать токен: https://github.com/settings/tokens');
    console.log('Требуемые права: write:org, read:user');
    process.exit(1);
  }

  try {
    console.log('🚀 Создание GitHub OAuth приложения...');
    
    const app = await createGitHubOAuthApp(token);
    
    console.log('✅ GitHub OAuth приложение создано успешно!');
    console.log('');
    console.log('📋 Данные приложения:');
    console.log(`   Name: ${app.name}`);
    console.log(`   Client ID: ${app.client_id}`);
    console.log(`   Client Secret: ${app.client_secret}`);
    console.log('');
    console.log('🔄 Обновляю .env.local...');
    
    // Обновляем .env.local
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env.local');
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(
      /NEXT_PUBLIC_GITHUB_CLIENT_ID=.*/,
      `NEXT_PUBLIC_GITHUB_CLIENT_ID=${app.client_id}`
    );
    
    envContent = envContent.replace(
      /GITHUB_CLIENT_ID=.*/,
      `GITHUB_CLIENT_ID=${app.client_id}`
    );
    
    envContent = envContent.replace(
      /GITHUB_CLIENT_SECRET=.*/,
      `GITHUB_CLIENT_SECRET=${app.client_secret}`
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env.local обновлен!');
    console.log('');
    console.log('🎉 Настройка завершена! Перезапустите сервер:');
    console.log('   Ctrl+C, затем pnpm dev');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    
    if (error.message.includes('Bad credentials')) {
      console.log('');
      console.log('💡 Проверьте GitHub токен:');
      console.log('   - Токен должен быть действительным');
      console.log('   - Требуемые права: write:org, read:user');
      console.log('   - Создать новый: https://github.com/settings/tokens');
    }
    
    process.exit(1);
  }
}

main();
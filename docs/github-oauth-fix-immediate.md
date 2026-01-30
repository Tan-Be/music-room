# 🔧 Немедленное исправление GitHub OAuth

## ❌ Текущая проблема

GitHub OAuth использует demo данные:
```
GITHUB_CLIENT_ID=demo_client_id
GITHUB_CLIENT_SECRET=f26fb6054d63fa3f01791e2b76b34279bf6e069f
```

При попытке входа пользователь получает 404 ошибку на GitHub.

## ✅ Решение (2 минуты)

### 1. Создать GitHub OAuth App

Перейти: https://github.com/settings/developers

**New OAuth App**:
- Application name: `Music Room Local`
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 2. Получить реальные данные

После создания приложения GitHub выдаст:
- Client ID (например: `Ov23liABC123DEF456`)
- Client Secret (нажать "Generate a new client secret")

### 3. Обновить .env.local

```bash
# Заменить demo данные на реальные
GITHUB_CLIENT_ID=Ov23liABC123DEF456
GITHUB_CLIENT_SECRET=ghs_реальный_секрет_от_github
```

### 4. Перезапустить сервер

```bash
# Сервер автоматически подхватит новые переменные
# Или перезапустить: Ctrl+C, затем pnpm dev
```

## 🧪 Тестирование

1. Открыть http://localhost:3000/auth/signin
2. Нажать "Войти через GitHub"
3. Должен открыться реальный GitHub OAuth экран
4. После авторизации - редирект обратно в приложение

## ⚡ Альтернативное решение (временное)

Если не хочется создавать GitHub App, можно временно отключить GitHub OAuth:

```typescript
// В src/app/api/auth/[...nextauth]/route.ts
const handler = NextAuth({
  providers: [
    // Временно закомментировать GitHub
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
  ],
  // ...
})
```

И скрыть кнопку в UI:

```typescript
// В src/components/auth/github-button.tsx
export function GitHubButton({ mode }: GitHubButtonProps) {
  // Временно вернуть null
  return null
  
  // Или показать заглушку
  return (
    <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
      GitHub OAuth временно отключен
    </div>
  )
}
```

## 🎯 Рекомендация

**Создать реальное GitHub OAuth приложение** - это займет 2 минуты и полностью решит проблему.
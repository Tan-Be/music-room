# 🌐 Настройка кастомного домена для Music Room

## 📋 Обзор настройки домена

### Варианты доменов:

1. **Vercel домен** (бесплатно): `music-room.vercel.app`
2. **Кастомный домен** (рекомендуется): `musicroom.com`
3. **Поддомен** (альтернатива): `app.yoursite.com`

---

## 🛒 Покупка домена

### Рекомендуемые регистраторы:

- **Namecheap** - доступные цены, хорошая поддержка
- **Cloudflare** - интеграция с CDN
- **GoDaddy** - популярный выбор
- **Google Domains** - простота использования

### Рекомендации по выбору:

- Короткое и запоминающееся имя
- `.com` домен предпочтительнее
- Избегайте дефисов и цифр
- Проверьте доступность в социальных сетях

---

## ⚙️ Настройка DNS в Vercel

### Шаг 1: Добавление домена в Vercel

1. Откройте Vercel Dashboard
2. Перейдите в Settings → Domains
3. Нажмите "Add Domain"
4. Введите ваш домен: `musicroom.com`

### Шаг 2: Настройка DNS записей

Vercel предоставит DNS записи для настройки:

#### Для корневого домена (musicroom.com):

```dns
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600
```

#### Для www поддомена:

```dns
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Шаг 3: Настройка у регистратора

В панели управления вашего регистратора:

1. Найдите раздел DNS Management
2. Добавьте записи из Vercel
3. Сохраните изменения

---

## 🔧 Альтернативная настройка через Cloudflare

### Преимущества Cloudflare:

- Бесплатный SSL сертификат
- CDN для ускорения загрузки
- DDoS защита
- Аналитика трафика

### Настройка:

1. Создайте аккаунт на [cloudflare.com](https://cloudflare.com)
2. Добавьте ваш домен
3. Измените nameservers у регистратора на Cloudflare
4. В Cloudflare DNS добавьте:
   ```dns
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   Proxy: Enabled (оранжевое облако)
   ```

---

## 🔒 SSL сертификат

### Автоматический SSL (Vercel):

- Vercel автоматически выдает Let's Encrypt сертификаты
- Обновление происходит автоматически
- Поддержка HTTP/2 и HTTP/3

### Проверка SSL:

```bash
# Проверка сертификата
curl -I https://musicroom.com

# Тест SSL
openssl s_client -connect musicroom.com:443
```

---

## 📧 Настройка email для домена

### Варианты email хостинга:

1. **Google Workspace** (рекомендуется)
2. **Microsoft 365**
3. **Zoho Mail** (бесплатный план)
4. **ProtonMail**

### Настройка MX записей (Google Workspace):

```dns
Type: MX
Name: @
Value: 1 aspmx.l.google.com
       5 alt1.aspmx.l.google.com
       5 alt2.aspmx.l.google.com
       10 alt3.aspmx.l.google.com
       10 alt4.aspmx.l.google.com
TTL: 3600
```

---

## 🔄 Редиректы и алиасы

### Настройка редиректов в vercel.json:

```json
{
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/app",
      "destination": "/rooms",
      "permanent": false
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Настройка поддоменов:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

---

## 🌍 Международные домены

### Поддержка разных регионов:

- `musicroom.com` - основной сайт
- `ru.musicroom.com` - русская версия
- `eu.musicroom.com` - европейский регион

### Настройка в Next.js:

```typescript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'ru', 'es', 'fr'],
    defaultLocale: 'en',
    domains: [
      {
        domain: 'musicroom.com',
        defaultLocale: 'en',
      },
      {
        domain: 'ru.musicroom.com',
        defaultLocale: 'ru',
      },
    ],
  },
}
```

---

## 📊 Мониторинг домена

### Инструменты мониторинга:

1. **UptimeRobot** - проверка доступности
2. **Pingdom** - мониторинг производительности
3. **StatusCake** - комплексный мониторинг

### Настройка мониторинга:

```javascript
// Простой health check endpoint
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  })
}
```

---

## 🔍 SEO оптимизация домена

### Настройка robots.txt:

```txt
# public/robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://musicroom.com/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /api/
```

### Sitemap генерация:

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://musicroom.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://musicroom.com/rooms',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: 'https://musicroom.com/profile',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
}
```

---

## 🚨 Устранение проблем

### Домен не работает:

1. **Проверьте DNS пропагацию**: `dig musicroom.com`
2. **Время пропагации**: до 48 часов
3. **Проверьте записи**: используйте DNS checker онлайн

### SSL ошибки:

1. **Смешанный контент**: убедитесь, что все ресурсы загружаются по HTTPS
2. **Неверный сертификат**: проверьте настройки в Vercel
3. **Кэш браузера**: очистите кэш и cookies

### Медленная загрузка:

1. **Включите Cloudflare CDN**
2. **Оптимизируйте изображения**
3. **Используйте сжатие gzip/brotli**

---

## ✅ Чек-лист настройки домена

### Базовая настройка:

- [ ] Домен куплен
- [ ] DNS записи настроены
- [ ] Домен добавлен в Vercel
- [ ] SSL сертификат активен
- [ ] Редиректы настроены

### Дополнительно:

- [ ] Email настроен
- [ ] Cloudflare подключен (опционально)
- [ ] Мониторинг настроен
- [ ] SEO оптимизация выполнена
- [ ] Поддомены настроены (при необходимости)

### Тестирование:

- [ ] Сайт открывается по новому домену
- [ ] HTTPS работает корректно
- [ ] Редиректы функционируют
- [ ] Email доставляется
- [ ] Мониторинг активен

---

## 📈 Аналитика домена

### Google Analytics 4:

```typescript
// src/lib/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}
```

### Yandex Metrica (для русской аудитории):

```html
<!-- В head секции -->
<script type="text/javascript">
  ;(function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        ;(m[i].a = m[i].a || []).push(arguments)
      }
    m[i].l = 1 * new Date()
    ;((k = e.createElement(t)),
      (a = e.getElementsByTagName(t)[0]),
      (k.async = 1),
      (k.src = r),
      a.parentNode.insertBefore(k, a))
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym')

  ym(XXXXXXXX, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  })
</script>
```

---

**🎯 Результат: Профессиональный домен с полной настройкой для production использования.**

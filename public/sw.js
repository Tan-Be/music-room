// Service Worker для Music Room PWA
const CACHE_NAME = 'music-room-v1'
const OFFLINE_URL = '/offline'

// Файлы для кэширования при установке
const STATIC_CACHE = ['/', '/offline', '/manifest.json']

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...')

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_CACHE)
    })
  )

  // Активировать новый SW сразу
  self.skipWaiting()
})

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...')

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  // Взять контроль над всеми клиентами
  self.clients.claim()
})

// Обработка запросов
self.addEventListener('fetch', event => {
  // Игнорируем не-GET запросы
  if (event.request.method !== 'GET') {
    return
  }

  // Игнорируем запросы к Supabase
  if (event.request.url.includes('supabase.co')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Клонируем ответ для кэша
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Если сеть недоступна, пытаемся взять из кэша
        return caches.match(event.request).then(response => {
          if (response) {
            return response
          }

          // Если это навигация, показываем offline страницу
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }

          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          })
        })
      })
  )
})

// Обработка сообщений от клиента
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

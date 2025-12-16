import '@testing-library/jest-dom'

// Настройка переменных окружения для тестов
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Мок для DOM API, которые не поддерживаются в jsdom
Object.defineProperty(window.Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
})

// Мок для Notification API
Object.defineProperty(window, 'Notification', {
  value: class MockNotification {
    static permission = 'default'
    static requestPermission = jest.fn(() => Promise.resolve('granted'))
    constructor(title: string, options?: NotificationOptions) {
      // Mock implementation
    }
    close = jest.fn()
    onclick = jest.fn()
  },
  writable: true,
})

// Мок для localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Мок для matchMedia (для responsive компонентов)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Мок для ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Мок для IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Подавление console.error для известных проблем в тестах
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Invalid Supabase URL') ||
       args[0].includes('Missing Supabase anon key') ||
       args[0].includes('Current URL value') ||
       args[0].includes('Current key value'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

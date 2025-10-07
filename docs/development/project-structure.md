# Структура проекта

## Общая структура

```
music-room/
├── docs/                 # Документация
│   ├── development/      # Документация для разработчиков
│   └── ...               # Другая документация
├── src/                  # Исходный код
│   ├── app/              # Next.js App Router страницы
│   ├── components/       # Компоненты React
│   ├── config/           # Конфигурационные файлы
│   ├── hooks/            # Пользовательские React хуки
│   ├── lib/              # Утилиты и библиотечные функции
│   ├── public/           # Статические файлы
│   ├── stores/           # Zustand хранилища
│   ├── styles/           # Глобальные стили
│   └── types/            # TypeScript типы
├── .eslintrc.json        # ESLint конфигурация
├── .prettierrc           # Prettier конфигурация
├── .prettierignore       # Файлы игнорируемые Prettier
├── jest.config.js        # Jest конфигурация
├── jest.setup.ts         # Jest настройки
├── next.config.js        # Next.js конфигурация
├── package.json          # Зависимости и скрипты
├── pnpm-lock.yaml        # Блокировка зависимостей
├── postcss.config.js     # PostCSS конфигурация
├── tailwind.config.ts    # Tailwind CSS конфигурация
├── tsconfig.json         # TypeScript конфигурация
└── README.md             # Основная документация
```

## Детали по директориям

### `/src/app`
Содержит страницы и маршруты Next.js App Router. Структура следует соглашениям Next.js 14.

### `/src/components`
Содержит React компоненты, организованные по функциональности:
- `ui/` - Базовые UI компоненты (кнопки, карточки и т.д.)
- `common/` - Общие компоненты, используемые на разных страницах
- `auth/` - Компоненты аутентификации
- `room/` - Компоненты комнаты

### `/src/hooks`
Пользовательские React хуки для повторного использования логики:
- [useTheme](file:///c:/Users/admin/Documents/verkin/music-room/src/hooks/useTheme.ts#L4-L24) - Управление темой приложения
- [useMediaQuery](file:///c:/Users/admin/Documents/verkin/music-room/src/hooks/useMediaQuery.ts#L4-L15) - Работа с медиа запросами
- [useLoading](file:///c:/Users/admin/Documents/verkin/music-room/src/hooks/useLoading.ts#L4-L13) - Управление состоянием загрузки
- [useLocalStorage](file:///c:/Users/admin/Documents/verkin/music-room/src/hooks/useLocalStorage.ts#L4-L32) - Работа с localStorage

### `/src/lib`
Утилиты и вспомогательные функции:
- [utils.ts](file:///c:/Users/admin/Documents/verkin/music-room/src/lib/utils.ts) - Общие утилиты (форматирование, хелперы)
- Другие вспомогательные модули

### `/src/types`
TypeScript типы и интерфейсы:
- [room.ts](file:///c:/Users/admin/Documents/verkin/music-room/src/types/room.ts) - Типы, связанные с комнатами
- [auth.ts](file:///c:/Users/admin/Documents/verkin/music-room/src/types/auth.ts) - Типы, связанные с аутентификацией

### `/src/config`
Конфигурационные файлы приложения:
- [app.ts](file:///c:/Users/admin/Documents/verkin/music-room/src/config/app.ts) - Основные настройки приложения

### `/docs`
Документация проекта:
- `development/` - Документация для разработчиков
- Другая документация проекта
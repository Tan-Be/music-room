# 🎨 Резервная копия текущего фона

**Дата сохранения:** 27 ноября 2025

## Текущая конфигурация

### Компоненты
- ✅ `AnimatedBackground` - включён
- ✅ Фиолетовые волны с эффектом свечения
- ✅ Плавающие музыкальные ноты
- ✅ Частицы для дополнительного эффекта

### Стили главной страницы

```tsx
// src/app/page.tsx
<main className="flex min-h-screen flex-col items-center p-4 md:p-8 relative">
  <AnimatedBackground />
  
  <div className="relative z-10 w-full items-center justify-between font-mono text-sm lg:flex mb-8">
    <p className="fixed left-0 top-0 flex w-full justify-center border-b border-border/50 bg-background/95 backdrop-blur-md pb-6 pt-8 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-card/95 lg:p-4 shadow-lg">
```

### Эффекты

1. **backdrop-blur-md** - размытие фона
2. **shadow-lg, shadow-xl** - тени
3. **hover:scale-105** - увеличение при наведении
4. **bg-card/95** - полупрозрачные карточки
5. **border-2** - двойные границы
6. **z-10** - правильное наложение слоёв

### Карточки

```tsx
// Статистика
<div className="relative z-10 w-full max-w-4xl mb-8">
  <div className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 rounded-xl border-2 border-primary/20 p-6 shadow-lg backdrop-blur-md bg-background/60">

// Поиск
<div className="relative z-10 w-full max-w-4xl mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 bg-background/80 backdrop-blur-md rounded-xl p-6 border border-border/50">

// Навигационные карточки
<div className="relative z-10 mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-5 lg:text-left gap-4">
  <a className="group rounded-xl border-2 border-primary/20 bg-card/95 backdrop-blur-md px-6 py-6 transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:scale-105 cursor-pointer">
```

### Кнопки

```tsx
// Основная кнопка
className="mt-4 md:mt-0 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"

// Outline кнопка
className="mt-4 md:mt-0 shadow-lg border-2 border-primary"

// Кнопка в пустом состоянии
className="shadow-lg"
```

### Пустое состояние

```tsx
<div className="flex flex-col items-center justify-center py-16 px-4 bg-card/95 backdrop-blur-md rounded-xl border-2 border-dashed border-muted-foreground/30">
  <div className="relative">
    <Icons.music className="h-20 w-20 text-primary mb-6 animate-pulse" />
    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
  </div>
```

## Как восстановить

Если нужно вернуть этот фон:

1. Убедитесь, что импортирован `AnimatedBackground`:
```tsx
import { AnimatedBackground } from '@/components/common/animated-background'
```

2. Добавьте в main:
```tsx
<main className="flex min-h-screen flex-col items-center p-4 md:p-8 relative">
  <AnimatedBackground />
```

3. Добавьте `relative z-10` ко всем контейнерам контента

4. Используйте эффекты:
   - `backdrop-blur-md` для размытия
   - `bg-card/95` для полупрозрачности
   - `shadow-lg` для теней
   - `hover:scale-105` для анимации

## Файлы

- `src/app/page.tsx` - главная страница
- `src/components/common/animated-background.tsx` - компонент фона

---

**Сохранено для быстрого восстановления** ✅

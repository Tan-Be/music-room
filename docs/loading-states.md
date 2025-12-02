# 🔄 Загрузочные состояния - Документация

## ✅ Реализовано

### 1. Skeleton Loaders

**Файл:** `src/components/ui/skeleton.tsx`

Базовый компонент для создания skeleton загрузчиков.

```typescript
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-full" />
```

**Готовые компоненты:** `src/components/common/skeleton-loaders.tsx`

- `RoomCardSkeleton` - для карточек комнат
- `TrackItemSkeleton` - для треков
- `ParticipantItemSkeleton` - для участников
- `ChatMessageSkeleton` - для сообщений чата
- `ProfileSkeleton` - для профиля

**Пример использования:**

```typescript
import { RoomCardSkeleton } from '@/components/common/skeleton-loaders'

{isLoading ? (
  <>
    <RoomCardSkeleton />
    <RoomCardSkeleton />
    <RoomCardSkeleton />
  </>
) : (
  rooms.map(room => <RoomCard key={room.id} room={room} />)
)}
```

### 2. Spinner

**Файл:** `src/components/ui/spinner.tsx`

Компонент спиннера для индикации загрузки.

**Размеры:**
- `sm` - маленький (16px)
- `md` - средний (32px)
- `lg` - большой (48px)

**Пример использования:**

```typescript
import { Spinner } from '@/components/ui/spinner'

<Button disabled={isLoading}>
  {isLoading && <Spinner size="sm" />}
  Сохранить
</Button>
```

### 3. Optimistic Updates

**Файл:** `src/hooks/use-optimistic.ts`

Хук для оптимистичных обновлений UI.

**Пример использования:**

```typescript
import { useOptimistic } from '@/hooks/use-optimistic'

const { state, isLoading, execute } = useOptimistic(initialTracks, {
  onSuccess: (result) => {
    toast.success('Трек добавлен')
  },
  onError: (error) => {
    toast.error('Ошибка добавления трека')
  },
})

const addTrack = async (track) => {
  await execute(
    [...state, track], // Оптимистичное значение
    async () => {
      // Реальный запрос
      const { data } = await supabase.from('tracks').insert([track])
      return data
    }
  )
}
```

### 4. Network Status

**Компонент:** `src/components/common/network-status.tsx`

Индикатор состояния сети с автоматическими уведомлениями.

**Хук:** `src/hooks/use-network-status.ts`

```typescript
import { useNetworkStatus } from '@/hooks/use-network-status'

const { isOnline, wasOffline } = useNetworkStatus()

{!isOnline && (
  <div>Нет подключения к интернету</div>
)}
```

## 📦 Интеграция

### В Layout

```typescript
// src/app/layout.tsx
import { NetworkStatus } from '@/components/common/network-status'

<body>
  {children}
  <NetworkStatus />
</body>
```

### В компонентах списков

```typescript
import { RoomCardSkeleton } from '@/components/common/skeleton-loaders'
import { Spinner } from '@/components/ui/spinner'

export function RoomsList() {
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <RoomCardSkeleton />
        <RoomCardSkeleton />
        <RoomCardSkeleton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {rooms.map(room => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
```

### В кнопках

```typescript
<Button onClick={handleSave} disabled={isLoading}>
  {isLoading && <Spinner size="sm" className="mr-2" />}
  {isLoading ? 'Сохранение...' : 'Сохранить'}
</Button>
```

### Optimistic Updates для голосования

```typescript
const { state: votes, execute } = useOptimistic(initialVotes)

const handleVote = async (trackId, value) => {
  await execute(
    votes + value, // Сразу показываем новое значение
    async () => {
      const { data } = await supabase
        .from('track_votes')
        .insert({ track_id: trackId, vote_value: value })
      return data.votes
    }
  )
}
```

## 🎨 Стилизация

### Skeleton

Использует `animate-pulse` и `bg-muted` из Tailwind.

Можно кастомизировать:
```typescript
<Skeleton className="h-4 w-full bg-primary/10" />
```

### Spinner

Использует `animate-spin` и цвет `border-primary`.

Можно изменить цвет:
```typescript
<Spinner className="border-blue-500" />
```

## 📊 Примеры использования

### 1. Загрузка комнат

```typescript
{isLoading ? (
  <div className="grid grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <RoomCardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="grid grid-cols-3 gap-4">
    {rooms.map(room => <RoomCard key={room.id} room={room} />)}
  </div>
)}
```

### 2. Загрузка треков

```typescript
{isLoading ? (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <TrackItemSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="space-y-2">
    {tracks.map(track => <TrackItem key={track.id} track={track} />)}
  </div>
)}
```

### 3. Кнопка с загрузкой

```typescript
<Button onClick={handleSubmit} disabled={isSubmitting}>
  {isSubmitting && <Spinner size="sm" className="mr-2" />}
  {isSubmitting ? 'Отправка...' : 'Отправить'}
</Button>
```

### 4. Оптимистичное добавление трека

```typescript
const addTrackOptimistic = async (track) => {
  await execute(
    [...tracks, { ...track, id: 'temp-' + Date.now() }],
    async () => {
      const { data } = await supabase.from('tracks').insert([track]).select()
      return [...tracks, data[0]]
    }
  )
}
```

## ✅ Чеклист

- [x] Skeleton компонент
- [x] Готовые Skeleton loaders для всех типов контента
- [x] Spinner компонент с разными размерами
- [x] Хук useOptimistic для оптимистичных обновлений
- [x] Network Status компонент
- [x] Хук useNetworkStatus
- [x] Документация

---

**Дата:** 28 ноября 2025  
**Статус:** ✅ Полностью реализовано

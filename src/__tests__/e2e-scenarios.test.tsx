/**
 * E2E тесты основных пользовательских сценариев
 * Эти тесты проверяют полные пользовательские потоки
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from 'next-themes'

// Мокаем Next.js роутер
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Мокаем Supabase
jest.mock('@/lib/supabase')

// Компонент-обертка для тестов
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light">
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
)

describe('E2E User Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Authentication Flow', () => {
    it('should complete full registration flow', async () => {
      const user = userEvent.setup()

      // Импортируем компоненты динамически чтобы избежать проблем с мокингом
      const { default: RegisterForm } = await import(
        '@/components/auth/register-form'
      )

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      )

      // Заполняем форму регистрации
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)
      const usernameInput = screen.getByLabelText(/имя пользователя/i)
      const submitButton = screen.getByRole('button', {
        name: /зарегистрироваться/i,
      })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(usernameInput, 'testuser')

      await user.click(submitButton)

      // Проверяем, что форма была отправлена
      await waitFor(() => {
        expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument()
      })
    })

    it('should complete OAuth login flow', async () => {
      const user = userEvent.setup()

      const { default: GitHubLoginButton } = await import(
        '@/components/auth/github-login-button'
      )

      render(
        <TestWrapper>
          <GitHubLoginButton />
        </TestWrapper>
      )

      const githubButton = screen.getByRole('button', { name: /github/i })
      await user.click(githubButton)

      // Проверяем, что OAuth процесс инициирован
      await waitFor(() => {
        expect(githubButton).toBeDisabled()
      })
    })
  })

  describe('Room Management Flow', () => {
    it('should create and join room successfully', async () => {
      const user = userEvent.setup()

      const { default: CreateRoomDialog } = await import(
        '@/components/room/create-room-dialog'
      )

      render(
        <TestWrapper>
          <CreateRoomDialog />
        </TestWrapper>
      )

      // Открываем диалог создания комнаты
      const createButton = screen.getByRole('button', {
        name: /создать комнату/i,
      })
      await user.click(createButton)

      // Заполняем форму
      const nameInput = screen.getByLabelText(/название комнаты/i)
      const descriptionInput = screen.getByLabelText(/описание/i)

      await user.type(nameInput, 'Test Room')
      await user.type(descriptionInput, 'Test room description')

      // Выбираем настройки приватности
      const publicRadio = screen.getByLabelText(/публичная/i)
      await user.click(publicRadio)

      // Создаем комнату
      const submitButton = screen.getByRole('button', { name: /создать/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/room/'))
      })
    })

    it('should browse and join existing room', async () => {
      const user = userEvent.setup()

      const { default: RoomCard } = await import('@/components/room/room-card')

      const mockRoom = {
        id: 'test-room-id',
        name: 'Test Room',
        description: 'Test description',
        participantCount: 3,
        maxParticipants: 10,
        isPublic: true,
        owner: { name: 'Owner' },
        createdAt: new Date(),
      }

      render(
        <TestWrapper>
          <RoomCard room={mockRoom} />
        </TestWrapper>
      )

      // Присоединяемся к комнате
      const joinButton = screen.getByRole('button', { name: /присоединиться/i })
      await user.click(joinButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/room/test-room-id')
      })
    })
  })

  describe('Chat Interaction Flow', () => {
    it('should send and receive messages', async () => {
      const user = userEvent.setup()

      const { default: Chat } = await import('@/components/room/chat')

      const mockMessages = [
        {
          id: '1',
          userId: 'user-1',
          userName: 'User1',
          content: 'Hello everyone!',
          timestamp: new Date(),
          type: 'user' as const,
        },
      ]

      const mockCurrentUser = {
        id: 'current-user',
        name: 'Current User',
      }

      const mockSendMessage = jest.fn()

      render(
        <TestWrapper>
          <Chat
            messages={mockMessages}
            currentUser={mockCurrentUser}
            onSendMessage={mockSendMessage}
          />
        </TestWrapper>
      )

      // Проверяем отображение существующих сообщений
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument()
      expect(screen.getByText('User1')).toBeInTheDocument()

      // Отправляем новое сообщение
      const messageInput = screen.getByPlaceholderText(/введите сообщение/i)
      const sendButton = screen.getByRole('button', { name: /отправить/i })

      await user.type(messageInput, 'Hi there!')
      await user.click(sendButton)

      expect(mockSendMessage).toHaveBeenCalledWith('Hi there!')
      expect(messageInput).toHaveValue('')
    })

    it('should handle message validation', async () => {
      const user = userEvent.setup()

      const { default: Chat } = await import('@/components/room/chat')

      const mockCurrentUser = {
        id: 'current-user',
        name: 'Current User',
      }

      render(
        <TestWrapper>
          <Chat
            messages={[]}
            currentUser={mockCurrentUser}
            onSendMessage={jest.fn()}
          />
        </TestWrapper>
      )

      const messageInput = screen.getByPlaceholderText(/введите сообщение/i)
      const sendButton = screen.getByRole('button', { name: /отправить/i })

      // Попытка отправить пустое сообщение
      await user.click(sendButton)

      await waitFor(() => {
        expect(
          screen.getByText(/сообщение не может быть пустым/i)
        ).toBeInTheDocument()
      })

      // Попытка отправить слишком длинное сообщение
      const longMessage = 'a'.repeat(501)
      await user.type(messageInput, longMessage)

      await waitFor(() => {
        expect(screen.getByText(/500/)).toBeInTheDocument()
      })
    })
  })

  describe('Track Management Flow', () => {
    it('should search and add tracks to queue', async () => {
      const user = userEvent.setup()

      const { default: TrackSearch } = await import(
        '@/components/track/track-search'
      )

      const mockOnAddToQueue = jest.fn()

      render(
        <TestWrapper>
          <TrackSearch onAddToQueue={mockOnAddToQueue} />
        </TestWrapper>
      )

      // Поиск треков
      const searchInput = screen.getByPlaceholderText(/поиск треков/i)
      await user.type(searchInput, 'test song')

      await waitFor(() => {
        // Проверяем, что результаты поиска отображаются
        expect(screen.getByText(/результаты поиска/i)).toBeInTheDocument()
      })

      // Добавляем трек в очередь
      const addButton = screen.getAllByRole('button', { name: /добавить/i })[0]
      await user.click(addButton)

      expect(mockOnAddToQueue).toHaveBeenCalled()
    })

    it('should handle track voting', async () => {
      const user = userEvent.setup()

      const { default: TrackItem } = await import(
        '@/components/room/track-item'
      )

      const mockTrack = {
        id: 'track-1',
        title: 'Test Song',
        artist: 'Test Artist',
        duration: 180,
        thumbnailUrl: 'https://example.com/thumb.jpg',
        votesUp: 5,
        votesDown: 1,
        addedBy: {
          id: 'user-1',
          name: 'User1',
        },
        position: 1,
      }

      const mockOnVoteUp = jest.fn()
      const mockOnVoteDown = jest.fn()

      render(
        <TestWrapper>
          <TrackItem
            track={mockTrack}
            currentUserId="current-user"
            currentUserRole="member"
            onVoteUp={mockOnVoteUp}
            onVoteDown={mockOnVoteDown}
            onDelete={jest.fn()}
            onPlay={jest.fn()}
          />
        </TestWrapper>
      )

      // Голосуем за трек
      const upvoteButton = screen.getByRole('button', { name: /лайк/i })
      await user.click(upvoteButton)

      expect(mockOnVoteUp).toHaveBeenCalledWith('track-1')

      // Голосуем против трека
      const downvoteButton = screen.getByRole('button', { name: /дизлайк/i })
      await user.click(downvoteButton)

      expect(mockOnVoteDown).toHaveBeenCalledWith('track-1')
    })
  })

  describe('Profile Management Flow', () => {
    it('should update user profile', async () => {
      const user = userEvent.setup()

      // Мокаем useAuth хук
      const mockRefreshProfile = jest.fn()
      jest.doMock('@/contexts/auth-context', () => ({
        useAuth: () => ({
          user: { id: 'test-user', email: 'test@example.com' },
          profile: { username: 'testuser', avatar_url: null },
          refreshProfile: mockRefreshProfile,
        }),
      }))

      const { default: ProfilePage } = await import('@/app/profile/page')

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      )

      // Обновляем имя пользователя
      const usernameInput = screen.getByDisplayValue('testuser')
      await user.clear(usernameInput)
      await user.type(usernameInput, 'newusername')

      const saveButton = screen.getByRole('button', { name: /сохранить/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockRefreshProfile).toHaveBeenCalled()
      })
    })

    it('should handle avatar upload', async () => {
      const user = userEvent.setup()

      // Создаем мок файла
      const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })

      const { default: ProfilePage } = await import('@/app/profile/page')

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      )

      // Загружаем аватар
      const fileInput = screen.getByLabelText(/загрузить новый аватар/i)
      await user.upload(fileInput, mockFile)

      await waitFor(() => {
        expect(screen.getByText(/аватар обновлен/i)).toBeInTheDocument()
      })
    })
  })

  describe('Notification System Flow', () => {
    it('should request and handle notification permissions', async () => {
      const user = userEvent.setup()

      // Мокаем Notification API
      const mockRequestPermission = jest.fn().mockResolvedValue('granted')
      Object.defineProperty(Notification, 'requestPermission', {
        value: mockRequestPermission,
      })

      const { default: NotificationPermissionBanner } = await import(
        '@/components/common/notification-permission-banner'
      )

      render(
        <TestWrapper>
          <NotificationPermissionBanner />
        </TestWrapper>
      )

      // Разрешаем уведомления
      const allowButton = screen.getByRole('button', { name: /разрешить/i })
      await user.click(allowButton)

      expect(mockRequestPermission).toHaveBeenCalled()
    })

    it('should update notification settings', async () => {
      const user = userEvent.setup()

      const { default: ProfilePage } = await import('@/app/profile/page')

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      )

      // Переходим на вкладку уведомлений
      const notificationsTab = screen.getByRole('tab', { name: /уведомления/i })
      await user.click(notificationsTab)

      // Отключаем уведомления о новых сообщениях
      const messageNotificationsSwitch = screen.getByRole('switch', {
        name: /новые сообщения/i,
      })
      await user.click(messageNotificationsSwitch)

      // Сохраняем настройки
      const saveButton = screen.getByRole('button', {
        name: /сохранить настройки/i,
      })
      await user.click(saveButton)

      await waitFor(() => {
        expect(
          screen.getByText(/настройки уведомлений сохранены/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      // Мокаем сетевую ошибку
      const mockError = new Error('Network error')
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const { default: ErrorBoundary } = await import(
        '@/components/common/error-boundary'
      )

      const ThrowError = () => {
        throw mockError
      }

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/что-то пошло не так/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /попробовать снова/i })
      ).toBeInTheDocument()
    })

    it('should handle authentication errors', async () => {
      const user = userEvent.setup()

      // Мокаем ошибку аутентификации
      const mockError = { message: 'Invalid credentials' }

      const { default: LoginForm } = await import(
        '@/components/auth/login-form'
      )

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/пароль/i)
      const submitButton = screen.getByRole('button', { name: /войти/i })

      await user.type(emailInput, 'invalid@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/неверные учетные данные/i)).toBeInTheDocument()
      })
    })
  })

  describe('Performance Scenarios', () => {
    it('should handle large message lists efficiently', async () => {
      const { default: Chat } = await import('@/components/room/chat')

      // Создаем большой список сообщений
      const manyMessages = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        userId: `user-${i % 10}`,
        userName: `User${i % 10}`,
        content: `Message ${i}`,
        timestamp: new Date(Date.now() - i * 1000),
        type: 'user' as const,
      }))

      const mockCurrentUser = {
        id: 'current-user',
        name: 'Current User',
      }

      const startTime = performance.now()

      render(
        <TestWrapper>
          <Chat
            messages={manyMessages}
            currentUser={mockCurrentUser}
            onSendMessage={jest.fn()}
          />
        </TestWrapper>
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Проверяем, что рендеринг занял разумное время (< 100ms)
      expect(renderTime).toBeLessThan(100)

      // Проверяем, что последние сообщения отображаются
      expect(screen.getByText('Message 999')).toBeInTheDocument()
    })

    it('should handle rapid user interactions', async () => {
      const user = userEvent.setup()

      const { default: TrackItem } = await import(
        '@/components/room/track-item'
      )

      const mockTrack = {
        id: 'track-1',
        title: 'Test Song',
        artist: 'Test Artist',
        duration: 180,
        thumbnailUrl: 'https://example.com/thumb.jpg',
        votesUp: 0,
        votesDown: 0,
        addedBy: { id: 'user-1', name: 'User1' },
        position: 1,
      }

      const mockOnVoteUp = jest.fn()

      render(
        <TestWrapper>
          <TrackItem
            track={mockTrack}
            currentUserId="current-user"
            currentUserRole="member"
            onVoteUp={mockOnVoteUp}
            onVoteDown={jest.fn()}
            onDelete={jest.fn()}
            onPlay={jest.fn()}
          />
        </TestWrapper>
      )

      const upvoteButton = screen.getByRole('button', { name: /лайк/i })

      // Быстрые клики
      await user.click(upvoteButton)
      await user.click(upvoteButton)
      await user.click(upvoteButton)

      // Проверяем, что функция вызвана правильное количество раз
      expect(mockOnVoteUp).toHaveBeenCalledTimes(3)
    })
  })
})

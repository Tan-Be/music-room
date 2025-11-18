import { render, screen, fireEvent } from '@testing-library/react'
import { Chat } from './chat'

// Мокаем next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Chat Component', () => {
  const mockUserMessages = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Alice',
      content: 'Hello everyone!',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      type: 'user' as const,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Bob',
      content: 'Hi Alice!',
      timestamp: new Date('2023-01-01T10:01:00Z'),
      type: 'user' as const,
    },
  ]

  const mockSystemMessages = [
    {
      id: '3',
      content: 'Alice присоединился к комнате',
      timestamp: new Date('2023-01-01T09:59:00Z'),
      type: 'system' as const,
    },
  ]

  const mockMessages = [...mockSystemMessages, ...mockUserMessages]

  const mockCurrentUser = {
    id: 'user1',
    name: 'Alice',
  }

  it('renders user messages correctly', () => {
    render(
      <Chat
        messages={mockUserMessages}
        currentUser={mockCurrentUser}
        onSendMessage={jest.fn()}
      />
    )

    expect(screen.getByText('Чат комнаты')).toBeInTheDocument()
    expect(screen.getByText('Hello everyone!')).toBeInTheDocument()
    expect(screen.getByText('Hi Alice!')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders system messages correctly', () => {
    render(
      <Chat
        messages={mockMessages}
        currentUser={mockCurrentUser}
        onSendMessage={jest.fn()}
      />
    )

    expect(
      screen.getByText('Alice присоединился к комнате')
    ).toBeInTheDocument()
  })

  it('displays typing indicator when isTyping is true', () => {
    render(
      <Chat
        messages={mockUserMessages}
        currentUser={mockCurrentUser}
        onSendMessage={jest.fn()}
        isTyping={true}
      />
    )

    expect(screen.getByText('Пользователь печатает')).toBeInTheDocument()
  })

  it('calls onSendMessage when form is submitted', () => {
    const mockSendMessage = jest.fn()

    render(
      <Chat
        messages={mockUserMessages}
        currentUser={mockCurrentUser}
        onSendMessage={mockSendMessage}
      />
    )

    const input = screen.getByPlaceholderText('Написать сообщение...')
    const button = screen.getByRole('button', { name: '' })

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(button)

    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('formats message times correctly', () => {
    const today = new Date()
    const todayMessages = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Alice',
        content: 'Today message',
        timestamp: today,
        type: 'user' as const,
      },
    ]

    render(
      <Chat
        messages={todayMessages}
        currentUser={mockCurrentUser}
        onSendMessage={jest.fn()}
      />
    )

    // Проверяем, что время отображается в правильном формате (только часы и минуты)
    const timeString = today.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    expect(screen.getByText(timeString)).toBeInTheDocument()
  })

  it('shows character count and limits message length', () => {
    render(
      <Chat
        messages={mockUserMessages}
        currentUser={mockCurrentUser}
        onSendMessage={jest.fn()}
      />
    )

    const input = screen.getByPlaceholderText('Написать сообщение...')

    // Проверяем, что отображается счетчик символов
    expect(screen.getByText('0/500')).toBeInTheDocument()

    // Вводим текст и проверяем обновление счетчика
    fireEvent.change(input, { target: { value: 'Test' } })
    expect(screen.getByText('4/500')).toBeInTheDocument()
  })

  it('shows error for empty message', () => {
    const mockSendMessage = jest.fn()

    render(
      <Chat
        messages={mockUserMessages}
        currentUser={mockCurrentUser}
        onSendMessage={mockSendMessage}
      />
    )

    const button = screen.getByRole('button', { name: '' })
    fireEvent.click(button)

    expect(
      screen.getByText('Сообщение не может быть пустым')
    ).toBeInTheDocument()
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('shows error for messages that are too long', () => {
    render(
      <Chat
        messages={mockUserMessages}
        currentUser={mockCurrentUser}
        onSendMessage={jest.fn()}
      />
    )

    const input = screen.getByPlaceholderText('Написать сообщение...')
    const longMessage = 'a'.repeat(501) // Больше лимита

    fireEvent.change(input, { target: { value: longMessage } })

    expect(
      screen.getByText('Сообщение слишком длинное (максимум 500 символов)')
    ).toBeInTheDocument()
  })
})

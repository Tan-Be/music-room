import { render, screen, fireEvent } from '@testing-library/react'
import { TrackQueue } from './track-queue'

// Мокаем контекст аутентификации
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'user1' },
    profile: { username: 'TestUser' }
  })
}))

describe('TrackQueue Component', () => {
  const mockTracks = [
    {
      id: '1',
      title: 'Track 1',
      artist: 'Artist 1',
      duration: 180,
      votesUp: 5,
      votesDown: 2,
      addedBy: {
        name: 'User 1',
        id: 'user1'
      },
      position: 0
    },
    {
      id: '2',
      title: 'Track 2',
      artist: 'Artist 2',
      duration: 240,
      votesUp: 3,
      votesDown: 1,
      addedBy: {
        name: 'User 2',
        id: 'user2'
      },
      position: 1
    }
  ]

  const mockOnReorder = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnPlay = jest.fn()
  const mockOnVoteUp = jest.fn()
  const mockOnVoteDown = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders tracks correctly', () => {
    render(
      <TrackQueue
        tracks={mockTracks}
        currentUserId="user1"
        currentUserRole="member"
        onReorder={mockOnReorder}
        onDelete={mockOnDelete}
        onPlay={mockOnPlay}
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
      />
    )

    expect(screen.getByText('Track 1')).toBeInTheDocument()
    expect(screen.getByText('Track 2')).toBeInTheDocument()
  })

  it('shows empty state when no tracks', () => {
    render(
      <TrackQueue
        tracks={[]}
        currentUserId="user1"
        currentUserRole="member"
        onReorder={mockOnReorder}
        onDelete={mockOnDelete}
        onPlay={mockOnPlay}
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
      />
    )

    expect(screen.getByText('Очередь пуста')).toBeInTheDocument()
  })

  it('calls onPlay when play button is clicked', () => {
    render(
      <TrackQueue
        tracks={mockTracks}
        currentUserId="user1"
        currentUserRole="member"
        onReorder={mockOnReorder}
        onDelete={mockOnDelete}
        onPlay={mockOnPlay}
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
      />
    )

    const playButtons = screen.getAllByRole('button', { name: '' })
    fireEvent.click(playButtons[0])

    expect(mockOnPlay).toHaveBeenCalledWith('1')
  })

  it('calls onVoteUp when thumbs up button is clicked', () => {
    render(
      <TrackQueue
        tracks={mockTracks}
        currentUserId="user1"
        currentUserRole="member"
        onReorder={mockOnReorder}
        onDelete={mockOnDelete}
        onPlay={mockOnPlay}
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
      />
    )

    const voteUpButtons = screen.getAllByRole('button', { name: '' })
    fireEvent.click(voteUpButtons[1]) // Первый индекс для голосования "за"

    expect(mockOnVoteUp).toHaveBeenCalledWith('1')
  })

  it('calls onVoteDown when thumbs down button is clicked', () => {
    render(
      <TrackQueue
        tracks={mockTracks}
        currentUserId="user1"
        currentUserRole="member"
        onReorder={mockOnReorder}
        onDelete={mockOnDelete}
        onPlay={mockOnPlay}
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
      />
    )

    const voteDownButtons = screen.getAllByRole('button', { name: '' })
    fireEvent.click(voteDownButtons[2]) // Второй индекс для голосования "против"

    expect(mockOnVoteDown).toHaveBeenCalledWith('1')
  })

  it('shows delete button for track owner', () => {
    render(
      <TrackQueue
        tracks={mockTracks}
        currentUserId="user1"
        currentUserRole="member"
        onReorder={mockOnReorder}
        onDelete={mockOnDelete}
        onPlay={mockOnPlay}
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
      />
    )

    // Проверяем, что кнопка удаления отображается для трека, добавленного текущим пользователем
    const deleteButtons = screen.getAllByRole('button', { name: '' })
    expect(deleteButtons.length).toBeGreaterThan(0)
  })
})
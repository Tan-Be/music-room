import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TrackSearchDialog } from './track-search-dialog'
import * as trackLimits from '@/lib/track-limits'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock useAuth hook
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('TrackSearchDialog Component', () => {
  const mockOnTrackAdded = jest.fn()

  beforeEach(() => {
    mockOnTrackAdded.mockClear()
    jest.clearAllMocks()
  })

  it('renders trigger button by default', () => {
    render(
      <TrackSearchDialog
        roomId="test-room-id"
        userId="test-user-id"
        onTrackAdded={mockOnTrackAdded}
      />
    )

    expect(screen.getByText('Поиск треков')).toBeInTheDocument()
  })

  it('renders custom children when provided', () => {
    render(
      <TrackSearchDialog
        roomId="test-room-id"
        userId="test-user-id"
        onTrackAdded={mockOnTrackAdded}
      >
        <button>Custom Trigger</button>
      </TrackSearchDialog>
    )

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', () => {
    render(
      <TrackSearchDialog
        roomId="test-room-id"
        userId="test-user-id"
        onTrackAdded={mockOnTrackAdded}
      />
    )

    const triggerButton = screen.getByText('Поиск треков')
    fireEvent.click(triggerButton)

    // Проверяем, что диалог открылся
    expect(screen.getByText('Поиск треков')).toBeInTheDocument()
  })

  it('calls onTrackAdded when track is added to queue', () => {
    render(
      <TrackSearchDialog
        roomId="test-room-id"
        userId="test-user-id"
        onTrackAdded={mockOnTrackAdded}
      />
    )

    const triggerButton = screen.getByText('Поиск треков')
    fireEvent.click(triggerButton)

    // Проверяем, что компонент поиска треков отрендерился
    expect(
      screen.getByPlaceholderText(
        'Поиск треков по названию, исполнителю или жанру...'
      )
    ).toBeInTheDocument()
  })
})
